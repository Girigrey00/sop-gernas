

// Enums for clarity
export enum StepType {
  Start = 'Start',
  End = 'End',
  CustomerInput = 'Customer input',
  System = 'System',
  Decision = 'Decision',
  Control = 'Control',
  Manual = 'Manual'
}

// Data structures matching the JSON provided
export interface Risk {
  riskId: string;
  riskType: string;
  description: string;
  category: string;
}

export interface Control {
  controlId: string;
  name: string;
  type: string;
  description: string;
}

export interface DecisionBranch {
  condition: string;
  nextStep: string;
}

export interface ProcessStep {
  stepId: string;
  stepName: string;
  description: string;
  actor: string;
  stepType: string;
  nextStep: string | null;
  decisionBranches?: DecisionBranch[];
  risksMitigated?: string[]; // IDs
  controls?: Control[];
  policies?: string[]; // Added support for policies list
  automationLevel?: string;
  manualEffort?: number;
}

export interface ProcessStage {
  stageId: string;
  stageName: string;
  description: string;
  steps: ProcessStep[];
}

export interface ProcessDefinition {
  title: string;
  version: string;
  classification: string;
  documentLink: string;
}

export interface Metric {
    metricId: string;
    type: string;
    description: string;
    target: string;
    unit: string;
    currentValue?: string | number; // Added for dashboard viz
}

export interface SopResponse {
  startNode: ProcessStep;
  endNode: ProcessStep;
  processDefinition: ProcessDefinition;
  processObjectives: any[];
  inherentRisks: Risk[];
  processFlow: {
    stages: ProcessStage[];
  };
  metricsAndMeasures?: Metric[];
  policiesAndStandards?: any[];
  qualityAssurance?: any[];
  metadata?: any;
}

// --- History & Chat API Types ---

export interface ChatMessageDetail {
    question_id: string;
    question: string;
    answer: string;
    citations?: Record<string, string>;
    clarification_needed?: boolean;
    timestamp: string;
}

export interface ChatSessionDetail {
    _id: string;
    user_id: string;
    product: string;
    index_name: string;
    created_at: string;
    last_activity: string;
    metadata: any;
    messages: ChatMessageDetail[];
}

export interface ChatSession {
    _id: string;
    session_id?: string;
    user_id?: string;
    product: string;
    index_name: string;
    created_at: string;
    last_activity: string;
    message_count: number;
    last_message?: {
        question_id?: string;
        question: string;
        answer: string;
        timestamp: string;
    };
    session_title?: string;
    // UI Helpers
    title?: string; // Derived from last message or product
}

export interface HistoryItem {
    id: string;
    timestamp: string;
    title: string;
    prompt: string;
    data?: SopResponse; // Optional now as we fetch fresh
    productName?: string; // For API fetching
    sessionId?: string;
}

// --- New Library Document Interface ---
export interface LogEntry {
    timestamp: string;
    message: string;
    status: string;
}

export interface LibraryDocument {
  id: string;
  sopName: string; // Often serves as Product ID context
  documentName: string;
  description: string;
  pageCount: number;
  uploadedBy: string;
  uploadedDate: string;
  indexName: string;
  status: 'Active' | 'Draft' | 'Archived' | 'Processing' | 'Completed' | 'Failed' | 'Uploading';
  version: string;
  
  // Enhanced Fields for GERNAS
  rootFolder?: string; // Mapped to Product Name
  progressPercentage?: number;
  logs?: LogEntry[];
  latestLog?: string;
  totalPages?: number;
  categoryDisplay?: string; // "SOP" or "Process Definition"
  suggested_questions?: string[]; // AI Generated Questions

  metadata?: {
      linkedApp?: string;
      productId?: string;
      category?: string;
      generate_flow?: boolean;
      [key: string]: any;
  };
}

// --- Flow Logs ---
export interface FlowLog {
    timestamp: string;
    step: string;
    message: string;
    status: string;
    progress?: number;
}

// --- Product Interface ---
export interface Product {
    _id: string;
    id: string;
    product_name: string;
    index_name: string;
    process_flow_id?: string;
    has_index: "Yes" | "No";
    has_flow: "Yes" | "No";
    document_count: number;
    description?: string;
    
    // Enhanced Flow Status Fields
    flow_status?: string; // e.g., "Completed", "Processing", "Failed", or null
    flow_source_file?: string;
    flow_blob_url?: string;
    flow_error_message?: string | null;
    flow_last_generated?: string;
    
    // Live Stats from API
    flow_logs?: FlowLog[];
    flow_progress?: number;
    flow_current_step?: string;
    
    created_at?: string;
    last_updated?: string;
    metadata?: any;
}

// --- Chat & Feedback Types ---
export interface FeedbackPayload {
    question_id: string;
    session_id: string;
    feedback_type: 'thumbs_up' | 'thumbs_down';
    comment?: string;
    jwt_token?: string;
}

// Layout types
export type LayoutType = 'SWIMLANE' | 'TREE' | 'HORIZONTAL';

// Navigation types
export type View = 'HOME' | 'CANVAS' | 'HISTORY' | 'SOPS' | 'LIBRARY';
