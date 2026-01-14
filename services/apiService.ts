
import { LibraryDocument, SopResponse, Product, ChatSession, FeedbackPayload, ChatSessionDetail, ProcessDefinitionRow } from '../types';

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

// Stream Parser Class to handle "JSON inside Stream"
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
        private onData: (data: { citations?: any, related_questions?: string[] }) => void
    ) {}

    process(chunk: string) {
        // Initial Check: Is this a JSON stream?
        if (!this.hasCheckJson) {
            this.buffer += chunk;
            const trimmed = this.buffer.trimStart();
            if (trimmed.length === 0) return; 

            // If it starts with {, we assume the backend is streaming the raw JSON object
            // Also check for "answer" key in case start brace was missed or in previous chunk
            if (trimmed.startsWith('{') || trimmed.includes('"answer"')) {
                this.isJson = true;
                this.hasCheckJson = true;
                this.buffer = trimmed; 
            } else if (trimmed.length > 50) {
                // Not JSON (regular text stream), flush buffer as plain text
                this.isJson = false;
                this.hasCheckJson = true;
                this.onToken(this.buffer);
                this.buffer = '';
            }
            // Continue processing if we found JSON
        } 
        
        // If it's NOT JSON, just pass through everything
        if (!this.isJson && this.hasCheckJson) {
            this.onToken(chunk);
            return;
        }

        // JSON Parsing State Machine
        if (this.isJson) {
            // 1. Look for "answer": "
            if (!this.inAnswer && !this.answerDone) {
                this.buffer += chunk;
                // Robust regex that handles potential spacing or newlines in the key definition
                const match = this.buffer.match(/"answer"\s*:\s*"/);
                if (match) {
                    this.inAnswer = true;
                    const startIdx = (match.index || 0) + match[0].length;
                    const remaining = this.buffer.substring(startIdx);
                    this.buffer = ''; 
                    this.processStringContent(remaining);
                }
            } 
            // 2. Stream the content of "answer"
            else if (this.inAnswer) {
                this.processStringContent(chunk);
            } 
            // 3. Accumulate everything else (citations) after answer is done
            else if (this.answerDone) {
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
            const result: { citations?: any, related_questions?: string[] } = {};
            
            // 1. Extract Citations using Brace Counting (More robust than Regex)
            try {
                const citKeyIndex = this.citationsBuffer.indexOf('"citations"');
                if (citKeyIndex !== -1) {
                    // Find the first '{' after the key
                    const startBrace = this.citationsBuffer.indexOf('{', citKeyIndex);
                    if (startBrace !== -1) {
                        let depth = 0;
                        let foundEnd = false;
                        let endIndex = -1;

                        for (let i = startBrace; i < this.citationsBuffer.length; i++) {
                            const char = this.citationsBuffer[i];
                            if (char === '{') depth++;
                            else if (char === '}') {
                                depth--;
                                if (depth === 0) {
                                    endIndex = i;
                                    foundEnd = true;
                                    break;
                                }
                            }
                        }

                        if (foundEnd) {
                            const jsonStr = this.citationsBuffer.substring(startBrace, endIndex + 1);
                            result.citations = JSON.parse(jsonStr);
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed to parse citations:", e);
            }

            // 2. Extract Related Questions using Array Counting
            try {
                const rqKeyIndex = this.citationsBuffer.indexOf('"related_questions"');
                if (rqKeyIndex !== -1) {
                    const startBracket = this.citationsBuffer.indexOf('[', rqKeyIndex);
                    if (startBracket !== -1) {
                         let depth = 0;
                         let foundEnd = false;
                         let endIndex = -1;
 
                         for (let i = startBracket; i < this.citationsBuffer.length; i++) {
                             const char = this.citationsBuffer[i];
                             if (char === '[') depth++;
                             else if (char === ']') {
                                 depth--;
                                 if (depth === 0) {
                                     endIndex = i;
                                     foundEnd = true;
                                     break;
                                 }
                             }
                         }
 
                         if (foundEnd) {
                             const jsonStr = this.citationsBuffer.substring(startBracket, endIndex + 1);
                             result.related_questions = JSON.parse(jsonStr);
                         }
                    }
                }
            } catch (e) {
                console.warn("Failed to extract related_questions:", e);
            }

            this.onData(result);
        }
    }
}

// Explicit Interface to fix TypeScript build errors
export interface ApiServiceInterface {
    checkHealth(): Promise<boolean>;
    initializeSession(payload: { session_id?: string, product?: string, index_name?: string }): Promise<any>;
    chatInference(payload: { 
        question: string, 
        index_name?: string, 
        session_id?: string, 
        question_id?: string,
        product?: string,
        onToken: (token: string) => void,
        onComplete?: (data?: { citations?: any, related_questions?: string[] }) => void,
        onError?: (error: string) => void
    }): Promise<void>;
    submitFeedback(feedback: FeedbackPayload): Promise<any>;
    getChatSessions(): Promise<ChatSession[]>;
    getChatSessionDetails(sessionId: string): Promise<ChatSessionDetail | null>;
    getProducts(): Promise<Product[]>;
    createProduct(product: { product_name: string, folder_name: string, product_description: string }): Promise<any>;
    deleteProduct(productName: string): Promise<any>;
    getDocuments(): Promise<LibraryDocument[]>;
    uploadToAzure(file: File): Promise<string>;
    uploadDocument(file: File, metadata: any): Promise<any>;
    deleteDocument(docId: string, indexName: string): Promise<any>;
    getProcessFlow(productName: string): Promise<SopResponse>;
    getProcessTable(productName: string, sopData?: SopResponse): Promise<ProcessDefinitionRow[]>;
    updateProcessFlowFromTable(productName: string, tableData: ProcessDefinitionRow[], originalSop: SopResponse): Promise<SopResponse>;
}

export const apiService: ApiServiceInterface = {
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

    // --- Session Management (New) ---
    initializeSession: async (payload: { session_id?: string, product?: string, index_name?: string }): Promise<any> => {
        try {
            return await handleResponse(await fetch(`${API_BASE_URL}/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }));
        } catch (e) {
            console.warn("Session Init Warning (non-blocking):", e);
            // Return dummy success if backend doesn't implement this yet but we want to proceed
            return { status: 'ok', session_id: payload.session_id };
        }
    },

    // --- Chat Endpoint (Streaming & Standard JSON) ---
    chatInference: async (payload: { 
        question: string, 
        index_name?: string, 
        session_id?: string, 
        question_id?: string,
        product?: string,
        onToken: (token: string) => void,
        onComplete?: (data?: { citations?: any, related_questions?: string[] }) => void,
        onError?: (error: string) => void
    }): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/inference/stream`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream, application/json' // Accept both
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

            // 1. Handle Standard JSON Response (Non-Streaming RAG)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                
                // Send the full answer text
                if (data.answer) {
                    payload.onToken(data.answer);
                }
                
                // Complete with metadata
                if (payload.onComplete) {
                    payload.onComplete({
                        citations: data.citations,
                        related_questions: data.related_questions || data.suggestions
                    });
                }
                return;
            }

            // 2. Handle Streaming Response (SSE)
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
                (data) => {
                    if (payload.onComplete) payload.onComplete(data);
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

                            // Token Handling
                            if (data.token) {
                                // CHANGED: Directly pass standard text tokens to avoid parser buffering
                                // This assumes standard RAG streaming where 'token' is just the next text chunk
                                payload.onToken(data.token);
                            }
                            
                            // Direct Citations/Related Handling (if sent separately)
                            if (data.citations || data.related_questions) {
                                if (payload.onComplete) {
                                    payload.onComplete({
                                        citations: data.citations,
                                        related_questions: data.related_questions
                                    });
                                }
                            }

                            // Fallback: Full Answer Block (Legacy non-stream)
                            if (data.answer && !data.token) {
                                if (typeof data.answer === 'string') {
                                     // If it looks like JSON, ignore to avoid double print
                                     if (!data.answer.trim().startsWith('{')) {
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
            
            parser.finish();
            console.log("--- Stream Completed ---");
            if (payload.onComplete) payload.onComplete();

        } catch (error: any) {
            console.error("Streaming Error:", error);
            if (payload.onError) payload.onError(error.message || "Stream failed");
        }
    },

    // --- Feedback Endpoint ---
    submitFeedback: async (feedback: FeedbackPayload): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedback)
            });
            return handleResponse(response);
        } catch (error) {
            console.error("Failed to submit feedback", error);
            throw error;
        }
    },

    // --- Chat History ---
    getChatSessions: async (): Promise<ChatSession[]> => {
        try {
            const url = `${API_BASE_URL}/history/sessions`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                return data.sessions || [];
            }
            return [];
        } catch (e) {
            console.error("Failed to fetch history", e);
            return [];
        }
    },

    getChatSessionDetails: async (sessionId: string): Promise<ChatSessionDetail | null> => {
        try {
            const url = `${API_BASE_URL}/history/sessions/${sessionId}`;
            const res = await fetch(url);
            if(res.ok) {
                return await res.json();
            }
            return null;
        } catch (e) {
            console.error("Failed to fetch session details", e);
            return null;
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
                suggested_questions: doc.suggested_questions || [],
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

        // --- NEW: Handle Status Responses ---
        if (json.status === 'Processing') {
            throw { status: 'Processing', message: json.message || 'Flow generation in progress...' };
        }
        if (json.status === 'Failed') {
             throw { status: 'Failed', message: json.message || 'Flow generation failed.' };
        }
        // ------------------------------------
        
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
    },

    // --- Mock Implementation for Editable Process Table ---
    getProcessTable: async (productName: string, sopData?: SopResponse): Promise<ProcessDefinitionRow[]> => {
        // In a real app, this would fetch from an endpoint like /process-definition/table/:productName
        // For now, we simulate extraction from the current SOP JSON
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency

        if (!sopData || !sopData.processFlow || !sopData.processFlow.stages) {
            return [];
        }

        const rows: ProcessDefinitionRow[] = [];
        let counter = 1;

        sopData.processFlow.stages.forEach(stage => {
            stage.steps.forEach(step => {
                rows.push({
                    id: step.stepId,
                    l2Process: stage.stageName, // Using Stage Name as L2 Process proxy
                    stepName: step.stepName,
                    stepDescription: step.description,
                    stepType: step.stepType,
                    system: 'System', // Default fallback as JSON might not have it explicitly in this simplified type
                    actor: step.actor,
                    processingTime: '10', // Mock
                    risks: step.risksMitigated ? step.risksMitigated.join(', ') : ''
                });
            });
        });

        return rows;
    },

    updateProcessFlowFromTable: async (productName: string, tableData: ProcessDefinitionRow[], originalSop: SopResponse): Promise<SopResponse> => {
        // In a real app, this would POST the table data to backend which re-runs the LLM/Algorithm
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

        // Create a deep copy to modify
        const newSop = JSON.parse(JSON.stringify(originalSop)) as SopResponse;
        
        // Naive update logic: Iterate through stages and update steps that match IDs
        if (newSop.processFlow && newSop.processFlow.stages) {
            newSop.processFlow.stages.forEach(stage => {
                stage.steps.forEach(step => {
                    const row = tableData.find(r => r.id === step.stepId);
                    if (row) {
                        step.stepName = row.stepName;
                        step.description = row.stepDescription;
                        step.actor = row.actor;
                        step.stepType = row.stepType;
                        // We could update more fields here
                    }
                });
            });
        }

        return newSop;
    }
};
