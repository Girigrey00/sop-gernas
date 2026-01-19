
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

// Layout Config for 5 Columns
const COL_L2 = 0;
const COL_DATA = 400;
const COL_RISK = 800;
const COL_CTRL = 1200;
const COL_OUT = 1600; // 5th Column

export const DUMMY_PROCESS_ANALYSIS_DATA = {
  "nodes": [
    /* ------------------------------------------------------------------
       ROW 1: Customer details & product selection
       Base Y: 150
       ------------------------------------------------------------------ */
    {
      "id": "l2-1",
      "data": { "label": "1. Customer details & product selection" },
      "position": { "x": COL_L2, "y": 150 },
      "className": "l2-process-node",
    },
    {
      "id": "data-1",
      "data": { "label": "Customer name\nEID\nCustomer email\nCustomer phone" },
      "position": { "x": COL_DATA, "y": 150 },
      "className": "data-node",
    },
    {
      "id": "risk-1",
      "data": { "label": "Fraud: App WIP dropped\nCompliance: Restricted Countries" },
      "position": { "x": COL_RISK, "y": 150 },
      "className": "risk-node",
    },
    {
      "id": "ctrl-1",
      "data": { "label": "Existing FAB customer check (A)\nRestricted countries check (A)\nEID or UAEPASS + OTP (A)" },
      "position": { "x": COL_CTRL, "y": 150 },
      "className": "control-node",
    },
    {
      "id": "out-1",
      "data": { "label": "New application record" },
      "position": { "x": COL_OUT, "y": 150 },
      "className": "data-produced-node",
    },

    /* ------------------------------------------------------------------
       ROW 2: Pre-eligibility + customer ID&V
       Base Y: 450
       ------------------------------------------------------------------ */
    {
      "id": "l2-2",
      "data": { "label": "2. Pre-eligibility + customer ID&V" },
      "position": { "x": COL_L2, "y": 450 },
      "className": "l2-process-node",
    },
    {
      "id": "data-2",
      "data": { "label": "EID copy (digital)" },
      "position": { "x": COL_DATA, "y": 450 },
      "className": "data-node",
    },
    {
      "id": "risk-2",
      "data": { "label": "Fraud: OCR EID scan\nReputation Risk" },
      "position": { "x": COL_RISK, "y": 450 },
      "className": "risk-node",
    },
    {
      "id": "ctrl-2",
      "data": { "label": "OCR EID scan (EFR) (A)\nIncome threshold (+7K) (A)\nMinimum age (A)\nAECB Score (711+) (A)\nFraud Watchlist (OFS) (A)" },
      "position": { "x": COL_CTRL, "y": 450 },
      "className": "control-node",
    },
    {
      "id": "out-2",
      "data": { "label": "Affordability assessment results" },
      "position": { "x": COL_OUT, "y": 450 },
      "className": "data-produced-node",
    },

    /* ------------------------------------------------------------------
       ROW 3: Employer and salary validation
       Base Y: 750
       ------------------------------------------------------------------ */
    {
      "id": "l2-3",
      "data": { "label": "3. Employer and salary validation" },
      "position": { "x": COL_L2, "y": 750 },
      "className": "l2-process-node",
    },
    {
      "id": "data-3",
      "data": { "label": "Employer details\nSalary amount\nUID / TL\nEFR/AECB/UAEFTS Reports" },
      "position": { "x": COL_DATA, "y": 750 },
      "className": "data-node",
    },
    {
      "id": "risk-3",
      "data": { "label": "Fraud: Employer/Banking\nCompliance: Salary Rules" },
      "position": { "x": COL_RISK, "y": 750 },
      "className": "risk-node",
    },
    {
      "id": "ctrl-3",
      "data": { "label": "Employer category/UID check (A)\nTML Validation (A)\nIBAN validation (A)\nAffordability (CPR) (A)\nVariance threshold (A)\nCustomer communication (A)" },
      "position": { "x": COL_CTRL, "y": 750 },
      "className": "control-node",
    },
    {
      "id": "out-3",
      "data": { "label": "Employer/Salary validation response\nTML enrichment data\nAECB report" },
      "position": { "x": COL_OUT, "y": 750 },
      "className": "data-produced-node",
    },

    /* ------------------------------------------------------------------
       ROW 4: Credit underwriting
       Base Y: 1050
       ------------------------------------------------------------------ */
    {
      "id": "l2-4",
      "data": { "label": "4. Credit underwriting" },
      "position": { "x": COL_L2, "y": 1050 },
      "className": "l2-process-node",
    },
    {
      "id": "data-4",
      "data": { "label": "None (System Data)" },
      "position": { "x": COL_DATA, "y": 1050 },
      "className": "data-node",
    },
    {
      "id": "risk-4",
      "data": { "label": "Credit Risk\nOperational Risk" },
      "position": { "x": COL_RISK, "y": 1050 },
      "className": "risk-node",
    },
    {
      "id": "ctrl-4",
      "data": { "label": "Credit decision engine (A)\nLife insurance selection (A)\nLink insurance product (A)\nInsurance onboarding (M)" },
      "position": { "x": COL_CTRL, "y": 1050 },
      "className": "control-node",
    },
    {
      "id": "out-4",
      "data": { "label": "Customer internal credit score\nDBR\nPIL offer letter" },
      "position": { "x": COL_OUT, "y": 1050 },
      "className": "data-produced-node",
    },

    /* ------------------------------------------------------------------
       ROW 5: CASA account opening & insurance selection
       Base Y: 1350
       ------------------------------------------------------------------ */
    {
      "id": "l2-5",
      "data": { "label": "5. CASA account opening & insurance selection" },
      "position": { "x": COL_L2, "y": 1350 },
      "className": "l2-process-node",
    },
    {
      "id": "data-5",
      "data": { "label": "None (System/Link)" },
      "position": { "x": COL_DATA, "y": 1350 },
      "className": "data-node",
    },
    {
      "id": "risk-5",
      "data": { "label": "Op Risk / Fin Crime\nReputation / Compliance\nFinancial Risk" },
      "position": { "x": COL_RISK, "y": 1350 },
      "className": "risk-node",
    },
    {
      "id": "ctrl-5",
      "data": { "label": "Create Current account (A)\nSigned Ts & Cs (A)\nFATCA/CRS/FSK/Silent8 (A)\nBBL/CRAM verification (A)" },
      "position": { "x": COL_CTRL, "y": 1350 },
      "className": "control-node",
    },
    {
      "id": "out-5",
      "data": { "label": "Insurance form" },
      "position": { "x": COL_OUT, "y": 1350 },
      "className": "data-produced-node",
    },

    /* ------------------------------------------------------------------
       ROW 6: Loan conditions validation
       Base Y: 1650
       ------------------------------------------------------------------ */
    {
      "id": "l2-6",
      "data": { "label": "6. Loan conditions validation" },
      "position": { "x": COL_L2, "y": 1650 },
      "className": "l2-process-node",
    },
    {
      "id": "data-6",
      "data": { "label": "STL record\nActual salary\nSalary credit date\nSecurity cheque record" },
      "position": { "x": COL_DATA, "y": 1650 },
      "className": "data-node",
    },
    {
      "id": "risk-6",
      "data": { "label": "Financial: IBAN/Sig\nOp: Docs\nFraud: eSTL\nFin Crime: Block/QR" },
      "position": { "x": COL_RISK, "y": 1650 },
      "className": "risk-node",
    },
    {
      "id": "ctrl-6",
      "data": { "label": "IBAN validation (A)\nDMS Storage (M)\nQR code/Sig validation (M)\nBlock on disbursed loan (A)" },
      "position": { "x": COL_CTRL, "y": 1650 },
      "className": "control-node",
    },
    {
      "id": "out-6",
      "data": { "label": "None (Validation Status)" },
      "position": { "x": COL_OUT, "y": 1650 },
      "className": "data-produced-node",
    },

    /* ------------------------------------------------------------------
       ROW 7: Loan disbursal / funds release
       Base Y: 1950
       ------------------------------------------------------------------ */
    {
      "id": "l2-7",
      "data": { "label": "7. Loan disbursal / funds release" },
      "position": { "x": COL_L2, "y": 1950 },
      "className": "l2-process-node",
    },
    {
      "id": "data-7",
      "data": { "label": "None (System Trigger)" },
      "position": { "x": COL_DATA, "y": 1950 },
      "className": "data-node",
    },
    {
      "id": "risk-7",
      "data": { "label": "Operational Risk\nFinancial Crime" },
      "position": { "x": COL_RISK, "y": 1950 },
      "className": "risk-node",
    },
    {
      "id": "ctrl-7",
      "data": { "label": "Maker checker process (M)\nValidate salary variance (M)\nManual unblock (M)\nFile Management (M)" },
      "position": { "x": COL_CTRL, "y": 1950 },
      "className": "control-node",
    },
    {
      "id": "out-7",
      "data": { "label": "Personal loan record\nTransactional data\nPIL contract\nCustomer consents" },
      "position": { "x": COL_OUT, "y": 1950 },
      "className": "data-produced-node",
    }
  ]
};
