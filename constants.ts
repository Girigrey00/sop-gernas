
import { SopResponse } from './types';

export const MOCK_SOP_DATA: SopResponse = {
  "processDefinition": {
    "title": "Personal Installment Loan (PIL) Process Flow",
    "version": "1.0",
    "classification": "Internal",
    "documentLink": "#"
  },
  "startNode": {
    "stepId": "START",
    "stepName": "Start",
    "description": "Process initiation",
    "actor": "Customer",
    "stepType": "Start",
    "nextStep": "S1-1"
  },
  "endNode": {
    "stepId": "END",
    "stepName": "End",
    "description": "Process completion",
    "actor": "Group Credit",
    "stepType": "End",
    "nextStep": null
  },
  "processFlow": {
    "stages": [
      {
        "stageId": "S1",
        "stageName": "Customer details & product selection",
        "description": "Customer details & product selection",
        "steps": []
      }
    ]
  },
  "inherentRisks": [],
  "processObjectives": [],
  "metricsAndMeasures": [],
  "policiesAndStandards": [],
  "qualityAssurance": [],
  "metadata": {
    "lastUpdated": "2025-10-14",
    "version": "1.0",
    "owner": "Process Excellence Team",
    "status": "Active"
  }
};

export const INITIAL_PROMPTS = [
    "Create a Personal Loan Onboarding SOP",
    "Generate a Credit Card Application Flow",
    "Show me a standard KYC update process"
];

export const WIDGET_DEMO_DATA = {
  "question_id": "widget-gallery-demo-001",
  "session_id": "sess-demo-123",
  "product": "Personal Loan",
  "timestamp": "2025-10-27T10:00:00Z",
  "answer": "### 🧩 GERNAS A2UI Component Gallery\nHere is a full demonstration.",
  "citations": {},
  "related_questions": []
};

// FULL PDF DATA EXTRACTION - STRUCTURED FOR GRID LAYOUT
export const DUMMY_PROCESS_ANALYSIS_DATA = {
  "nodes": [
    /* ------------------------------------------------------------------
       ROW 1: Customer details & product selection
       ------------------------------------------------------------------ */
    {
      "id": "l2-1",
      "data": { "label": "1. Customer details & product selection" },
      "className": "l2-process-node"
    },
    {
      "id": "data-1",
      "data": { "label": "Customer name\nEID\nEmail\nPhone" },
      "className": "data-node"
    },
    {
      "id": "risk-1a",
      "data": { "label": "Fraud\n(Existing Customer/WIP)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-1a",
      "data": { "label": "Existing FAB customer check (A)\nApp WIP dropped (A)" },
      "className": "control-node"
    },
    {
      "id": "risk-1b",
      "data": { "label": "Compliance Risk\n(Restricted Countries)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-1b",
      "data": { "label": "Restricted countries check (A)\nEID/UAEPASS + OTP (A)" },
      "className": "control-node"
    },
    {
      "id": "out-1",
      "data": { "label": "New application record" },
      "className": "output-node"
    },

    /* ------------------------------------------------------------------
       ROW 2: Pre-eligibility + customer ID&V
       ------------------------------------------------------------------ */
    {
      "id": "l2-2",
      "data": { "label": "2. Pre-eligibility + customer ID&V" },
      "className": "l2-process-node"
    },
    {
      "id": "data-2",
      "data": { "label": "EID copy (digital)" },
      "className": "data-node"
    },
    {
      "id": "risk-2a",
      "data": { "label": "Fraud\n(Identity)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-2a",
      "data": { "label": "OCR EID scan (EFR) (A)" },
      "className": "control-node"
    },
    {
      "id": "risk-2b",
      "data": { "label": "Reputation Risk\n(Eligibility)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-2b",
      "data": { "label": "Income check (+7K) (A)\nMin age (A)\nAECB (711+) (A)\nNegative Checklist (A)\nFraud Watchlist (A)" },
      "className": "control-node"
    },
    {
      "id": "out-2",
      "data": { "label": "Affordability assessment results" },
      "className": "output-node"
    },

    /* ------------------------------------------------------------------
       ROW 3: Employer and salary validation
       ------------------------------------------------------------------ */
    {
      "id": "l2-3",
      "data": { "label": "3. Employer and salary validation" },
      "className": "l2-process-node"
    },
    {
      "id": "data-3",
      "data": { "label": "Employer details\nSalary amount\nUID / TL\nReports (EFR/AECB)" },
      "className": "data-node"
    },
    {
      "id": "risk-3a",
      "data": { "label": "Fraud\n(Employer Category)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-3a",
      "data": { "label": "Employer category check (A)\nEmployer name/details (A)\nUnique identifiers (A)\nTML validation (A)\nNew employer verification (P)" },
      "className": "control-node"
    },
    {
      "id": "risk-3b",
      "data": { "label": "Fraud\n(Salary Source)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-3b",
      "data": { "label": "IBAN validation (A)\nAffordability (CPR) (A)\nSalary details check (A)\nVerify salary source (A)\nVariance threshold (A)" },
      "className": "control-node"
    },
    {
      "id": "risk-3c",
      "data": { "label": "Compliance Risk\n(Salary Logic)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-3c",
      "data": { "label": "Calculated salary logic (A)\nCustomer comms (A)" },
      "className": "control-node"
    },
    {
      "id": "out-3",
      "data": { "label": "Validation response (y/n)\nTML enrichment\nAECB report" },
      "className": "output-node"
    },

    /* ------------------------------------------------------------------
       ROW 4: Credit underwriting
       ------------------------------------------------------------------ */
    {
      "id": "l2-4",
      "data": { "label": "4. Credit underwriting" },
      "className": "l2-process-node"
    },
    {
      "id": "data-4",
      "data": { "label": "Internal Credit Score\nDBR\nOffer Letter" },
      "className": "data-node"
    },
    {
      "id": "risk-4a",
      "data": { "label": "Credit Risk" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-4a",
      "data": { "label": "Credit decision engine (A)" },
      "className": "control-node"
    },
    {
      "id": "risk-4b",
      "data": { "label": "Operational Risk" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-4b",
      "data": { "label": "Mandatory Life insurance (A)\nInsurance acceptance form (A)\nInsurance onboarding (M)\nLink insurance to CIF (A)" },
      "className": "control-node"
    },
    {
      "id": "out-4",
      "data": { "label": "Internal credit score\nDBR\nPIL offer letter" },
      "className": "output-node"
    },

    /* ------------------------------------------------------------------
       ROW 5: CASA account opening & insurance
       ------------------------------------------------------------------ */
    {
      "id": "l2-5",
      "data": { "label": "5. CASA account opening & insurance" },
      "className": "l2-process-node"
    },
    {
      "id": "data-5",
      "data": { "label": "Account Details\nInsurance Form" },
      "className": "data-node"
    },
    {
      "id": "risk-5a",
      "data": { "label": "Financial Crime" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-5a",
      "data": { "label": "Create Current Account (A)" },
      "className": "control-node"
    },
    {
      "id": "risk-5b",
      "data": { "label": "Reputation Risk" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-5b",
      "data": { "label": "Signed Ts & Cs (A)\nDigital App Form (A)\nAccount Linking (A)\nCooling off (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-5c",
      "data": { "label": "Compliance Risk" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-5c",
      "data": { "label": "Signed Ts & Cs (A)\nDigital App Form (A)\nCooling off (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-5d",
      "data": { "label": "Financial Risk" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-5d",
      "data": { "label": "New To Bank CASA capture (A)" },
      "className": "control-node"
    },
    {
      "id": "risk-5e",
      "data": { "label": "Operational Risk" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-5e",
      "data": { "label": "FATCA CRS declaration (A)" },
      "className": "control-node"
    },
    {
      "id": "risk-5f",
      "data": { "label": "Financial Crime\n(Screening)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-5f",
      "data": { "label": "FSK + Silent8 screening (A)\nBBL verification (A)" },
      "className": "control-node"
    },
    {
      "id": "risk-5g",
      "data": { "label": "Fraud (CRAM)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-5g",
      "data": { "label": "CRAM risk rating verification (A)" },
      "className": "control-node"
    },
    {
      "id": "out-5",
      "data": { "label": "Insurance form" },
      "className": "output-node"
    },

    /* ------------------------------------------------------------------
       ROW 6: Loan conditions validation
       ------------------------------------------------------------------ */
    {
      "id": "l2-6",
      "data": { "label": "6. Loan conditions validation" },
      "className": "l2-process-node"
    },
    {
      "id": "data-6",
      "data": { "label": "STL record\nSalary credit date\nSecurity cheque" },
      "className": "data-node"
    },
    {
      "id": "risk-6a",
      "data": { "label": "Financial Risk\n(IBAN)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-6a",
      "data": { "label": "IBAN validation (CASA Vs PIL) (A)" },
      "className": "control-node"
    },
    {
      "id": "risk-6b",
      "data": { "label": "Operational Risk\n(Docs)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-6b",
      "data": { "label": "Documents stored in DMS (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-6c",
      "data": { "label": "Financial Crime\n(Block)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-6c",
      "data": { "label": "Block placed on loan (A)\nQR code validation (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-6d",
      "data": { "label": "Fraud\n(Non eSTLs)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-6d",
      "data": { "label": "Non eSTLs filed (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-6e",
      "data": { "label": "Financial Risk\n(Signature)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-6e",
      "data": { "label": "Signature validation (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-6f",
      "data": { "label": "Compliance Risk\n(Cheques)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-6f",
      "data": { "label": "Cheques filed (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-6g",
      "data": { "label": "Financial Risk\n(Cheque Match)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-6g",
      "data": { "label": "Cheque # = Salary # (M)\nSalary source validation (M)" },
      "className": "control-node"
    },
    {
      "id": "out-6",
      "data": { "label": "None" },
      "className": "output-node"
    },

    /* ------------------------------------------------------------------
       ROW 7: Loan disbursal / funds release
       ------------------------------------------------------------------ */
    {
      "id": "l2-7",
      "data": { "label": "7. Loan disbursal / funds release" },
      "className": "l2-process-node"
    },
    {
      "id": "data-7",
      "data": { "label": "Disbursal Confirmation\nT24 Record" },
      "className": "data-node"
    },
    {
      "id": "risk-7a",
      "data": { "label": "Operational Risk\n(Variance)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-7a",
      "data": { "label": "Maker checker process (T24) (M)\nValidate variance (10%) (M)\nVerify Employer (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-7b",
      "data": { "label": "Operational Risk\n(Manual Unblock)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-7b",
      "data": { "label": "Manual unblock via email (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-7c",
      "data": { "label": "Financial Crime\n(Summary)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-7c",
      "data": { "label": "Customer summary verification (M)" },
      "className": "control-node"
    },
    {
      "id": "risk-7d",
      "data": { "label": "Operational Risk\n(File Mgmt)" },
      "className": "risk-node"
    },
    {
      "id": "ctrl-7d",
      "data": { "label": "Documents sent to File Mgmt (M)" },
      "className": "control-node"
    },
    {
      "id": "out-7",
      "data": { "label": "Loan record\nTransactional data\nPIL contract\nConsents" },
      "className": "output-node"
    }
  ],
  "edges": [] // Edges are generated by the layout engine based on structure
};
