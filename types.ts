
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

export interface HistoryItem {
    id: string;
    timestamp: string;
    title: string;
    prompt: string;
    data: SopResponse;
}

// Layout types
export type LayoutType = 'SWIMLANE' | 'TREE' | 'HORIZONTAL';

// Navigation types
export type View = 'HOME' | 'CANVAS' | 'HISTORY' | 'SOPS' | 'LIBRARY';