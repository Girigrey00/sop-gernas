
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

export const DUMMY_PROCESS_ANALYSIS_DATA = {
  "nodes": [
    /* ------------------------------------------------------------------
       ROW 1: Customer details & product selection
       Base Y: 100
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
    // Risks
    {
      "id": "risk-1a",
      "data": { "label": "R4: Fraud - App WIP" },
      "position": { "x": COL_RISK, "y": 100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-1b",
      "data": { "label": "R11: Compliance - Auth" },
      "position": { "x": COL_RISK, "y": 200 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
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
      "data": { "label": "Restricted IP check (A)\nEID/UAEPASS + OTP (A)" },
      "position": { "x": COL_CTRL, "y": 200 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 2: Pre-eligibility + customer ID&V
       Base Y: 500
       ------------------------------------------------------------------ */
    {
      "id": "l2-2",
      "data": { "label": "2. Pre-eligibility + customer ID&V" },
      "position": { "x": COL_L2, "y": 550 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-2",
      "data": { "label": "EID copy (digital)" },
      "position": { "x": COL_DATA, "y": 550 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-2a",
      "data": { "label": "R4: Fraud - Identity" },
      "position": { "x": COL_RISK, "y": 500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-2b",
      "data": { "label": "R8: Reputation - Eligibility" },
      "position": { "x": COL_RISK, "y": 600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-2a",
      "data": { "label": "OCR EID scan (EFR) (A)" },
      "position": { "x": COL_CTRL, "y": 500 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2b",
      "data": { "label": "Income (+7K), Age, AECB (711+) (A)\nNegative Checklist (Mubadara) (A)\nFraud Watchlist check (OFS) (A)" },
      "position": { "x": COL_CTRL, "y": 600 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 3: Employer and salary validation
       Base Y: 900
       ------------------------------------------------------------------ */
    {
      "id": "l2-3",
      "data": { "label": "3. Employer and salary validation" },
      "position": { "x": COL_L2, "y": 950 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-3",
      "data": { "label": "Employer details\nSalary amount\nUID/TL\nEFR/AECB/UAEFTS Reports" },
      "position": { "x": COL_DATA, "y": 950 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-3a",
      "data": { "label": "R4: Fraud - Employer" },
      "position": { "x": COL_RISK, "y": 900 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3b",
      "data": { "label": "R5: Fraud - Banking" },
      "position": { "x": COL_RISK, "y": 1050 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3c",
      "data": { "label": "R11: Compliance - Rules" },
      "position": { "x": COL_RISK, "y": 1200 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-3a",
      "data": { "label": "Employer category check (A)\nEmployer Name/UID validation (A)\nTML Validation (A)" },
      "position": { "x": COL_CTRL, "y": 900 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3b",
      "data": { "label": "IBAN validation (A)\nAffordability (CPR) (A)\nSalary source verification (A)" },
      "position": { "x": COL_CTRL, "y": 1050 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3c",
      "data": { "label": "Calculated salary rule (A)\nCustomer communication (A)" },
      "position": { "x": COL_CTRL, "y": 1200 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 4: Credit underwriting
       Base Y: 1400
       ------------------------------------------------------------------ */
    {
      "id": "l2-4",
      "data": { "label": "4. Credit underwriting" },
      "position": { "x": COL_L2, "y": 1450 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-4",
      "data": { "label": "System Data / No Data Collected" },
      "position": { "x": COL_DATA, "y": 1450 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-4a",
      "data": { "label": "R7: Credit Risk" },
      "position": { "x": COL_RISK, "y": 1400 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-4b",
      "data": { "label": "R12: Operational Risk" },
      "position": { "x": COL_RISK, "y": 1500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-4a",
      "data": { "label": "Credit decision engine (A)" },
      "position": { "x": COL_CTRL, "y": 1400 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-4b",
      "data": { "label": "Life insurance mandatory (A)\nInsurance onboarding (M)\nLink insurance product (A)" },
      "position": { "x": COL_CTRL, "y": 1500 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 5: CASA account opening & insurance selection
       Base Y: 1700
       ------------------------------------------------------------------ */
    {
      "id": "l2-5",
      "data": { "label": "5. CASA account opening & insurance selection" },
      "position": { "x": COL_L2, "y": 2100 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-5",
      "data": { "label": "Account Details" },
      "position": { "x": COL_DATA, "y": 2100 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-5a",
      "data": { "label": "R9: Fin Crime - CASA" },
      "position": { "x": COL_RISK, "y": 1700 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5b",
      "data": { "label": "R8: Reputation" },
      "position": { "x": COL_RISK, "y": 1800 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5c",
      "data": { "label": "R11: Compliance" },
      "position": { "x": COL_RISK, "y": 1900 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5d",
      "data": { "label": "R10: Financial" },
      "position": { "x": COL_RISK, "y": 2000 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5e",
      "data": { "label": "R12: Operational - FATCA" },
      "position": { "x": COL_RISK, "y": 2100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5f",
      "data": { "label": "R1: Operational - Creation" },
      "position": { "x": COL_RISK, "y": 2200 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5g",
      "data": { "label": "R2: Fin Crime - Screening" },
      "position": { "x": COL_RISK, "y": 2300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5h",
      "data": { "label": "R3: Fin Crime - BBL" },
      "position": { "x": COL_RISK, "y": 2400 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5i",
      "data": { "label": "R4: Fraud - CRAM" },
      "position": { "x": COL_RISK, "y": 2500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-5a",
      "data": { "label": "CASA Onboarding journey (A)" },
      "position": { "x": COL_CTRL, "y": 1700 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5b",
      "data": { "label": "Signed Ts & Cs (A)\nDigital Form (A)\nCooling off waiver (M)" },
      "position": { "x": COL_CTRL, "y": 1850 }, // Shared
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5c",
      "data": { "label": "New To Bank CASA capture (A)" },
      "position": { "x": COL_CTRL, "y": 2000 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5d",
      "data": { "label": "FATCA CRS declaration (A)" },
      "position": { "x": COL_CTRL, "y": 2100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5e",
      "data": { "label": "CASA Creation journey (A)" },
      "position": { "x": COL_CTRL, "y": 2200 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5f",
      "data": { "label": "FSK + Silent8 screening (A)" },
      "position": { "x": COL_CTRL, "y": 2300 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5g",
      "data": { "label": "BBL verification (A)" },
      "position": { "x": COL_CTRL, "y": 2400 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5h",
      "data": { "label": "CRAM risk rating verification (A)" },
      "position": { "x": COL_CTRL, "y": 2500 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 6: Loan conditions validation
       Base Y: 2700
       ------------------------------------------------------------------ */
    {
      "id": "l2-6",
      "data": { "label": "6. Loan conditions validation" },
      "position": { "x": COL_L2, "y": 3300 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-6",
      "data": { "label": "STL\nSalary Date\nSec Cheque" },
      "position": { "x": COL_DATA, "y": 3300 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-6a",
      "data": { "label": "R10: Financial - IBAN" },
      "position": { "x": COL_RISK, "y": 2700 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6b",
      "data": { "label": "R12: Operational - IBAN" },
      "position": { "x": COL_RISK, "y": 2800 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6c",
      "data": { "label": "R9: Fin Crime - Block" },
      "position": { "x": COL_RISK, "y": 2900 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6d",
      "data": { "label": "R12: Operational - Docs" },
      "position": { "x": COL_RISK, "y": 3000 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6e",
      "data": { "label": "R5: Fraud - STL" },
      "position": { "x": COL_RISK, "y": 3100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6f",
      "data": { "label": "R9: Fin Crime - QR" },
      "position": { "x": COL_RISK, "y": 3200 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6g",
      "data": { "label": "R10: Financial - Sig" },
      "position": { "x": COL_RISK, "y": 3300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6h",
      "data": { "label": "R11: Compliance - Cheque" },
      "position": { "x": COL_RISK, "y": 3400 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6i",
      "data": { "label": "R10: Financial - Cheque Acct" },
      "position": { "x": COL_RISK, "y": 3500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6j",
      "data": { "label": "R11: Compliance - Cheque Acct" },
      "position": { "x": COL_RISK, "y": 3600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6k",
      "data": { "label": "R12: Operational - Cheque Acct" },
      "position": { "x": COL_RISK, "y": 3700 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6l",
      "data": { "label": "R5: Fraud - Variance" },
      "position": { "x": COL_RISK, "y": 3800 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6m",
      "data": { "label": "R12: Operational - Variance" },
      "position": { "x": COL_RISK, "y": 3900 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-6a",
      "data": { "label": "IBAN validation (CASA Vs PIL) (A)" },
      "position": { "x": COL_CTRL, "y": 2750 }, // Shared R10, R12
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6b",
      "data": { "label": "Block placed on disbursed loan (A)" },
      "position": { "x": COL_CTRL, "y": 2900 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6c",
      "data": { "label": "DMS Document Storage (M)" },
      "position": { "x": COL_CTRL, "y": 3000 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6d",
      "data": { "label": "Non eSTLs filing (M)" },
      "position": { "x": COL_CTRL, "y": 3100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6e",
      "data": { "label": "QR code validation (M)" },
      "position": { "x": COL_CTRL, "y": 3200 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6f",
      "data": { "label": "Signature validation (M)" },
      "position": { "x": COL_CTRL, "y": 3300 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6g",
      "data": { "label": "Cheques filed on customer file (M)" },
      "position": { "x": COL_CTRL, "y": 3400 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6h",
      "data": { "label": "Cheque account # = Salary account # (M)" },
      "position": { "x": COL_CTRL, "y": 3600 }, // Shared R10, R11, R12
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6i",
      "data": { "label": "Salary amount/source validation\nVariance check (M)" },
      "position": { "x": COL_CTRL, "y": 3850 }, // Shared R5, R12
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 7: Loan disbursal
       Base Y: 4100
       ------------------------------------------------------------------ */
    {
      "id": "l2-7",
      "data": { "label": "7. Loan disbursal / funds release" },
      "position": { "x": COL_L2, "y": 4300 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-7",
      "data": { "label": "Disbursal Confirmation" },
      "position": { "x": COL_DATA, "y": 4300 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-7a",
      "data": { "label": "R12: Operational - Maker" },
      "position": { "x": COL_RISK, "y": 4100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7b",
      "data": { "label": "R12: Operational - Variance" },
      "position": { "x": COL_RISK, "y": 4200 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7c",
      "data": { "label": "R12: Operational - Manual" },
      "position": { "x": COL_RISK, "y": 4300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7d",
      "data": { "label": "R9: Fin Crime - Summary" },
      "position": { "x": COL_RISK, "y": 4400 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7e",
      "data": { "label": "R12: Operational - Summary" },
      "position": { "x": COL_RISK, "y": 4500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-7a",
      "data": { "label": "Maker checker process (T24) (M)" },
      "position": { "x": COL_CTRL, "y": 4100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7b",
      "data": { "label": "Validate salary variance (M)" },
      "position": { "x": COL_CTRL, "y": 4200 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7c",
      "data": { "label": "Manual unblock via email (M)" },
      "position": { "x": COL_CTRL, "y": 4300 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7d",
      "data": { "label": "Customer summary attached\nSent to File Mgmt (M)" },
      "position": { "x": COL_CTRL, "y": 4450 }, // Shared R9, R12
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    }
  ],
  "edges": [
    // Row 1 Connections
    { "id": "e1-d", "source": "l2-1", "target": "data-1", "type": "step", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e1-r1", "source": "data-1", "target": "risk-1a", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e1-r2", "source": "data-1", "target": "risk-1b", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e1-c1", "source": "risk-1a", "target": "ctrl-1a", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e1-c2", "source": "risk-1b", "target": "ctrl-1b", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },

    // Row 2 Connections
    { "id": "e2-d", "source": "l2-2", "target": "data-2", "type": "step", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e2-r1", "source": "data-2", "target": "risk-2a", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e2-r2", "source": "data-2", "target": "risk-2b", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e2-c1", "source": "risk-2a", "target": "ctrl-2a", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e2-c2", "source": "risk-2b", "target": "ctrl-2b", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },

    // Row 3 Connections
    { "id": "e3-d", "source": "l2-3", "target": "data-3", "type": "step", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e3-r1", "source": "data-3", "target": "risk-3a", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e3-r2", "source": "data-3", "target": "risk-3b", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e3-r3", "source": "data-3", "target": "risk-3c", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e3-c1", "source": "risk-3a", "target": "ctrl-3a", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e3-c2", "source": "risk-3b", "target": "ctrl-3b", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e3-c3", "source": "risk-3c", "target": "ctrl-3c", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },

    // Row 4 Connections
    { "id": "e4-d", "source": "l2-4", "target": "data-4", "type": "step", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    { "id": "e4-r1", "source": "data-4", "target": "risk-4a", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e4-r2", "source": "data-4", "target": "risk-4b", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e4-c1", "source": "risk-4a", "target": "ctrl-4a", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e4-c2", "source": "risk-4b", "target": "ctrl-4b", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },

    // Row 5 Connections
    { "id": "e5-d", "source": "l2-5", "target": "data-5", "type": "step", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    // Data -> Risks
    { "id": "e5-r1", "source": "data-5", "target": "risk-5a", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r2", "source": "data-5", "target": "risk-5b", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r3", "source": "data-5", "target": "risk-5c", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r4", "source": "data-5", "target": "risk-5d", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r5", "source": "data-5", "target": "risk-5e", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r6", "source": "data-5", "target": "risk-5f", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r7", "source": "data-5", "target": "risk-5g", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r8", "source": "data-5", "target": "risk-5h", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e5-r9", "source": "data-5", "target": "risk-5i", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    // Risks -> Controls
    { "id": "e5-c1", "source": "risk-5a", "target": "ctrl-5a", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c2-a", "source": "risk-5b", "target": "ctrl-5b", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c2-b", "source": "risk-5c", "target": "ctrl-5b", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } }, // Multi-Link
    { "id": "e5-c3", "source": "risk-5d", "target": "ctrl-5c", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c4", "source": "risk-5e", "target": "ctrl-5d", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c5", "source": "risk-5f", "target": "ctrl-5e", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c6", "source": "risk-5g", "target": "ctrl-5f", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c7", "source": "risk-5h", "target": "ctrl-5g", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e5-c8", "source": "risk-5i", "target": "ctrl-5h", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },

    // Row 6 Connections
    { "id": "e6-d", "source": "l2-6", "target": "data-6", "type": "step", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    // Data -> Risks
    { "id": "e6-r1", "source": "data-6", "target": "risk-6a", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r2", "source": "data-6", "target": "risk-6b", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r3", "source": "data-6", "target": "risk-6c", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r4", "source": "data-6", "target": "risk-6d", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r5", "source": "data-6", "target": "risk-6e", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r6", "source": "data-6", "target": "risk-6f", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r7", "source": "data-6", "target": "risk-6g", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r8", "source": "data-6", "target": "risk-6h", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r9", "source": "data-6", "target": "risk-6i", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r10", "source": "data-6", "target": "risk-6j", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r11", "source": "data-6", "target": "risk-6k", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r12", "source": "data-6", "target": "risk-6l", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e6-r13", "source": "data-6", "target": "risk-6m", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    // Risks -> Controls
    { "id": "e6-c1-a", "source": "risk-6a", "target": "ctrl-6a", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c1-b", "source": "risk-6b", "target": "ctrl-6a", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } }, // Multi-Link
    { "id": "e6-c2", "source": "risk-6c", "target": "ctrl-6b", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c3", "source": "risk-6d", "target": "ctrl-6c", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c4", "source": "risk-6e", "target": "ctrl-6d", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c5", "source": "risk-6f", "target": "ctrl-6e", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c6", "source": "risk-6g", "target": "ctrl-6f", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c7", "source": "risk-6h", "target": "ctrl-6g", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c8-a", "source": "risk-6i", "target": "ctrl-6h", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c8-b", "source": "risk-6j", "target": "ctrl-6h", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } }, // Multi-Link
    { "id": "e6-c8-c", "source": "risk-6k", "target": "ctrl-6h", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } }, // Multi-Link
    { "id": "e6-c9-a", "source": "risk-6l", "target": "ctrl-6i", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e6-c9-b", "source": "risk-6m", "target": "ctrl-6i", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } }, // Multi-Link

    // Row 7 Connections
    { "id": "e7-d", "source": "l2-7", "target": "data-7", "type": "step", "style": { "stroke": "#cbd5e1", "strokeWidth": 2 } },
    // Data -> Risks
    { "id": "e7-r1", "source": "data-7", "target": "risk-7a", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e7-r2", "source": "data-7", "target": "risk-7b", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e7-r3", "source": "data-7", "target": "risk-7c", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e7-r4", "source": "data-7", "target": "risk-7d", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    { "id": "e7-r5", "source": "data-7", "target": "risk-7e", "type": "step", "style": { "stroke": "#f43f5e", "strokeWidth": 2 } },
    // Risks -> Controls
    { "id": "e7-c1", "source": "risk-7a", "target": "ctrl-7a", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e7-c2", "source": "risk-7b", "target": "ctrl-7b", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e7-c3", "source": "risk-7c", "target": "ctrl-7c", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e7-c4-a", "source": "risk-7d", "target": "ctrl-7d", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } },
    { "id": "e7-c4-b", "source": "risk-7e", "target": "ctrl-7d", "type": "step", "style": { "stroke": "#10b981", "strokeWidth": 2 } } // Multi-Link
  ]
};
