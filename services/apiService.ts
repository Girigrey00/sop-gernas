
import { LibraryDocument, SopResponse, Product, ChatSession, FeedbackPayload, ChatSessionDetail, ProcessDefinitionRow, BuilderResponse, CreateProcessRequest, CreateProcessResponse, ProcessStatusResponse, ProcessResultData, KeyValueItem, UpdateProcessRequest, ProcessStepResult } from '../types';

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

// ... [Keep existing mockChatStream and JsonStreamParser classes] ...
// Mock Chat Logic for Demo/Fallback
const mockChatStream = async (payload: any) => {
    // ... [Same implementation as before] ...
    const question = payload.question.toLowerCase();
    let answer = "I'm processing your request based on the policy documents. Please be specific about the section you're interested in.";
    let related: string[] = ["Show policy summary", "List all risks"];

    if (question.includes('risk') && question.includes('step 3')) {
        answer = "### Risks in Step 3 (Employer Validation)\n\nBased on the analysis, here are the inherent risks identified in Step 3:\n\n**R4: Fraud - Employer (High)**\nRisk of applicants misrepresenting their employer details to qualify for products restricted to listed companies.\n\n**R5: Fraud - Banking (Medium)**\nPotential manipulation of salary transfer letters or banking statements.\n\n**R11: Compliance - Rules (Low)**\nFailure to adhere to Central Bank regulations regarding Debt Burden Ratio (DBR) calculations for specific employer categories.";
        related = ["What controls are in place for R4?", "Show me the control effectiveness", "List all fraud risks"];
    } else if (question.includes('hello') || question.includes('hi')) {
        answer = "Hello! I am your Policy Standards Assistant. I can help you navigate the Group Information Security Policy and other standard operating procedures. What would you like to know?";
        related = ["What risks are in this policy?", "List the key controls"];
    }

    const tokens = answer.match(/[\s\S]{1,5}/g) || [];
    for (const token of tokens) {
        await new Promise(r => setTimeout(r, 20));
        payload.onToken(token);
    }
    
    if (payload.onComplete) {
        await new Promise(r => setTimeout(r, 100));
        payload.onComplete({
            citations: {
                "[1] Policy Definition v2.1": "Section 4: Risk Management Framework",
            },
            related_questions: related
        });
    }
};

// ... [Keep JsonStreamParser class] ...
class JsonStreamParser {
    // ... [Same implementation as before] ...
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
        if (!this.hasCheckJson) {
            this.buffer += chunk;
            const trimmed = this.buffer.trimStart();
            if (trimmed.length === 0) return; 
            if (trimmed.startsWith('{') || trimmed.includes('"answer"')) {
                this.isJson = true;
                this.hasCheckJson = true;
                this.buffer = trimmed; 
            } else if (trimmed.length > 50) {
                this.isJson = false;
                this.hasCheckJson = true;
                this.onToken(this.buffer);
                this.buffer = '';
            }
        } 
        
        if (!this.isJson && this.hasCheckJson) {
            this.onToken(chunk);
            return;
        }

        if (this.isJson) {
            if (!this.inAnswer && !this.answerDone) {
                this.buffer += chunk;
                const match = this.buffer.match(/"answer"\s*:\s*"/);
                if (match) {
                    this.inAnswer = true;
                    const startIdx = (match.index || 0) + match[0].length;
                    const remaining = this.buffer.substring(startIdx);
                    this.buffer = ''; 
                    this.processStringContent(remaining);
                }
            } 
            else if (this.inAnswer) {
                this.processStringContent(chunk);
            } 
            else if (this.answerDone) {
                this.citationsBuffer += chunk;
            }
        }
    }

    private processStringContent(text: string) {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (this.isEscaped) {
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
                    this.inAnswer = false;
                    this.answerDone = true;
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
            try {
                const citKeyIndex = this.citationsBuffer.indexOf('"citations"');
                if (citKeyIndex !== -1) {
                    const startBrace = this.citationsBuffer.indexOf('{', citKeyIndex);
                    if (startBrace !== -1) {
                        const endIndex = this.citationsBuffer.lastIndexOf('}');
                        if (endIndex > startBrace) {
                            const jsonStr = this.citationsBuffer.substring(startBrace, endIndex + 1);
                            try { result.citations = JSON.parse(jsonStr); } catch(e) {}
                        }
                    }
                }
            } catch (e) { }
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
    updateProcessFlowFromTable(productName: string, tableData: ProcessDefinitionRow[], originalSop?: SopResponse, objectives?: KeyValueItem[], risks?: KeyValueItem[], processId?: string): Promise<SopResponse>;
    generateTableFromBuilder(inputs: { 
        productName: string, 
        stages: { id: number, name: string, files: File[], raci?: string }[],
        onLog?: (message: string, progress: number) => void 
    }): Promise<BuilderResponse>;
    createProcess(payload: CreateProcessRequest): Promise<CreateProcessResponse>;
    updateProcess(processId: string, payload: UpdateProcessRequest): Promise<ProcessStatusResponse>;
    getProcessStatus(processId: string): Promise<ProcessStatusResponse>;
    mapProcessResultToBuilder(data: ProcessResultData): BuilderResponse;
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
            return { status: 'ok', session_id: payload.session_id };
        }
    },

    // --- Chat Endpoint ---
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
                    'Accept': 'text/event-stream, application/json' 
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
                 console.warn("Backend chat failed, switching to mock mode for demo.");
                 await mockChatStream(payload);
                 return;
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (data.answer) payload.onToken(data.answer);
                if (payload.onComplete) {
                    payload.onComplete({
                        citations: data.citations,
                        related_questions: data.related_questions || data.suggestions
                    });
                }
                return;
            }

            if (!response.body) throw new Error("ReadableStream not supported in this browser.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = '';

            const parser = new JsonStreamParser(
                payload.onToken,
                (data) => { if (payload.onComplete) payload.onComplete(data); }
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
                            if (data.token) parser.process(data.token);
                            if (data.citations || data.related_questions) {
                                if (payload.onComplete) payload.onComplete({ citations: data.citations, related_questions: data.related_questions });
                            }
                            if (data.answer && !data.token && typeof data.answer === 'string' && !data.answer.trim().startsWith('{')) {
                                payload.onToken(data.answer);
                            }
                        } catch (e) { console.warn("Failed to parse SSE JSON:", trimmedLine); }
                    }
                }
            }
            parser.finish();
            if (payload.onComplete) payload.onComplete();

        } catch (error: any) {
            console.error("Streaming Error:", error);
            await mockChatStream(payload);
        }
    },

    // --- Feedback ---
    submitFeedback: async (feedback: FeedbackPayload): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedback)
            });
            return handleResponse(response);
        } catch (error) {
            return { status: "success" };
        }
    },

    // --- History/Product/Document Endpoints (Unchanged structure) ---
    getChatSessions: async (): Promise<ChatSession[]> => {
        try {
            const res = await fetch(`${API_BASE_URL}/history/sessions`);
            if (res.ok) {
                const data = await res.json();
                return data.sessions || [];
            }
            return [];
        } catch (e) { return []; }
    },

    getChatSessionDetails: async (sessionId: string): Promise<ChatSessionDetail | null> => {
        try {
            const res = await fetch(`${API_BASE_URL}/history/sessions/${sessionId}`);
            if(res.ok) return await res.json();
            return null;
        } catch (e) { return null; }
    },

    getProducts: async (): Promise<Product[]> => {
        try {
            const data = await handleResponse(await fetch(`${API_BASE_URL}/products`));
            const productsRaw = data.products || [];
            return productsRaw.map((p: any) => ({
                ...p,
                description: p.metadata?.product_description || p.description || 'No description available'
            }));
        } catch (e) { return []; }
    },

    createProduct: async (product): Promise<any> => {
        return handleResponse(await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        }));
    },

    deleteProduct: async (productName): Promise<any> => {
        return handleResponse(await fetch(`${API_BASE_URL}/products/${productName}`, { method: 'DELETE' }));
    },

    getDocuments: async (): Promise<LibraryDocument[]> => {
        try {
            const data = await handleResponse(await fetch(`${API_BASE_URL}/documents?limit=100`));
            return data.map((doc: any) => {
                const rawCategory = doc.category || 'General';
                let categoryDisplay = rawCategory;
                if (doc.generate_flow === true || (doc.metadata && doc.metadata.generate_flow === true)) {
                    categoryDisplay = 'Process Definition';
                } else if (['Policy', 'Procedure', 'Manual', 'KnowledgeBase'].includes(rawCategory)) {
                    categoryDisplay = 'Policy Documents';
                }
                
                const latestLog = doc.logs && Array.isArray(doc.logs) && doc.logs.length > 0 ? doc.logs[doc.logs.length - 1].message : null;

                return {
                    id: doc._id || doc.id,
                    sopName: doc.product_id || doc.file_name,
                    documentName: doc.file_name,
                    description: doc.summary || 'No description available',
                    pageCount: doc.total_pages || doc.page_count || 0,
                    totalPages: doc.total_pages || 0,
                    uploadedBy: doc.uploaded_by || 'Unknown',
                    uploadedDate: doc.start_time ? new Date(doc.start_time).toLocaleDateString() : new Date().toLocaleDateString(),
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
        } catch(e) { return []; }
    },

    uploadToAzure: async (file: File): Promise<string> => {
        const sasUrl = new URL(AZURE_SAS_URL);
        const fileName = encodeURIComponent(file.name);
        const realBlobUrl = `${sasUrl.origin}${sasUrl.pathname}/${fileName}${sasUrl.search}`;
        const isDev = import.meta.env.MODE === 'development';
        const uploadUrl = isDev ? `/azure-blob${sasUrl.pathname}/${fileName}${sasUrl.search}` : realBlobUrl;
        
        console.log(`Uploading to ${isDev ? 'Proxy' : 'Direct'} URL:`, uploadUrl);

        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': file.type || 'application/octet-stream'
            },
            body: file
        });

        if (!response.ok) throw new Error(`Azure Upload Failed: ${response.statusText}`);
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

    deleteDocument: async (docId, indexName): Promise<any> => {
        const url = `${API_BASE_URL}/documents/${docId}?index_name=${indexName || ''}`;
        return handleResponse(await fetch(url, { method: 'DELETE' }));
    },

    getProcessFlow: async (productName): Promise<SopResponse> => {
        const url = `${API_BASE_URL}/process-flow/${productName}`;
        try {
            const json = await handleResponse(await fetch(url));
            if (json.status === 'Processing') throw { status: 'Processing', message: json.message };
            if (json.status === 'Failed') throw { status: 'Failed', message: json.message };
            
            const core = json.process_flow || json.processFlow || json;
            if (!core) throw new Error("Invalid API Response");

            const flowContainer = core.processFlow || core.process_flow || {};
            const rawStages = flowContainer.stages || core.stages || [];

            // Map backend structure to frontend structure
            const stages = rawStages.map((s: any) => ({
                stageId: s.stageId || s.stage_id,
                stageName: s.stageName || s.stage_name,
                description: s.description,
                summary: s.summary,
                keyActivities: s.keyActivities || s.key_activities,
                keyControls: s.keyControls || s.key_controls,
                keyRisks: s.keyRisks || s.key_risks,
                inputs: s.inputs,
                outputs: s.outputs,
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
                    standards: st.standards || [],
                    automationLevel: st.automationLevel || st.automation_level,
                    raciTeams: st.raciTeams || st.raci_teams,
                    processingTime: st.processingTime || st.processing_time,
                    sla: st.sla,
                    kpi: st.kpi,
                    systemInUse: st.systemInUse || st.system
                }))
            }));

            return {
                startNode: core.startNode || core.start_node,
                endNode: core.endNode || core.end_node,
                processDefinition: core.processDefinition || core.process_definition,
                processObjectives: core.processObjectives || core.process_objectives || [],
                inherentRisks: core.inherentRisks || core.inherent_risks || [],
                processFlow: { stages: stages },
                metricsAndMeasures: core.metricsAndMeasures || core.metrics_and_measures || [],
                policiesAndStandards: core.policiesAndStandards || core.policies_and_standards || [],
                qualityAssurance: core.qualityAssurance || core.quality_assurance || [],
                metadata: {
                    ...core.metadata || json.metadata,
                    processId: json.processId || core.processId // Ensure ID is passed for later edits
                }
            };
        } catch (e) { throw e; }
    },

    getProcessTable: async (productName, sopData): Promise<ProcessDefinitionRow[]> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (!sopData || !sopData.processFlow || !sopData.processFlow.stages) return [];

        const rows: ProcessDefinitionRow[] = [];
        sopData.processFlow.stages.forEach(stage => {
            stage.steps.forEach(step => {
                const controlsStr = (step.controls || []).map(c => c.name).join(', ');
                const policiesStr = (step.policies || []).join(', ');
                // Need to map these from the SOP object structure if they exist there, currently not part of standard sopResponse but might be added
                // Assuming simple mapping for now
                rows.push({
                    id: step.stepId,
                    l2Process: stage.stageName,
                    stepName: step.stepName,
                    stepDescription: step.description,
                    stepType: step.stepType,
                    system: step.systemInUse || 'System',
                    actor: step.actor,
                    processingTime: step.processingTime || '10', 
                    risks: step.risksMitigated ? step.risksMitigated.join(', ') : '',
                    controls: controlsStr,
                    policies: policiesStr,
                    relatedDocuments: '', // Not in standard SopResponse yet
                    sourceDocument: '' // Not in standard SopResponse yet
                });
            });
        });
        return rows;
    },

    updateProcessFlowFromTable: async (productName, tableData, originalSop, objectives, risks, processId): Promise<SopResponse> => {
        // If we have a processId, we use the PUT endpoint to perform a real update
        if (processId) {
            console.log("Updating Process via API...", processId);
            
            // 1. Group rows by Stage (l2Process)
            const stageGroups = new Map<string, ProcessDefinitionRow[]>();
            tableData.forEach(row => {
                if (!stageGroups.has(row.l2Process)) stageGroups.set(row.l2Process, []);
                stageGroups.get(row.l2Process)?.push(row);
            });

            // 2. Construct Stage Payloads
            const stagePayloads: any[] = [];
            let sCounter = 1;
            
            // We iterate stage groups to build payload
            // Ideally we should try to match with original stage IDs if possible
            const originalStages = originalSop?.processFlow?.stages || [];

            stageGroups.forEach((rows, stageName) => {
                const originalStage = originalStages.find(s => s.stageName === stageName);
                const stageId = originalStage?.stageId || `S${sCounter++}`;
                
                const stepsPayload = rows.map(row => {
                    // Try to preserve original step details (controls, policies)
                    const originalStep = originalStage?.steps.find(s => s.stepId === row.id);
                    
                    // Parse comma-separated strings back to arrays
                    const controlsList = row.controls ? row.controls.split(',').map((c, i) => ({
                        controlId: originalStep?.controls?.[i]?.controlId || `CTRL-${Math.random().toString(36).substr(2, 5)}`,
                        name: c.trim(),
                        type: originalStep?.controls?.[i]?.type || 'M'
                    })) : [];

                    const policiesList = row.policies ? row.policies.split(',').map(p => p.trim()) : [];
                    
                    return {
                        stepId: row.id,
                        stepName: row.stepName,
                        description: row.stepDescription,
                        actor: row.actor,
                        stepType: row.stepType,
                        systemInUse: row.system,
                        processingTime: row.processingTime,
                        risksMitigated: row.risks ? row.risks.split(',').map(r => r.trim()) : [],
                        controls: controlsList,
                        policies: policiesList,
                        relatedDocuments: row.relatedDocuments || "",
                        sourceDocument: row.sourceDocument || ""
                    };
                });

                stagePayloads.push({
                    stageId: stageId,
                    stageName: stageName,
                    description: originalStage?.description || stageName, // Default if unknown
                    originalStageId: (originalStage as any)?.originalStageId || 0,
                    steps: stepsPayload,
                    documentsSummary: (originalStage as any)?.documentsSummary || []
                });
            });

            // 3. Construct Objectives Payload
            const objPayload = objectives?.map(obj => ({
                id: obj.id,
                description: obj.value,
                type: obj.key // Using key as type (e.g. 'Speed', 'Compliance')
            })) || [];

            // 4. Call PUT API
            const updateResponse = await apiService.updateProcess(processId, {
                stages: stagePayloads,
                processObjectives: objPayload
            });

            // 5. Map Result back to SopResponse
            if (!updateResponse.result_data) throw new Error("Update failed, no result data");
            
            // Re-use getProcessFlow logic indirectly by mapping result_data to SopResponse manually here
            // (or ideally fetch getProcessFlow again, but let's use the response to avoid latency)
            const mapped = apiService.mapProcessResultToBuilder(updateResponse.result_data);
            
            // We need to convert BuilderResponse back to SopResponse structure for the Canvas
            const core = updateResponse.result_data;
            const stages = core.stages.map((s: any) => ({
                stageId: s.stageId,
                stageName: s.stageName,
                description: s.description,
                steps: s.steps.map((st: any) => ({
                    stepId: st.stepId,
                    stepName: st.stepName,
                    description: st.description,
                    actor: st.actor,
                    stepType: st.stepType,
                    nextStep: null, // Backend should ideally provide nextStep or we infer it
                    risksMitigated: st.risksMitigated,
                    controls: st.controls,
                    policies: st.policies,
                    systemInUse: st.systemInUse,
                    processingTime: st.processingTime
                }))
            }));

            // Auto-link next steps sequentially for visualization
            stages.forEach(stage => {
                stage.steps.forEach((step, idx) => {
                    if (idx < stage.steps.length - 1) {
                        step.nextStep = stage.steps[idx + 1].stepId;
                    } else {
                        // Check if there is a next stage
                        const currentStageIdx = stages.findIndex(s => s.stageId === stage.stageId);
                        if (currentStageIdx < stages.length - 1) {
                            // Link to first step of next stage
                            const nextStage = stages[currentStageIdx + 1];
                            if (nextStage.steps.length > 0) {
                                step.nextStep = nextStage.steps[0].stepId;
                            }
                        } else {
                            step.nextStep = 'END';
                        }
                    }
                });
            });

            return {
                startNode: { stepId: 'START', stepName: 'Start', description: 'Start', actor: 'System', stepType: 'Start', nextStep: stages[0]?.steps[0]?.stepId || null },
                endNode: { stepId: 'END', stepName: 'End', description: 'End', actor: 'System', stepType: 'End', nextStep: null },
                processDefinition: { title: core.productName, version: '1.1', classification: 'Internal', documentLink: '#' },
                processObjectives: core.processObjectives || [],
                inherentRisks: [], // Extract from steps if needed
                processFlow: { stages },
                metadata: { processId: core.processId }
            } as SopResponse;

        } else {
            // FALLBACK LOCAL LOGIC (Keep existing implementation for safety/demos)
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            const newSop = JSON.parse(JSON.stringify(originalSop || {})) as SopResponse;
            const stagesMap = new Map<string, any>();
            
            tableData.forEach(row => {
                if (!stagesMap.has(row.l2Process)) {
                    const existingStage = newSop.processFlow?.stages?.find(s => s.stageName === row.l2Process);
                    stagesMap.set(row.l2Process, existingStage || {
                        stageId: `S${stagesMap.size + 1}`,
                        stageName: row.l2Process,
                        description: row.l2Process,
                        steps: []
                    });
                }
            });

            stagesMap.forEach(stage => stage.steps = []);
            const allSteps: any[] = [];
            
            tableData.forEach((row, index) => {
                const stage = stagesMap.get(row.l2Process);
                const step: any = {
                    stepId: row.id || `ST-${index + 1}`,
                    stepName: row.stepName,
                    description: row.stepDescription,
                    actor: row.actor,
                    stepType: row.stepType,
                    processingTime: row.processingTime,
                    risksMitigated: row.risks ? row.risks.split(',').map(r => r.trim()) : [],
                    systemInUse: row.system,
                    controls: [],
                    policies: [],
                    nextStep: null 
                };
                stage.steps.push(step);
                allSteps.push(step);
            });

            for (let i = 0; i < allSteps.length; i++) {
                if (i < allSteps.length - 1) allSteps[i].nextStep = allSteps[i+1].stepId;
                else allSteps[i].nextStep = 'END';
            }

            newSop.processFlow = { stages: Array.from(stagesMap.values()) };
            if (allSteps.length > 0 && newSop.startNode) newSop.startNode.nextStep = allSteps[0].stepId;
            return newSop;
        }
    },

    // --- Create Process API Methods ---

    createProcess: async (payload: CreateProcessRequest): Promise<CreateProcessResponse> => {
        return handleResponse(await fetch(`${API_BASE_URL}/createprocess`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }));
    },

    updateProcess: async (processId: string, payload: UpdateProcessRequest): Promise<ProcessStatusResponse> => {
        return handleResponse(await fetch(`${API_BASE_URL}/createprocess/${processId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }));
    },

    getProcessStatus: async (processId: string): Promise<ProcessStatusResponse> => {
        return handleResponse(await fetch(`${API_BASE_URL}/createprocess/${processId}`));
    },

    // New Helper: Generate table using the Create Process Flow
    generateTableFromBuilder: async (inputs: { 
        productName: string, 
        stages: { id: number, name: string, files: File[], raci?: string }[], 
        onLog?: (message: string, progress: number) => void 
    }): Promise<BuilderResponse> => {
        
        // 1. Upload Files for each stage
        const stagePayloads = [];
        for (const stage of inputs.stages) {
            if (inputs.onLog) inputs.onLog(`Uploading documents for stage: ${stage.name}...`, 10);
            
            const docUrls = [];
            for (const file of stage.files) {
                const url = await apiService.uploadToAzure(file);
                docUrls.push(url);
            }
            
            stagePayloads.push({
                id: stage.id,
                stageName: stage.name,
                documents: docUrls,
                raci: stage.raci // Pass optional RACI
            });
        }

        // 2. Initiate Process Creation
        if (inputs.onLog) inputs.onLog("Initiating process generation...", 20);
        
        const createRes = await apiService.createProcess({
            productName: inputs.productName,
            stages: stagePayloads
        });
        
        const processId = createRes.processId;

        // 3. Poll for Completion
        let statusRes: ProcessStatusResponse;
        while (true) {
            await new Promise(r => setTimeout(r, 2000)); // 2s polling delay
            
            statusRes = await apiService.getProcessStatus(processId);
            
            if (inputs.onLog) {
                const msg = statusRes.logs && statusRes.logs.length > 0 
                    ? statusRes.logs[statusRes.logs.length-1].message 
                    : `Processing... ${statusRes.current_step}`;
                inputs.onLog(msg, statusRes.progress);
            }

            if (statusRes.status === 'completed' || statusRes.status === 'failed') break;
        }

        if (statusRes.status === 'failed') {
            throw new Error(statusRes.error_message || "Process generation failed.");
        }

        // 4. Map Result to BuilderResponse
        if (!statusRes.result_data) throw new Error("No result data returned.");
        
        return apiService.mapProcessResultToBuilder(statusRes.result_data);
    },

    mapProcessResultToBuilder: (data: ProcessResultData): BuilderResponse => {
        const definitions: ProcessDefinitionRow[] = [];
        const risks: KeyValueItem[] = [];
        const riskSet = new Set<string>(); 

        data.stages.forEach(stage => {
            stage.steps.forEach(step => {
                // Flatten Arrays to Strings for Table Display
                const controlsStr = (step.controls || []).map(c => c.name).join(', ');
                const policiesStr = (step.policies || []).join(', ');
                const relatedDocsStr = step.relatedDocuments || '';
                const sourceDocStr = step.sourceDocument || '';

                definitions.push({
                    id: step.stepId,
                    l2Process: stage.stageName,
                    stepName: step.stepName,
                    stepDescription: step.description,
                    stepType: step.stepType,
                    system: step.systemInUse || 'None',
                    actor: step.actor,
                    processingTime: step.processingTime || '',
                    risks: (step.risksMitigated || []).join(', '),
                    // New Mapped Fields
                    controls: controlsStr,
                    policies: policiesStr,
                    relatedDocuments: relatedDocsStr,
                    sourceDocument: sourceDocStr
                });

                if (step.risksMitigated) {
                    step.risksMitigated.forEach(r => {
                        if (!riskSet.has(r)) {
                            riskSet.add(r);
                            risks.push({
                                id: `risk-${riskSet.size}`,
                                key: r,
                                value: `Risk identified in step ${step.stepId}`,
                                editable: true
                            });
                        }
                    });
                }
            });
        });

        // Map Objectives from API Result
        const objectives: KeyValueItem[] = (data.processObjectives || []).map((obj, idx) => ({
            id: obj.id || `obj-${idx}`,
            key: obj.type || 'Objective',
            value: obj.description,
            editable: true
        }));

        if (objectives.length === 0) {
            objectives.push({ id: 'obj1', key: 'Process Goal', value: 'Generated from process documents.', editable: true });
        }

        return {
            processId: data.processId, // CRITICAL: Pass ID for updates
            objectives,
            definition: definitions,
            risks,
            rawResultData: data // Store for reconstruction
        };
    }
};
