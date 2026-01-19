
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

// Layout Config
const COL_L2 = 0;
const COL_DATA = 400;
const COL_RISK = 800;
const COL_CTRL = 1200;
const COL_OUTPUT = 1600;

export const DUMMY_PROCESS_ANALYSIS_DATA = {
  "nodes": [
    /* ------------------------------------------------------------------
       ROW 1: Customer details & product selection
       ------------------------------------------------------------------ */
    {
      "id": "l2-1",
      "data": { "label": "1. Customer details & product selection" },
      "position": { "x": COL_L2, "y": 150 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-1",
      "data": { "label": "Customer name\nEID\nEmail\nPhone" },
      "position": { "x": COL_DATA, "y": 150 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-1a",
      "data": { "label": "Fraud: Existing Customer/WIP" },
      "position": { "x": COL_RISK, "y": 100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-1b",
      "data": { "label": "Compliance: Restricted Countries" },
      "position": { "x": COL_RISK, "y": 250 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-1a",
      "data": { "label": "Existing FAB customer/WIP check (A)" },
      "position": { "x": COL_CTRL, "y": 100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-1b",
      "data": { "label": "Restricted countries check (IP blocking) (A)\nEID/UAEPASS + OTP (A)" },
      "position": { "x": COL_CTRL, "y": 250 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "out-1",
      "data": { "label": "New application record" },
      "position": { "x": COL_OUTPUT, "y": 150 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 2: Pre-eligibility + customer ID&V
       ------------------------------------------------------------------ */
    {
      "id": "l2-2",
      "data": { "label": "2. Pre-eligibility + customer ID&V" },
      "position": { "x": COL_L2, "y": 500 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-2",
      "data": { "label": "EID copy (digital)" },
      "position": { "x": COL_DATA, "y": 500 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-2a",
      "data": { "label": "Fraud (Identity)" },
      "position": { "x": COL_RISK, "y": 450 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-2b",
      "data": { "label": "Reputation Risk (Eligibility)" },
      "position": { "x": COL_RISK, "y": 600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2a",
      "data": { "label": "OCR EID scan (EFR) (A)" },
      "position": { "x": COL_CTRL, "y": 450 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2b",
      "data": { "label": "Income (+7K), Age, AECB (711+) (A)\nNegative Checklist (Mubadara) (A)\nFraud Watchlist (OFS) (A)" },
      "position": { "x": COL_CTRL, "y": 600 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "out-2",
      "data": { "label": "Affordability assessment results" },
      "position": { "x": COL_OUTPUT, "y": 500 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 3: Employer and salary validation
       ------------------------------------------------------------------ */
    {
      "id": "l2-3",
      "data": { "label": "3. Employer and salary validation" },
      "position": { "x": COL_L2, "y": 900 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-3",
      "data": { "label": "Employer details\nSalary amount\nUID / TL\nEFR/AECB/UAEFTS Reports" },
      "position": { "x": COL_DATA, "y": 900 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3a",
      "data": { "label": "Fraud: Employer Category" },
      "position": { "x": COL_RISK, "y": 800 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3b",
      "data": { "label": "Fraud: Salary Source" },
      "position": { "x": COL_RISK, "y": 950 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3c",
      "data": { "label": "Compliance: Salary Logic" },
      "position": { "x": COL_RISK, "y": 1100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3a",
      "data": { "label": "Employer category check (A)\nTML Validation (UID/TL) (A)\nNew Employer Verification (P)" },
      "position": { "x": COL_CTRL, "y": 800 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3b",
      "data": { "label": "IBAN validation (A)\nAffordability (CPR) (A)\nSalary variance threshold (A)" },
      "position": { "x": COL_CTRL, "y": 950 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3c",
      "data": { "label": "Salary Calculation (Last 3 months) (A)\nCustomer Communication (A)" },
      "position": { "x": COL_CTRL, "y": 1100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "out-3",
      "data": { "label": "Employer/Salary validation response (y/n)\nTML data points\nAECB report" },
      "position": { "x": COL_OUTPUT, "y": 900 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 4: Credit underwriting
       ------------------------------------------------------------------ */
    {
      "id": "l2-4",
      "data": { "label": "4. Credit underwriting" },
      "position": { "x": COL_L2, "y": 1350 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-4",
      "data": { "label": "Internal Credit Score\nDBR\nPIL Offer Letter" },
      "position": { "x": COL_DATA, "y": 1350 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-4a",
      "data": { "label": "Credit Risk" },
      "position": { "x": COL_RISK, "y": 1300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-4b",
      "data": { "label": "Operational Risk" },
      "position": { "x": COL_RISK, "y": 1450 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-4a",
      "data": { "label": "Credit decision engine (A)" },
      "position": { "x": COL_CTRL, "y": 1300 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-4b",
      "data": { "label": "Mandatory Life insurance selection (A)\nInsurance onboarding (M)\nLink insurance to CIN/CIF (A)" },
      "position": { "x": COL_CTRL, "y": 1450 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "out-4",
      "data": { "label": "Internal credit score\nDBR\nPIL offer letter" },
      "position": { "x": COL_OUTPUT, "y": 1350 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 5: CASA account opening & insurance selection
       ------------------------------------------------------------------ */
    {
      "id": "l2-5",
      "data": { "label": "5. CASA account opening & insurance selection" },
      "position": { "x": COL_L2, "y": 1900 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-5",
      "data": { "label": "Insurance Form\nAccount Details" },
      "position": { "x": COL_DATA, "y": 1900 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5a",
      "data": { "label": "Operational Risk (Insurance)" },
      "position": { "x": COL_RISK, "y": 1700 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5b",
      "data": { "label": "Financial Crime (CASA)" },
      "position": { "x": COL_RISK, "y": 1800 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5c",
      "data": { "label": "Reputation & Compliance (Ts&Cs)" },
      "position": { "x": COL_RISK, "y": 1900 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5d",
      "data": { "label": "Financial Risk (New to Bank)" },
      "position": { "x": COL_RISK, "y": 2000 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5e",
      "data": { "label": "Operational Risk (FATCA)" },
      "position": { "x": COL_RISK, "y": 2100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5f",
      "data": { "label": "Fin Crime (Screening)" },
      "position": { "x": COL_RISK, "y": 2200 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5g",
      "data": { "label": "Fraud (CRAM)" },
      "position": { "x": COL_RISK, "y": 2300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5a",
      "data": { "label": "Generate Insurance Form (A)\nInsurance Registration (M)" },
      "position": { "x": COL_CTRL, "y": 1700 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5b",
      "data": { "label": "Current account creation (BAU Journey) (A)" },
      "position": { "x": COL_CTRL, "y": 1800 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5c",
      "data": { "label": "Signed Ts & Cs (A)\nDigital App Form (A)\nCooling off waiver (M)" },
      "position": { "x": COL_CTRL, "y": 1900 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5d",
      "data": { "label": "New To Bank CASA capture (A)" },
      "position": { "x": COL_CTRL, "y": 2000 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5e",
      "data": { "label": "FATCA CRS declaration (A)" },
      "position": { "x": COL_CTRL, "y": 2100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5f",
      "data": { "label": "FSK + Silent8 screening (A)\nBBL Verification (A)" },
      "position": { "x": COL_CTRL, "y": 2200 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5g",
      "data": { "label": "CRAM risk rating verification (A)" },
      "position": { "x": COL_CTRL, "y": 2300 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "out-5",
      "data": { "label": "Insurance form" },
      "position": { "x": COL_OUTPUT, "y": 1900 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 6: Loan conditions validation
       ------------------------------------------------------------------ */
    {
      "id": "l2-6",
      "data": { "label": "6. Loan conditions validation" },
      "position": { "x": COL_L2, "y": 2700 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-6",
      "data": { "label": "STL record (image/hard copy)\nSalary Amount/Date\nSecurity Cheque" },
      "position": { "x": COL_DATA, "y": 2700 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6a",
      "data": { "label": "Financial Risk (IBAN)" },
      "position": { "x": COL_RISK, "y": 2500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6b",
      "data": { "label": "Operation Risk (IBAN/Docs)" },
      "position": { "x": COL_RISK, "y": 2600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6c",
      "data": { "label": "Fin Crime (Block/QR)" },
      "position": { "x": COL_RISK, "y": 2700 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6d",
      "data": { "label": "Fraud (Non eSTLs)" },
      "position": { "x": COL_RISK, "y": 2800 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6e",
      "data": { "label": "Financial Risk (Signature)" },
      "position": { "x": COL_RISK, "y": 2900 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6f",
      "data": { "label": "Compliance (Cheques)" },
      "position": { "x": COL_RISK, "y": 3000 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6g",
      "data": { "label": "Financial Risk (Account)" },
      "position": { "x": COL_RISK, "y": 3100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6a",
      "data": { "label": "IBAN validation (CASA Vs PIL) (A)" },
      "position": { "x": COL_CTRL, "y": 2500 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6b",
      "data": { "label": "Documents stored in DMS (M)" },
      "position": { "x": COL_CTRL, "y": 2600 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6c",
      "data": { "label": "Block placed on disbursed loan (A)\nQR code validation (M)" },
      "position": { "x": COL_CTRL, "y": 2700 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6d",
      "data": { "label": "Non eSTLs filed on customer file (M)" },
      "position": { "x": COL_CTRL, "y": 2800 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6e",
      "data": { "label": "Signature validation (M)" },
      "position": { "x": COL_CTRL, "y": 2900 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6f",
      "data": { "label": "Cheques filed on customer file (M)" },
      "position": { "x": COL_CTRL, "y": 3000 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6g",
      "data": { "label": "Cheque account # = Salary account # (M)\nSalary amount/source validation (M)" },
      "position": { "x": COL_CTRL, "y": 3100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "out-6",
      "data": { "label": "None" },
      "position": { "x": COL_OUTPUT, "y": 2700 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 7: Loan disbursal / funds release
       ------------------------------------------------------------------ */
    {
      "id": "l2-7",
      "data": { "label": "7. Loan disbursal / funds release" },
      "position": { "x": COL_L2, "y": 3400 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-7",
      "data": { "label": "Disbursal Confirmation\nT24 Record" },
      "position": { "x": COL_DATA, "y": 3400 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7a",
      "data": { "label": "Operational Risk (Maker Checker/Variance)" },
      "position": { "x": COL_RISK, "y": 3300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7b",
      "data": { "label": "Operational Risk (Manual Process)" },
      "position": { "x": COL_RISK, "y": 3400 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7c",
      "data": { "label": "Financial Crime (Summary)" },
      "position": { "x": COL_RISK, "y": 3500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7d",
      "data": { "label": "Operational Risk (File Mgmt)" },
      "position": { "x": COL_RISK, "y": 3600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7a",
      "data": { "label": "Maker checker process (T24) (M)\nValidate salary variance (10%) (M)" },
      "position": { "x": COL_CTRL, "y": 3300 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7b",
      "data": { "label": "Manual unblock via email (M)" },
      "position": { "x": COL_CTRL, "y": 3400 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7c",
      "data": { "label": "Customer summary verification (M)" },
      "position": { "x": COL_CTRL, "y": 3500 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7d",
      "data": { "label": "Documents sent to File Mgmt (M)" },
      "position": { "x": COL_CTRL, "y": 3600 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "out-7",
      "data": { "label": "Personal loan record\nTransactional data\nPIL contract\nSigned T&Cs" },
      "position": { "x": COL_OUTPUT, "y": 3400 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    }
  ],
  "edges": [
    // Row 1 Connections
    { "id": "e1-d", "source": "l2-1", "target": "data-1", "type": "smoothstep", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e1-r1", "source": "data-1", "target": "risk-1a", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e1-r2", "source": "data-1", "target": "risk-1b", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e1-c1", "source": "risk-1a", "target": "ctrl-1a", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e1-c2", "source": "risk-1b", "target": "ctrl-1b", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e1-o1", "source": "ctrl-1a", "target": "out-1", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e1-o2", "source": "ctrl-1b", "target": "out-1", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },

    // Link R1 -> R2
    { "id": "p-1-2", "source": "l2-1", "target": "l2-2", "type": "smoothstep", "markerEnd": { "type": "arrowclosed", "color": "#3b82f6" }, "style": { "stroke": "#3b82f6", "strokeWidth": 2 } },

    // Row 2 Connections
    { "id": "e2-d", "source": "l2-2", "target": "data-2", "type": "smoothstep", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e2-r1", "source": "data-2", "target": "risk-2a", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e2-r2", "source": "data-2", "target": "risk-2b", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e2-c1", "source": "risk-2a", "target": "ctrl-2a", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    // DEMO: Multi-link Risk 2a to Ctrl 2b as well (One risk handled by multiple controls, or one control handling multiple risks)
    // Here: Risk 2a (Fraud) is handled by OCR (Ctrl 2a) AND Watchlist (Ctrl 2b)
    { "id": "e2-c1-multi", "source": "risk-2a", "target": "ctrl-2b", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2, "strokeDasharray": "5,5" } }, 
    
    { "id": "e2-c2", "source": "risk-2b", "target": "ctrl-2b", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e2-o1", "source": "ctrl-2a", "target": "out-2", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e2-o2", "source": "ctrl-2b", "target": "out-2", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },

    // Link R2 -> R3
    { "id": "p-2-3", "source": "l2-2", "target": "l2-3", "type": "smoothstep", "markerEnd": { "type": "arrowclosed", "color": "#3b82f6" }, "style": { "stroke": "#3b82f6", "strokeWidth": 2 } },

    // Row 3 Connections
    { "id": "e3-d", "source": "l2-3", "target": "data-3", "type": "smoothstep", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e3-r1", "source": "data-3", "target": "risk-3a", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e3-r2", "source": "data-3", "target": "risk-3b", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e3-r3", "source": "data-3", "target": "risk-3c", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e3-c1", "source": "risk-3a", "target": "ctrl-3a", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e3-c2", "source": "risk-3b", "target": "ctrl-3b", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e3-c3", "source": "risk-3c", "target": "ctrl-3c", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e3-o1", "source": "ctrl-3a", "target": "out-3", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e3-o2", "source": "ctrl-3b", "target": "out-3", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e3-o3", "source": "ctrl-3c", "target": "out-3", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },

    // Link R3 -> R4
    { "id": "p-3-4", "source": "l2-3", "target": "l2-4", "type": "smoothstep", "markerEnd": { "type": "arrowclosed", "color": "#3b82f6" }, "style": { "stroke": "#3b82f6", "strokeWidth": 2 } },

    // Row 4 Connections
    { "id": "e4-d", "source": "l2-4", "target": "data-4", "type": "smoothstep", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e4-r1", "source": "data-4", "target": "risk-4a", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e4-r2", "source": "data-4", "target": "risk-4b", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e4-c1", "source": "risk-4a", "target": "ctrl-4a", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e4-c2", "source": "risk-4b", "target": "ctrl-4b", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e4-o1", "source": "ctrl-4a", "target": "out-4", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e4-o2", "source": "ctrl-4b", "target": "out-4", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },

    // Link R4 -> R5
    { "id": "p-4-5", "source": "l2-4", "target": "l2-5", "type": "smoothstep", "markerEnd": { "type": "arrowclosed", "color": "#3b82f6" }, "style": { "stroke": "#3b82f6", "strokeWidth": 2 } },

    // Row 5 Connections
    { "id": "e5-d", "source": "l2-5", "target": "data-5", "type": "smoothstep", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e5-r1", "source": "data-5", "target": "risk-5a", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r2", "source": "data-5", "target": "risk-5b", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r3", "source": "data-5", "target": "risk-5c", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r4", "source": "data-5", "target": "risk-5d", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r5", "source": "data-5", "target": "risk-5e", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r6", "source": "data-5", "target": "risk-5f", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r7", "source": "data-5", "target": "risk-5g", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-c1", "source": "risk-5a", "target": "ctrl-5a", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c2", "source": "risk-5b", "target": "ctrl-5b", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c3", "source": "risk-5c", "target": "ctrl-5c", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c4", "source": "risk-5d", "target": "ctrl-5d", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c5", "source": "risk-5e", "target": "ctrl-5e", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c6", "source": "risk-5f", "target": "ctrl-5f", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c7", "source": "risk-5g", "target": "ctrl-5g", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-o1", "source": "ctrl-5a", "target": "out-5", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e5-o2", "source": "ctrl-5b", "target": "out-5", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e5-o3", "source": "ctrl-5c", "target": "out-5", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e5-o4", "source": "ctrl-5d", "target": "out-5", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e5-o5", "source": "ctrl-5e", "target": "out-5", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e5-o6", "source": "ctrl-5f", "target": "out-5", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e5-o7", "source": "ctrl-5g", "target": "out-5", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },

    // Link R5 -> R6
    { "id": "p-5-6", "source": "l2-5", "target": "l2-6", "type": "smoothstep", "markerEnd": { "type": "arrowclosed", "color": "#3b82f6" }, "style": { "stroke": "#3b82f6", "strokeWidth": 2 } },

    // Row 6 Connections
    { "id": "e6-d", "source": "l2-6", "target": "data-6", "type": "smoothstep", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e6-r1", "source": "data-6", "target": "risk-6a", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r2", "source": "data-6", "target": "risk-6b", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r3", "source": "data-6", "target": "risk-6c", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r4", "source": "data-6", "target": "risk-6d", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r5", "source": "data-6", "target": "risk-6e", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r6", "source": "data-6", "target": "risk-6f", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r7", "source": "data-6", "target": "risk-6g", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-c1", "source": "risk-6a", "target": "ctrl-6a", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c2", "source": "risk-6b", "target": "ctrl-6b", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c3", "source": "risk-6c", "target": "ctrl-6c", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c4", "source": "risk-6d", "target": "ctrl-6d", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c5", "source": "risk-6e", "target": "ctrl-6e", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c6", "source": "risk-6f", "target": "ctrl-6f", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c7", "source": "risk-6g", "target": "ctrl-6g", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-o1", "source": "ctrl-6a", "target": "out-6", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e6-o2", "source": "ctrl-6b", "target": "out-6", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e6-o3", "source": "ctrl-6c", "target": "out-6", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e6-o4", "source": "ctrl-6d", "target": "out-6", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e6-o5", "source": "ctrl-6e", "target": "out-6", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e6-o6", "source": "ctrl-6f", "target": "out-6", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e6-o7", "source": "ctrl-6g", "target": "out-6", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },

    // Link R6 -> R7
    { "id": "p-6-7", "source": "l2-6", "target": "l2-7", "type": "smoothstep", "markerEnd": { "type": "arrowclosed", "color": "#3b82f6" }, "style": { "stroke": "#3b82f6", "strokeWidth": 2 } },

    // Row 7 Connections
    { "id": "e7-d", "source": "l2-7", "target": "data-7", "type": "smoothstep", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e7-r1", "source": "data-7", "target": "risk-7a", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e7-r2", "source": "data-7", "target": "risk-7b", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e7-r3", "source": "data-7", "target": "risk-7c", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e7-r4", "source": "data-7", "target": "risk-7d", "type": "smoothstep", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e7-c1", "source": "risk-7a", "target": "ctrl-7a", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    
    // DEMO: Multi-link Risk 7b (Ops) to Ctrl 7a (Maker Checker) - 1 control checks multiple risks
    { "id": "e7-c1-multi", "source": "risk-7b", "target": "ctrl-7a", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2, "strokeDasharray": "5,5" } },

    { "id": "e7-c2", "source": "risk-7b", "target": "ctrl-7b", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e7-c3", "source": "risk-7c", "target": "ctrl-7c", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e7-c4", "source": "risk-7d", "target": "ctrl-7d", "type": "smoothstep", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e7-o1", "source": "ctrl-7a", "target": "out-7", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e7-o2", "source": "ctrl-7b", "target": "out-7", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e7-o3", "source": "ctrl-7c", "target": "out-7", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } },
    { "id": "e7-o4", "source": "ctrl-7d", "target": "out-7", "type": "smoothstep", "style": { "stroke": "#8b5cf6", "strokeWidth": 2 } }
  ]
};
