
import { LibraryDocument, SopResponse, Product, ChatSession, FeedbackPayload, ChatSessionDetail, ProcessDefinitionRow, BuilderResponse } from '../types';

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

// Mock Chat Logic for Demo/Fallback
const mockChatStream = async (payload: any) => {
    const question = payload.question.toLowerCase();
    let answer = "I'm processing your request based on the policy documents. Please be specific about the section you're interested in.";
    let related: string[] = ["Show policy summary", "List all risks"];

    // Specific Responses for the suggestion cards
    if (question.includes('risk') && question.includes('step 3')) {
        answer = "### Risks in Step 3 (Employer Validation)\n\nBased on the analysis, here are the inherent risks identified in Step 3:\n\n**R4: Fraud - Employer (High)**\nRisk of applicants misrepresenting their employer details to qualify for products restricted to listed companies.\n\n**R5: Fraud - Banking (Medium)**\nPotential manipulation of salary transfer letters or banking statements.\n\n**R11: Compliance - Rules (Low)**\nFailure to adhere to Central Bank regulations regarding Debt Burden Ratio (DBR) calculations for specific employer categories.";
        related = ["What controls are in place for R4?", "Show me the control effectiveness", "List all fraud risks"];
    } else if (question.includes('control') && question.includes('credit underwriting')) {
        answer = "### Controls for Credit Underwriting (Step 4)\n\nThe following controls are implemented to mitigate credit risks:\n\n1. **Credit Decision Engine (Automated)**\n   - Real-time scoring based on AECB data.\n   - Auto-decline for scores below 650.\n\n2. **Maker Checker Process (Manual)**\n   - High-value loans (> AED 500k) require secondary approval.\n\n3. **Insurance Onboarding (Manual)**\n   - Mandatory life insurance linkage verification before final approval.";
        related = ["What is the automation level?", "Explain the Maker Checker logic"];
    } else if (question.includes('eid') || question.includes('validated')) {
        answer = "### EID Validation Process\n\nThe Emirates ID (EID) validation occurs in **Step 2 (Pre-eligibility + Customer ID&V)**.\n\n**Mechanism:**\n- **OCR Scan**: The EFR system extracts data from the physical ID.\n- **Biometric Check**: Fingerprint verification against the ICA database.\n- **Manual Fallback**: Branch officer visual verification if digital check fails.\n\n**Validation Rules:**\n- Must be valid for at least 30 days.\n- Name must match the core banking system exactly.";
        related = ["What happens if EID is expired?", "Is digital EID accepted?"];
    } else if (question.includes('summarize') || question.includes('loan disbursal')) {
        answer = "### Loan Disbursal Process Summary\n\n**Step 7: Loan Disbursal / Funds Release**\n\nThis is the final stage of the workflow where funds are released to the customer.\n\n**Risks:**\n- Operational errors in manual sub-processes.\n- Financial crime via improper documentation.\n\n**Controls:**\n- Maker-Checker process in T24 (Manual).\n- Email-based unblocking for funds (Manual).\n- File management transfer within 2 days.\n\n**Data Produced:**\nPIL Record, Transactional Data, Contract, Consent Evidence.";
        related = ["What are the prerequisites for disbursal?", "Who authorizes the transfer?"];
    } else if (question.includes('loan condition') || question.includes('step 6')) {
        answer = "### Step 6: Loan Conditions Validation\n\nThis step involves critical validation of loan prerequisites:\n\n**Data Consumed:**\nSTL record, Actual salary, Security cheque.\n\n**Risks:**\n- **Financial/Ops:** IBAN mismatch, Document storage failure.\n- **Fraud:** Salary source manipulation, Cheque signature forgery.\n\n**Controls:**\n- **Automated:** IBAN Validation, Disbursal Block in T24.\n- **Manual:** QR Code validation for eSTLs, Signature verification, 10% Salary Variance check.";
        related = ["What data is consumed in Step 6?", "Explain the salary source check"];
    } else if (question.includes('hello') || question.includes('hi')) {
        answer = "Hello! I am your Policy Standards Assistant. I can help you navigate the Group Information Security Policy and other standard operating procedures. What would you like to know?";
        related = ["What risks are in this policy?", "List the key controls"];
    }

    // Simulate Network Latency & Streaming
    const tokens = answer.match(/[\s\S]{1,5}/g) || [];
    for (const token of tokens) {
        await new Promise(r => setTimeout(r, 20)); // Fast stream
        payload.onToken(token);
    }
    
    if (payload.onComplete) {
        await new Promise(r => setTimeout(r, 100)); // Small delay before metadata
        payload.onComplete({
            citations: {
                "[1] Policy Definition v2.1": "Section 4: Risk Management Framework",
                "[2] Standard Operating Procedure": "Page 15: Detailed Process Flow"
            },
            related_questions: related
        });
    }
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
            
            // 1. Extract Citations using Brace Counting (String Aware)
            try {
                const citKeyIndex = this.citationsBuffer.indexOf('"citations"');
                if (citKeyIndex !== -1) {
                    // Find the first '{' after the key
                    const startBrace = this.citationsBuffer.indexOf('{', citKeyIndex);
                    if (startBrace !== -1) {
                        let depth = 0;
                        let foundEnd = false;
                        let endIndex = -1;
                        let inString = false;
                        let esc = false;

                        for (let i = startBrace; i < this.citationsBuffer.length; i++) {
                            const char = this.citationsBuffer[i];
                            
                            if (inString) {
                                if (esc) {
                                    esc = false;
                                } else if (char === '\\') {
                                    esc = true;
                                } else if (char === '"') {
                                    inString = false;
                                }
                            } else {
                                if (char === '"') {
                                    inString = true;
                                } else if (char === '{') {
                                    depth++;
                                } else if (char === '}') {
                                    depth--;
                                    if (depth === 0) {
                                        endIndex = i;
                                        foundEnd = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (foundEnd) {
                            const jsonStr = this.citationsBuffer.substring(startBrace, endIndex + 1);
                            
                            // Try parsing, if fail, try to repair unquoted URLs
                            try {
                                result.citations = JSON.parse(jsonStr);
                            } catch(e) {
                                // REPAIR LOGIC FOR UNQUOTED URLS
                                try {
                                    // Robust Regex: "presigned_url": https://... until comma or closing brace
                                    // Handles spaces in URLs (e.g., filenames) by reading until the next property key or end of object
                                    // Look for "presigned_url": followed by non-greedy match until it sees a comma followed by a quote (next key) OR end brace
                                    const fixed = jsonStr.replace(/("presigned_url"\s*:\s*)(https?:\/\/.*?)(?=\s*(?:,\s*"[^"]+"\s*:|\s*\}))/g, '$1"$2"');
                                    result.citations = JSON.parse(fixed);
                                } catch(e2) {
                                    console.warn("Citation JSON parse failed even after repair:", e2);
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed to parse citations:", e);
            }

            // 2. Extract Related Questions using Array Counting (String Aware)
            try {
                const rqKeyIndex = this.citationsBuffer.indexOf('"related_questions"');
                if (rqKeyIndex !== -1) {
                    const startBracket = this.citationsBuffer.indexOf('[', rqKeyIndex);
                    if (startBracket !== -1) {
                         let depth = 0;
                         let foundEnd = false;
                         let endIndex = -1;
                         let inString = false;
                         let esc = false;
 
                         for (let i = startBracket; i < this.citationsBuffer.length; i++) {
                             const char = this.citationsBuffer[i];
                             
                             if (inString) {
                                if (esc) {
                                    esc = false;
                                } else if (char === '\\') {
                                    esc = true;
                                } else if (char === '"') {
                                    inString = false;
                                }
                             } else {
                                 if (char === '"') {
                                     inString = true;
                                 } else if (char === '[') {
                                     depth++;
                                 } else if (char === ']') {
                                     depth--;
                                     if (depth === 0) {
                                         endIndex = i;
                                         foundEnd = true;
                                         break;
                                     }
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
    generateTableFromBuilder(inputs: { productName: string, startTrigger: string, endTrigger: string, stages: { name: string }[] }): Promise<BuilderResponse>;
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
                 // FALLBACK TO MOCK IF SERVER FAILS (e.g. 404, 500)
                 console.warn("Backend chat failed, switching to mock mode for demo.");
                 await mockChatStream(payload);
                 return;
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
                                // Feed token to parser to handle "JSON inside Stream" wrapping
                                parser.process(data.token);
                            }
                            
                            // Direct Citations/Related Handling (if sent separately/final event)
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
            
            if (payload.onComplete) payload.onComplete();

        } catch (error: any) {
            console.error("Streaming Error:", error);
            // FINAL FALLBACK TO MOCK ON NETWORK ERROR
            console.warn("Network error encountered, switching to mock mode for demo.");
            await mockChatStream(payload);
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
            // Mock success for demo
            return { status: "success" };
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
        try {
            const data = await handleResponse(await fetch(`${API_BASE_URL}/products`));
            const productsRaw = data.products || [];
            return productsRaw.map((p: any) => ({
                ...p,
                description: p.metadata?.product_description || p.description || 'No description available'
            }));
        } catch (e) {
            console.warn("Failed to fetch products, returning empty list.");
            return [];
        }
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
        try {
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
        } catch(e) {
            return [];
        }
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
        
        try {
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
                // NEW: Map Stage-Level Metadata for Sidebar Display
                summary: s.summary,
                keyActivities: s.keyActivities || s.key_activities,
                keyControls: s.keyControls || s.key_controls,
                keyRisks: s.keyRisks || s.key_risks,
                inputs: s.inputs,
                outputs: s.outputs,
                // END NEW MAPPINGS
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
                    standards: st.standards || [], // Map new standards field
                    automationLevel: st.automationLevel || st.automation_level,
                    raciTeams: st.raciTeams || st.raci_teams || st.raciTeams,
                    processingTime: st.processingTime || st.processing_time || st.processingTime,
                    sla: st.sla,
                    kpi: st.kpi
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
        } catch (e) {
            // IF FETCH FAILS, THROW IT TO LET CALLER HANDLE, OR RETURN MOCK?
            // Page logic handles catch, but CanvasPage might rely on structure.
            // For now, let's allow it to fail for real data consistency, BUT chat handles mock separately.
            throw e;
        }
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
                    processingTime: step.processingTime || '10', 
                    risks: step.risksMitigated ? step.risksMitigated.join(', ') : ''
                });
            });
        });

        return rows;
    },

    updateProcessFlowFromTable: async (productName: string, tableData: ProcessDefinitionRow[], originalSop: SopResponse): Promise<SopResponse> => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

        const newSop = JSON.parse(JSON.stringify(originalSop)) as SopResponse;
        
        // 1. Map Table Rows to Steps
        const stagesMap = new Map<string, any>();
        
        // Ensure stages exist for all L2 processes in table
        tableData.forEach(row => {
            if (!stagesMap.has(row.l2Process)) {
                // Check if stage exists in originalSop to preserve metadata if possible
                const existingStage = newSop.processFlow.stages.find(s => s.stageName === row.l2Process);
                stagesMap.set(row.l2Process, existingStage || {
                    stageId: `S${stagesMap.size + 1}`,
                    stageName: row.l2Process,
                    description: row.l2Process,
                    steps: []
                });
            }
        });

        // 2. Clear steps in mapped stages to rebuild
        stagesMap.forEach(stage => stage.steps = []);

        // 3. Build Steps and Assign to Stages
        const allSteps: any[] = [];
        
        tableData.forEach((row, index) => {
            const stage = stagesMap.get(row.l2Process);
            
            // Basic Step Construction
            const step: any = {
                stepId: row.id || `ST-${index + 1}`,
                stepName: row.stepName,
                description: row.stepDescription,
                actor: row.actor,
                stepType: row.stepType,
                processingTime: row.processingTime,
                risksMitigated: row.risks ? row.risks.split(',').map(r => r.trim()) : [],
                controls: [],
                policies: [],
                standards: [],
                // Default linking logic
                nextStep: null 
            };
            
            stage.steps.push(step);
            allSteps.push(step);
        });

        // 4. Link Steps Sequentially
        for (let i = 0; i < allSteps.length; i++) {
            if (i < allSteps.length - 1) {
                allSteps[i].nextStep = allSteps[i+1].stepId;
            } else {
                allSteps[i].nextStep = 'END'; // Link last step to End
            }
        }

        // 5. Update SOP Structure
        newSop.processFlow.stages = Array.from(stagesMap.values());
        
        if (allSteps.length > 0 && newSop.startNode) {
            newSop.startNode.nextStep = allSteps[0].stepId;
        }

        return newSop;
    },

    // New Helper: Generate initial table and metadata from builder inputs
    generateTableFromBuilder: async (inputs: { productName: string, startTrigger: string, endTrigger: string, stages: { name: string }[] }): Promise<BuilderResponse> => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate generation

        const rows: ProcessDefinitionRow[] = [
            // Stage 1: Customer application completion
            { id: 'S1-1', l2Process: 'Customer application completion', stepName: 'Explain Product Features & Provide KFS', stepDescription: 'CSO explains all account terms, features, charges, and provides the Key Fact Statement', actor: 'CSO', stepType: 'Interaction', system: 'N/A', processingTime: '10m', risks: 'Mis-selling' },
            { id: 'S1-2', l2Process: 'Customer application completion', stepName: 'Receive Completed Application & KFS', stepDescription: 'CSO receives the signed KFS and duly filled Account Opening Form from the customer, ensuring all required fields are completed.', actor: 'CSO', stepType: 'Activity', system: 'N/A', processingTime: '5m', risks: 'Incomplete Docs' },
            { id: 'S1-3', l2Process: 'Customer application completion', stepName: 'Collect Customer Documents', stepDescription: 'CSO provides and collects all required documentation (KYC, FATCA, CRS, income proof, etc.) from the customer as per the account opening checklist.', actor: 'CSO', stepType: 'Activity', system: 'N/A', processingTime: '15m', risks: 'Incomplete Docs' },
            { id: 'S1-4', l2Process: 'Customer application completion', stepName: 'Verify Documents & Identity', stepDescription: 'CSO verifies originals against copies, checks document validity, matches photos, and stamps True copy of original with employee ID and date.', actor: 'CSO', stepType: 'Control', system: 'N/A', processingTime: '10m', risks: 'Identity Fraud' },
            { id: 'S1-5', l2Process: 'Customer application completion', stepName: 'Initial Data Capture & Risk Rating', stepDescription: 'CSO inputs customer information from AOF into the CRAM tool to perform risk rating as per Group CDD Procedure.', actor: 'CSO', stepType: 'Assessment', system: 'CRAM tool', processingTime: '20m', risks: 'Incorrect Data' },
            { id: 'S1-6', l2Process: 'Customer application completion', stepName: 'Special Handling for Customer Categories', stepDescription: 'CSO applies additional procedures for minors, illiterate customers, POA holders, veiled ladies, and legal heirs as per policy, including extra documentation and approvals.', actor: 'CSO', stepType: 'Special Handling', system: 'N/A', processingTime: '15m', risks: 'Compliance' },
            { id: 'S1-7', l2Process: 'Customer application completion', stepName: 'Rectify Application Discrepancies', stepDescription: 'If any discrepancies or missing information are found in the application or documents, CSO requests customer to rectify and resubmit before proceeding.', actor: 'CSO', stepType: 'Activity', system: 'N/A', processingTime: '10m', risks: 'Delay' },
            { id: 'S1-8', l2Process: 'Customer application completion', stepName: 'Obtain Approver Signature on Risk Rating', stepDescription: 'CSO prints the risk rating and obtains approvers signature as per authority matrix or via email approval.', actor: 'CSO', stepType: 'Authorization', system: 'CRAM tool', processingTime: '5m', risks: 'Unauthorized' },

            // Stage 2: Customer identification, validation and eligibility check
            { id: 'S2-1', l2Process: 'Customer identification, validation and eligibility check', stepName: 'Collect and Verify Identity Documents', stepDescription: 'Collect original Emirates ID, Passport, and other required documents from the customer and verify their authenticity, validity, and match with the physical person. Scrutinize photos and spellings for consistency and refer any suspicions to Fraud Risk Investigation.', actor: 'CSO', stepType: 'Activity', system: 'N/A', processingTime: '10m', risks: 'Identity Fraud' },
            { id: 'S2-2', l2Process: 'Customer identification, validation and eligibility check', stepName: 'Validate Address and Communication Details', stepDescription: 'Ensure customer provides valid residential or business address, and verify the address against supporting documents. For physical statements, P.O. Box is mandatory.', actor: 'CSO', stepType: 'Activity', system: 'N/A', processingTime: '5m', risks: 'Contact Failure' },
            { id: 'S2-3', l2Process: 'Customer identification, validation and eligibility check', stepName: 'Eligibility Criteria Assessment', stepDescription: 'Assess customer eligibility for account opening based on income proof, risk rating, age, employment status, and product-specific requirements. Refer Elite segment and special categories as per policy.', actor: 'CSO', stepType: 'Assessment', system: 'N/A', processingTime: '10m', risks: 'Eligibility Error' },
            { id: 'S2-4', l2Process: 'Customer identification, validation and eligibility check', stepName: 'Perform Risk Rating via CRAM Tool', stepDescription: 'Input customer information into the CRAM tool to generate risk rating as per Group CDD Procedure. Print and retain risk rating form for approval.', actor: 'CSO', stepType: 'Assessment', system: 'CRAM Tool', processingTime: '15m', risks: 'Incorrect Rating' },
            { id: 'S2-5', l2Process: 'Customer identification, validation and eligibility check', stepName: 'Document Authenticity and OSV Certification', stepDescription: 'Compare photocopies with originals, stamp True copy of original, and certify validity, genuineness, and issuance by competent authorities. Annotate and sign with staff ID and date.', actor: 'CSO', stepType: 'Control', system: 'N/A', processingTime: '5m', risks: 'Forgery' },
            { id: 'S2-6', l2Process: 'Customer identification, validation and eligibility check', stepName: 'Special Handling for Category Customers', stepDescription: 'Apply additional identification and verification procedures for minors, illiterate persons, veiled ladies, POA holders, and legal heirs as per policy. Obtain necessary approvals and attestations.', actor: 'CSO', stepType: 'Special Handling', system: 'N/A', processingTime: '10m', risks: 'Compliance' },
            { id: 'S2-7', l2Process: 'Customer identification, validation and eligibility check', stepName: 'Eligibility Decision and Exception Handling', stepDescription: 'Decide on customer eligibility for account opening. If not eligible, inform customer and end process; if eligible, proceed. Handle exceptions and escalate as required.', actor: 'CSO', stepType: 'Decision', system: 'N/A', processingTime: '5m', risks: 'Incorrect Decision' },

            // Stage 3: AML, KYC compliance screening
            { id: 'S3-1', l2Process: 'AML, KYC compliance screening', stepName: 'Perform Name Screening', stepDescription: 'Screen the customer and all relevant connected parties against internal and external watchlists (FSK/BBL) to identify PEPs, sanctions, and adverse media risks.', actor: 'KYC Team', stepType: 'AML/Screening', system: 'Fircosoft', processingTime: '5m', risks: 'Sanctions Breach' },
            { id: 'S3-2', l2Process: 'AML, KYC compliance screening', stepName: 'Conduct Sanctions Screening', stepDescription: 'Check all parties against global and local sanctions lists to ensure no prohibited relationships are onboarded.', actor: 'KYC Team', stepType: 'AML/Screening', system: 'Fircosoft', processingTime: '5m', risks: 'Sanctions Breach' },
            { id: 'S3-3', l2Process: 'AML, KYC compliance screening', stepName: 'PEP Identification and Assessment', stepDescription: 'Identify Politically Exposed Persons (PEPs) among customers and connected parties, and assess associated risks.', actor: 'KYC Team', stepType: 'AML/Screening', system: 'Fircosoft', processingTime: '10m', risks: 'PEP Risk' },
            { id: 'S3-4', l2Process: 'AML, KYC compliance screening', stepName: 'Risk Rating via CRAM', stepDescription: 'Assess the customer\'s risk profile using the Customer Risk Assessment Methodology (CRAM) portal, considering all relevant risk factors.', actor: 'KYC Team', stepType: 'Assessment', system: 'CRAM Portal', processingTime: '15m', risks: 'Incorrect Risk' },
            { id: 'S3-5', l2Process: 'AML, KYC compliance screening', stepName: 'Determine EDD Requirement', stepDescription: 'Evaluate if Enhanced Due Diligence (EDD) is required based on risk rating, PEP status, adverse media, or complex ownership structures.', actor: 'KYC Team', stepType: 'Decision', system: 'BPMS', processingTime: '5m', risks: 'EDD Missed' },
            { id: 'S3-6', l2Process: 'AML, KYC compliance screening', stepName: 'FATCA/CRS Compliance Check', stepDescription: 'Verify customer’s FATCA and CRS status and ensure required self-certification forms are collected and validated.', actor: 'KYC Team', stepType: 'Compliance', system: 'BPMS', processingTime: '5m', risks: 'Regulatory Fine' },
            { id: 'S3-7', l2Process: 'AML, KYC compliance screening', stepName: 'Escalate Positive Hits for Approval', stepDescription: 'Escalate any positive/true hits from screening (PEP, sanctions, adverse media) to Compliance, Sanctions Advisory, or FCC for review and approval.', actor: 'KYC Team', stepType: 'Escalation', system: 'BPMS', processingTime: '10m', risks: 'Delay' },
            { id: 'S3-8', l2Process: 'AML, KYC compliance screening', stepName: 'Record Screening Results and Rationale', stepDescription: 'Save all screening results, including rationale for discounting false hits, in the client’s mandate file for audit and compliance purposes.', actor: 'KYC Team', stepType: 'Record Mgmt', system: 'BPMS', processingTime: '5m', risks: 'Audit Fail' },

            // Stage 4: Exception handling
            { id: 'S4-1', l2Process: 'Exception handling', stepName: 'Access Exception Flags in IBM BPM', stepDescription: 'Access IBM BPM system to identify and review exception flags for failed account opening cases, including reasons for failure.', actor: 'BDO', stepType: 'Activity', system: 'IBM BPM', processingTime: '5m', risks: 'Missed Exception' },
            { id: 'S4-2', l2Process: 'Exception handling', stepName: 'Investigate Failure Reasons', stepDescription: 'Investigate the reasons for account opening failure using relevant systems and attempt resolution based on set conditions.', actor: 'BDO', stepType: 'Activity', system: 'IBM BPM', processingTime: '20m', risks: 'Unresolved Issue' },
            { id: 'S4-3', l2Process: 'Exception handling', stepName: 'True Hit Screening & Compliance Escalation', stepDescription: 'Check for true name screening hits via FSK and BBL; escalate unresolved matches to Compliance for review and confirmation before proceeding.', actor: 'BDO', stepType: 'AML/Screening', system: 'FSK/BBL', processingTime: '15m', risks: 'Compliance Breach' },
            { id: 'S4-4', l2Process: 'Exception handling', stepName: 'Decline Case and Arrange Account Closure', stepDescription: 'Decline the case in IBM BPM and initiate account closure for cases with unresolved exceptions or compliance/fraud concerns.', actor: 'BDO', stepType: 'Activity', system: 'IBM BPM', processingTime: '10m', risks: 'Operational Error' },
            { id: 'S4-5', l2Process: 'Exception handling', stepName: 'Request Additional Information/Documents', stepDescription: 'Review the case for missing or additional information/documents and contact the customer to obtain required items via registered email or direct visit if needed.', actor: 'BDO', stepType: 'Interaction', system: 'IBM BPM', processingTime: '15m', risks: 'Delay' },
            { id: 'S4-6', l2Process: 'Exception handling', stepName: 'Arrange Direct Customer Verification', stepDescription: 'For failed liveness tests or special category cases (POA, Minor, Illiterate), arrange direct customer verification and document collection via runner or sales agent.', actor: 'BDO', stepType: 'Special Handling', system: 'IBM BPM', processingTime: '20m', risks: 'Fraud' },
            { id: 'S4-7', l2Process: 'Exception handling', stepName: 'Maker-Checker Review and Rectification', stepDescription: 'BDU Manager reviews the case in IBM BPM against account opening conditions; if discrepancies are found, return to maker for rectification and resubmission.', actor: 'BDU Manager', stepType: 'Review', system: 'IBM BPM', processingTime: '15m', risks: 'Error Oversight' },
            { id: 'S4-8', l2Process: 'Exception handling', stepName: 'FCC/Compliance Review for High Risk/EDD Cases', stepDescription: 'Verify risk rating and compliance check results; for high/very high risk or EDD required cases, ensure ECDD form is completed and escalate to PB Onboarding & KYC team for further review.', actor: 'BDU Manager', stepType: 'Compliance', system: 'IBM BPM', processingTime: '20m', risks: 'Compliance Breach' },
            { id: 'S4-9', l2Process: 'Exception handling', stepName: 'Account Closure if Exception Not Cleared in 30 Days', stepDescription: 'Initiate account closure via IBM BPM if exception handling is not completed within 30 days of initiation; inform customer as per protocol.', actor: 'BDO', stepType: 'Control', system: 'IBM BPM', processingTime: '5m', risks: 'SLA Breach' },

            // Stage 5: Account Completion
            { id: 'S5-1', l2Process: 'Account Completion', stepName: 'Enter Customer Data in T24', stepDescription: 'AMO enters all mandatory customer and account details into T24, ensuring fields such as Emirates ID, passport, visa, account type, and segment are accurately updated.', actor: 'AMO', stepType: 'Activity', system: 'T24', processingTime: '10m', risks: 'Data Entry Error' },
            { id: 'S5-2', l2Process: 'Account Completion', stepName: 'Perform Dedupe Check in T24', stepDescription: 'AMO conducts deduplication checks in T24 to ensure no duplicate Customer Identification Number (CIN) is created for the customer.', actor: 'AMO', stepType: 'Control', system: 'T24', processingTime: '5m', risks: 'Duplicate Customer' },
            { id: 'S5-3', l2Process: 'Account Completion', stepName: 'Authorize Account in T24', stepDescription: 'AMO authorizer reviews and authorizes the newly created account in T24, confirming all data and documentation are complete and compliant.', actor: 'AMO Authorizer', stepType: 'Authorization', system: 'T24', processingTime: '10m', risks: 'Unauthorized Account' },
            { id: 'S5-4', l2Process: 'Account Completion', stepName: 'Issue Debit Card and Cheque Book', stepDescription: 'Eligible customers are automatically issued a debit card and first cheque book (10 leaves) upon account opening in T24, if requested.', actor: 'System', stepType: 'Automated', system: 'T24', processingTime: '0m', risks: 'Issuance Error' },
            { id: 'S5-5', l2Process: 'Account Completion', stepName: 'Notify Customer of Account Details', stepDescription: 'AMO sends account details including IBAN and welcome kit to the customer via the designated communication channel.', actor: 'AMO', stepType: 'Notification', system: 'BPMS', processingTime: '5m', risks: 'Communication Failure' },
            { id: 'S5-6', l2Process: 'Account Completion', stepName: 'Archive Account Opening Documents', stepDescription: 'AMO ensures all original documents are sent to RMT for archival and digital copies are stored as per bank policy.', actor: 'AMO', stepType: 'Record Mgmt', system: 'BPMS', processingTime: '10m', risks: 'Lost Documents' },
            { id: 'S5-7', l2Process: 'Account Completion', stepName: 'Conduct Post-Onboarding Controls', stepDescription: 'AMO performs post-onboarding checks such as fraud referrals, segment validation, and ensures any pending documentation is tracked and followed up.', actor: 'AMO', stepType: 'Control', system: 'T24', processingTime: '15m', risks: 'Control Failure' },
            { id: 'S5-8', l2Process: 'Account Completion', stepName: 'Update Segment, Industry, and Sector Codes', stepDescription: 'AMO updates the customer’s segment, industry, and sector codes in T24 as per the account type and customer profile.', actor: 'AMO', stepType: 'Activity', system: 'T24', processingTime: '5m', risks: 'Misclassification' }
        ];

        return {
            objectives: [
                { id: 'meta1', key: 'Process Name', value: 'PIL onboarding', editable: true },
                { id: 'meta2', key: 'Process Owner', value: 'Head of Personal Banking', editable: true },
                { id: 'meta3', key: 'Process Trigger', value: 'Customer initiates a Personal Instalment Loan (PIL) application', editable: true },
                { id: 'meta4', key: 'Process End', value: '- Customer receives access to loan funds in their account = successful application\n- Customer receives notification that their application is unsuccesful = unsuccessful application', editable: true },
                { id: 'meta5', key: 'Channels', value: 'Digital (mobile app + staff tablets)\nManual (paper forms)', editable: true },
                { id: 'meta6', key: 'Customer Segments', value: 'This journey covers new to bank (NTB) and existing to bank (ETB) onboarding for any consumer customer', editable: true },
                { id: 'meta7', key: 'Associated Product', value: 'Personal Loan PPG', editable: true },
                { id: 'obj1', key: 'Objective: Speed', value: 'Provide PIL full approval to individual customers within 15 mins in Full STP best scenario, followed by STP Loan funds disbursal process leading to the shortest possible time.', editable: true },
                { id: 'obj2', key: 'Objective: Validation', value: 'Use government data sources to validate customer identity, salary, and employer to strengthen controls and minimize reliance on customer submitted documents.', editable: true },
                { id: 'obj3', key: 'Objective: Risk', value: 'Manage attendant risks and scalability requirements.', editable: true },
                { id: 'cons1', key: 'Process Considerations', value: 'The PIL onboarding process is in a state of transition with the new digital journey being developed and rolled to specific customer cohorts over the course of 2026. Whilst this is happening the process needs to accommodate both manual and digitally initiated PIL applications. Once the digital journey is available to all customer types, the manual applciation form will be retired from use.', editable: true },
                { id: 'qa1', key: 'Quality Assurance', value: 'The Credit QA process assures the full PIL onboarding journey and the included sub-processes. The Credit QA process is managed and delivered by the Credit QA team, it is governed by the Credit QA SOP.\nThe CASA KYC QA process assures the CASA onboarding journey in line with EDD / CDD requirements. The CASA KYC QA process is managed and delivered by the KYC team and is governed by the KYC QA SOP.', editable: true }
            ],
            definition: rows,
            risks: [
                { id: 'r1', key: 'R1', value: 'Customer provides invalid or forged documents.', editable: true },
                { id: 'r2', key: 'R2', value: 'Incomplete application forms leading to rejection.', editable: true },
                { id: 'r3', key: 'R3', value: 'PEP/Sanction screening failure not detected.', editable: true },
                { id: 'r4', key: 'R4', value: 'Fraudulent employer details.', editable: true },
                { id: 'r5', key: 'R5', value: 'Banking Statement manipulation.', editable: true },
                { id: 'r6', key: 'R6', value: 'Incorrect Risk Rating assignment.', editable: true },
                { id: 'r7', key: 'R7', value: 'Address validation failure.', editable: true },
                { id: 'r8', key: 'R8', value: 'Eligibility criteria assessment error.', editable: true },
                { id: 'r9', key: 'R9', value: 'Data entry errors in T24.', editable: true },
                { id: 'r10', key: 'R10', value: 'Unresolved exception flags.', editable: true },
                { id: 'r11', key: 'R11', value: 'Duplicate Customer ID creation.', editable: true },
                { id: 'r12', key: 'R12', value: 'Post-onboarding control failure.', editable: true }
            ]
        };
    }
};
