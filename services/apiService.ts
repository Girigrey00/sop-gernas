
import { LibraryDocument, SopResponse, Product } from '../types';

// CHANGED: Use relative path to leverage Vite Proxy configured in vite.config.ts
// This resolves CORS issues by routing requests through the local dev server
const API_BASE_URL = '/api';

// Container SAS URL for direct upload
const AZURE_SAS_URL = "https://auranpunawlsa.blob.core.windows.net/cbg-knowledge-hub?sp=rawl&st=2025-11-28T17:25:15Z&se=2026-03-31T01:40:15Z&spr=https&sv=2024-11-04&sr=c&sig=YE9KebhPjaR8a4lsQXgIBWOxIx2tQg2x%2FpeFOmTGpNY%3D";

// Helper to handle API errors
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    return response.json();
};

// Stream Parser Class
class JsonStreamParser {
    private buffer = '';
    private isJson = false;
    private hasCheckJson = false;
    private inAnswer = false;
    private isEscaped = false;
    private answerDone = false;
    private citationsBuffer = '';
    
    constructor(
        private onToken: (text: string) => void,
        private onCitations: (citations: any) => void
    ) {}

    process(chunk: string) {
        // Initial Check: Is this a JSON stream?
        if (!this.hasCheckJson) {
            this.buffer += chunk;
            const trimmed = this.buffer.trimStart();
            if (trimmed.length === 0) return; 

            if (trimmed.startsWith('{')) {
                this.isJson = true;
                this.hasCheckJson = true;
                this.buffer = trimmed; // Keep trimmed buffer
            } else if (trimmed.length > 10) {
                // Not JSON, flush buffer as raw text
                this.isJson = false;
                this.hasCheckJson = true;
                this.onToken(this.buffer);
                this.buffer = '';
            }
            // If we detected JSON, we continue processing with the buffer
        } 
        
        if (!this.isJson && this.hasCheckJson) {
            this.onToken(chunk);
            return;
        }

        // JSON Parsing State Machine
        if (this.isJson) {
            // Append new chunk to buffer if we are searching for keys
            if (!this.inAnswer && !this.answerDone) {
                this.buffer += chunk;
                // Look for "answer": " pattern
                const match = this.buffer.match(/"answer"\s*:\s*"/);
                if (match) {
                    this.inAnswer = true;
                    const startIdx = (match.index || 0) + match[0].length;
                    const remaining = this.buffer.substring(startIdx);
                    this.buffer = ''; 
                    this.processStringContent(remaining);
                }
            } else if (this.inAnswer) {
                this.processStringContent(chunk);
            } else if (this.answerDone) {
                // Accumulate citations part
                this.citationsBuffer += chunk;
            }
        }
    }

    private processStringContent(text: string) {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            if (this.isEscaped) {
                // Unescape characters
                if (char === 'n') this.onToken('\n');
                else if (char === 't') this.onToken('\t');
                else if (char === 'r') { /* ignore carriage return */ }
                else if (char === '"') this.onToken('"');
                else if (char === '\\') this.onToken('\\');
                else this.onToken(char); 
                this.isEscaped = false;
            } else {
                if (char === '\\') {
                    this.isEscaped = true;
                } else if (char === '"') {
                    // End of answer string
                    this.inAnswer = false;
                    this.answerDone = true;
                    // The rest belongs to citations buffer
                    const remaining = text.substring(i + 1);
                    this.citationsBuffer += remaining;
                    return;
                } else {
                    this.onToken(char);
                }
            }
        }
    }

    finish() {
        if (this.citationsBuffer) {
            try {
                // Heuristic: Extract the content of "citations": { ... }
                // We assume the buffer ends with "}" or "}}".
                const startIdx = this.citationsBuffer.indexOf('{');
                if (startIdx !== -1) {
                    let attempt = this.citationsBuffer.substring(startIdx);
                    // Try removing trailing braces until it parses
                    // Limit attempts to avoid infinite loop
                    let attempts = 0;
                    while (attempt.length > 2 && attempts < 10) {
                        try {
                            const c = JSON.parse(attempt);
                            this.onCitations(c);
                            return;
                        } catch (e) {
                            attempt = attempt.substring(0, attempt.lastIndexOf('}'));
                        }
                        attempts++;
                    }
                }
            } catch (e) {
                console.warn("Failed to parse citations:", e);
            }
        }
    }
}

export const apiService = {
    // Check backend health
    checkHealth: async (): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE_URL}/health`);
            return res.ok;
        } catch (e) {
            console.error("Backend health check failed", e);
            return false;
        }
    },

    // --- Chat Endpoint (Streaming) ---
    chatInference: async (payload: { 
        question: string, 
        index_name?: string, 
        session_id?: string, 
        question_id?: string,
        product?: string,
        onToken: (token: string) => void,
        onComplete?: (citations?: any) => void,
        onError?: (error: string) => void
    }): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/inference/stream`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    question: payload.question,
                    index_name: payload.index_name,
                    session_id: payload.session_id,
                    question_id: payload.question_id,
                    product: payload.product
                })
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            if (!response.body) {
                throw new Error("ReadableStream not supported in this browser.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = '';

            console.log("--- Stream Started ---");

            // Instantiate Parser
            const parser = new JsonStreamParser(
                payload.onToken,
                (citations) => {
                    if (payload.onComplete) payload.onComplete(citations);
                }
            );

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonStr = trimmedLine.substring(6); 
                            const data = JSON.parse(jsonStr);

                            // 1. Direct Token (Raw Stream)
                            // If the backend streams the JSON structure as tokens, this logic handles it
                            if (data.token) {
                                parser.process(data.token);
                            }
                            
                            // 2. Fallback: Citations Object sent separately
                            if (data.citations) {
                                // If backend sends citations as separate event, pass it
                                if (payload.onComplete) payload.onComplete(data.citations);
                            }

                            // 3. Fallback: Full Answer Block
                            if (data.answer && !data.token) {
                                if (typeof data.answer === 'string') {
                                     // If answer starts with {, parser will catch it if passed as token
                                     // But here it is a full string.
                                     // Just emit it.
                                     if (!data.answer.trim().startsWith('{')) {
                                         payload.onToken(data.answer);
                                     } else {
                                         // If it is JSON, parse it?
                                         // Assuming standard text for legacy fallback
                                         payload.onToken(data.answer);
                                     }
                                }
                            }

                        } catch (e) {
                            console.warn("Failed to parse SSE JSON:", trimmedLine);
                        }
                    }
                }
            }
            
            // Finalize parser to catch any buffered citations
            parser.finish();
            
            console.log("--- Stream Completed ---");
            if (payload.onComplete) payload.onComplete();

        } catch (error: any) {
            console.error("Streaming Error:", error);
            if (payload.onError) payload.onError(error.message || "Stream failed");
        }
    },

    // --- Product Endpoints ---

    getProducts: async (): Promise<Product[]> => {
        const data = await handleResponse(await fetch(`${API_BASE_URL}/products`));
        const productsRaw = data.products || [];
        return productsRaw.map((p: any) => ({
            ...p,
            description: p.metadata?.product_description || p.description || 'No description available'
        }));
    },

    createProduct: async (product: { product_name: string, folder_name: string, product_description: string }): Promise<any> => {
        return handleResponse(await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        }));
    },

    deleteProduct: async (productName: string): Promise<any> => {
        return handleResponse(await fetch(`${API_BASE_URL}/products/${productName}`, {
            method: 'DELETE',
        }));
    },

    // --- Document Endpoints ---

    getDocuments: async (): Promise<LibraryDocument[]> => {
        const data = await handleResponse(await fetch(`${API_BASE_URL}/documents?limit=100`));
        return data.map((doc: any) => {
            const rawCategory = doc.category || 'General';
            let categoryDisplay = rawCategory;
            if (doc.generate_flow === true || (doc.metadata && doc.metadata.generate_flow === true)) {
                categoryDisplay = 'Process Definition';
            } else if (rawCategory === 'KnowledgeBase' || (doc.metadata && doc.metadata.category === 'KnowledgeBase')) {
                categoryDisplay = 'Policy Documents';
            } else if (['Policy', 'Procedure', 'Manual'].includes(rawCategory)) {
                categoryDisplay = 'Process Definition';
            }
            
            const latestLog = doc.logs && Array.isArray(doc.logs) && doc.logs.length > 0 
                ? doc.logs[doc.logs.length - 1].message 
                : null;

            return {
                id: doc._id || doc.id,
                sopName: doc.product_id || doc.file_name,
                documentName: doc.file_name,
                description: doc.summary || 'No description available',
                pageCount: doc.total_pages || doc.page_count || 0,
                totalPages: doc.total_pages || 0,
                uploadedBy: doc.uploaded_by || 'Unknown',
                uploadedDate: doc.start_time ? new Date(doc.start_time).toLocaleDateString() + ' ' + new Date(doc.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleDateString(),
                indexName: doc.index_name,
                status: doc.status,
                version: '1.0',
                rootFolder: doc.root_folder, 
                progressPercentage: doc.progress_percentage || 0,
                logs: doc.logs || [],
                latestLog: latestLog,
                categoryDisplay: categoryDisplay,
                metadata: {
                    linkedApp: 'ProcessHub', 
                    productId: doc.product_id,
                    category: doc.category,
                    generate_flow: doc.generate_flow,
                    index_name: doc.index_name
                }
            };
        });
    },

    uploadToAzure: async (file: File): Promise<string> => {
        const sasUrl = new URL(AZURE_SAS_URL);
        const fileName = encodeURIComponent(file.name);
        const realBlobUrl = `${sasUrl.origin}${sasUrl.pathname}/${fileName}${sasUrl.search}`;
        const isDev = import.meta.env.MODE === 'development';
        const uploadUrl = isDev 
            ? `/azure-blob${sasUrl.pathname}/${fileName}${sasUrl.search}` 
            : realBlobUrl;
        
        console.log(`Uploading to ${isDev ? 'Proxy' : 'Direct'} URL:`, uploadUrl);

        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': file.type || 'application/octet-stream'
            },
            body: file
        });

        if (!response.ok) {
            throw new Error(`Azure Upload Failed: ${response.statusText}`);
        }
        return realBlobUrl;
    },

    uploadDocument: async (file: File, metadata: any): Promise<any> => {
        try {
            console.log("Starting Azure Upload...");
            const blobUrl = await apiService.uploadToAzure(file);
            console.log("Azure Upload Success. Real Blob URL:", blobUrl);

            const payload = {
                blob_url: blobUrl,
                metadata: {
                    category: metadata.category || "Policy",
                    Root_Folder: metadata.Root_Folder || "PIL",
                    Linked_App: metadata.Linked_App || "cbgknowledgehub",
                    is_financial: "false",
                    target_index: "cbgknowledgehub", 
                    generate_flow: metadata.generate_flow === true,
                    ...metadata 
                }
            };
            return handleResponse(await fetch(`${API_BASE_URL}/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }));
        } catch (error) {
            console.error("Full Upload Process Failed:", error);
            throw error;
        }
    },

    deleteDocument: async (docId: string, indexName: string): Promise<any> => {
        const url = `${API_BASE_URL}/documents/${docId}?index_name=${indexName || ''}`;
        return handleResponse(await fetch(url, { method: 'DELETE' }));
    },

    getProcessFlow: async (productName: string): Promise<SopResponse> => {
        const url = `${API_BASE_URL}/process-flow/${productName}`;
        console.log("Fetching Flow from:", url);
        
        const json = await handleResponse(await fetch(url));
        const core = json.process_flow || json.processFlow || json;

        if (!core) {
            throw new Error("Invalid API Response: Missing process_flow data");
        }

        const flowContainer = core.processFlow || core.process_flow || {};
        const rawStages = flowContainer.stages || core.stages || [];

        const stages = rawStages.map((s: any) => ({
            stageId: s.stageId || s.stage_id,
            stageName: s.stageName || s.stage_name,
            description: s.description,
            steps: (s.steps || []).map((st: any) => ({
                stepId: st.stepId || st.step_id,
                stepName: st.stepName || st.step_name,
                description: st.description,
                actor: st.actor,
                stepType: st.stepType || st.step_type,
                nextStep: st.nextStep || st.next_step,
                decisionBranches: (st.decisionBranches || st.decision_branches || []).map((b: any) => ({
                    condition: b.condition,
                    nextStep: b.nextStep || b.next_step
                })),
                risksMitigated: st.risksMitigated || st.risks_mitigated || [],
                controls: st.controls || [],
                policies: st.policies || [],
                automationLevel: st.automationLevel || st.automation_level
            }))
        }));

        const normalizedData: SopResponse = {
            startNode: core.startNode || core.start_node,
            endNode: core.endNode || core.end_node,
            processDefinition: core.processDefinition || core.process_definition,
            processObjectives: core.processObjectives || core.process_objectives || [],
            inherentRisks: core.inherentRisks || core.inherent_risks || [],
            processFlow: { stages: stages },
            metricsAndMeasures: core.metricsAndMeasures || core.metrics_and_measures || [],
            policiesAndStandards: core.policiesAndStandards || core.policies_and_standards || [],
            qualityAssurance: core.qualityAssurance || core.quality_assurance || [],
            metadata: core.metadata || json.metadata
        };
        return normalizedData;
    }
};
