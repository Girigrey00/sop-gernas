
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

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode the chunk and append to buffer
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Process complete lines (SSE format usually ends with double newline)
                const lines = buffer.split('\n');
                // Keep the last partial line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonStr = trimmedLine.substring(6); // Remove 'data: ' prefix
                            const data = JSON.parse(jsonStr);

                            // 1. Handle Token (The text content)
                            if (data.token) {
                                payload.onToken(data.token);
                            }
                            
                            // 2. Handle Citations (Usually comes at the end)
                            if (data.citations) {
                                console.log("Citations received:", data.citations);
                                if (payload.onComplete) payload.onComplete(data.citations);
                            }

                            // 3. Handle 'Answer' legacy/fallback (If backend sends full block)
                            // We ONLY use this if we haven't received tokens, to avoid duplication
                            // or if the backend structure sends { answer: "full text", citations: ... } in one go
                            if (data.answer && !data.token) {
                                // If it's a JSON object representing the final response, we DON'T want to print the JSON string.
                                // We just want the answer text.
                                if (typeof data.answer === 'string') {
                                     // Check if the answer itself looks like a JSON string (double encoded)
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
            
            console.log("--- Stream Completed ---");
            
            // Ensure any final completion logic is called
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
        
        // Map metadata description to top-level description
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

    // List all documents
    getDocuments: async (): Promise<LibraryDocument[]> => {
        const data = await handleResponse(await fetch(`${API_BASE_URL}/documents?limit=100`));
        
        // Map backend response to frontend LibraryDocument interface
        return data.map((doc: any) => {
            const rawCategory = doc.category || 'General';
            let categoryDisplay = rawCategory;

            // Check if it's an SOP flow source
            if (doc.generate_flow === true || (doc.metadata && doc.metadata.generate_flow === true)) {
                categoryDisplay = 'Process Definition';
            } 
            // Check if it's a Knowledge Base file
            else if (rawCategory === 'KnowledgeBase' || (doc.metadata && doc.metadata.category === 'KnowledgeBase')) {
                categoryDisplay = 'Policy Documents';
            }
            // Fallback for previous uploads
            else if (['Policy', 'Procedure', 'Manual'].includes(rawCategory)) {
                categoryDisplay = 'Process Definition';
            }
            
            const latestLog = doc.logs && Array.isArray(doc.logs) && doc.logs.length > 0 
                ? doc.logs[doc.logs.length - 1].message 
                : null;

            return {
                id: doc._id || doc.id,
                sopName: doc.product_id || doc.file_name, // Fallback
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

    // Upload to Azure Blob Storage using SAS Token
    uploadToAzure: async (file: File): Promise<string> => {
        const sasUrl = new URL(AZURE_SAS_URL);
        const fileName = encodeURIComponent(file.name);
        
        // 1. Construct the Real URL (this is what the backend needs to know)
        const realBlobUrl = `${sasUrl.origin}${sasUrl.pathname}/${fileName}${sasUrl.search}`;

        // 2. Determine Upload URL (Dev Proxy vs Prod Direct)
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

    // Upload Document: 1. Upload to Azure, 2. Call Ingest API
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

            console.log("Calling Ingest API with payload:", payload);
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
        return handleResponse(await fetch(url, {
            method: 'DELETE',
        }));
    },

    getProcessFlow: async (productName: string): Promise<SopResponse> => {
        const url = `${API_BASE_URL}/process-flow/${productName}`;
        console.log("Fetching Flow from:", url);
        
        const json = await handleResponse(await fetch(url));
        console.log("Raw Process Flow Response:", json);

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
            processFlow: {
                stages: stages
            },
            metricsAndMeasures: core.metricsAndMeasures || core.metrics_and_measures || [],
            policiesAndStandards: core.policiesAndStandards || core.policies_and_standards || [],
            qualityAssurance: core.qualityAssurance || core.quality_assurance || [],
            metadata: core.metadata || json.metadata
        };

        return normalizedData;
    }
};
