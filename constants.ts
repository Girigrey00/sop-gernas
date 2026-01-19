
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
      "position": { "x": COL_L2, "y": 100 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-1",
      "data": { "label": "Customer name\nEID\nEmail\nPhone" },
      "position": { "x": COL_DATA, "y": 100 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-1a",
      "data": { "label": "Fraud: Existing Cust/WIP" },
      "position": { "x": COL_RISK, "y": 50 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-1b",
      "data": { "label": "Compliance: Restricted Countries" },
      "position": { "x": COL_RISK, "y": 150 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-1a",
      "data": { "label": "Existing FAB customer check (A)" },
      "position": { "x": COL_CTRL, "y": 50 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-1b",
      "data": { "label": "IP blocking & UAEPASS/OTP (A)" },
      "position": { "x": COL_CTRL, "y": 150 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 2: Pre-eligibility + customer ID&V
       Base Y: 400
       ------------------------------------------------------------------ */
    {
      "id": "l2-2",
      "data": { "label": "2. Pre-eligibility + customer ID&V" },
      "position": { "x": COL_L2, "y": 400 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-2",
      "data": { "label": "EID copy (digital)" },
      "position": { "x": COL_DATA, "y": 400 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-2a",
      "data": { "label": "Fraud: OCR Scan" },
      "position": { "x": COL_RISK, "y": 350 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-2b",
      "data": { "label": "Reputation: Eligibility" },
      "position": { "x": COL_RISK, "y": 450 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-2a",
      "data": { "label": "OCR EID scan (EFR) (A)" },
      "position": { "x": COL_CTRL, "y": 350 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2b",
      "data": { "label": "Income/Age/AECB Checks (A)\nNegative Checklist (A)" },
      "position": { "x": COL_CTRL, "y": 450 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
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
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-3",
      "data": { "label": "Employer details\nSalary amount\nUID/TL\nReports (EFR, AECB, UAEFTS)" },
      "position": { "x": COL_DATA, "y": 750 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-3a",
      "data": { "label": "Fraud: Employer Category" },
      "position": { "x": COL_RISK, "y": 650 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3b",
      "data": { "label": "Fraud: IBAN/Salary" },
      "position": { "x": COL_RISK, "y": 750 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3c",
      "data": { "label": "Compliance: Calculated Salary" },
      "position": { "x": COL_RISK, "y": 850 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-3a",
      "data": { "label": "Employer Validation (TML/MOHRE) (A)" },
      "position": { "x": COL_CTRL, "y": 650 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3b",
      "data": { "label": "IBAN & Affordability Check (A)" },
      "position": { "x": COL_CTRL, "y": 750 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3c",
      "data": { "label": "Salary Variance Threshold (A)" },
      "position": { "x": COL_CTRL, "y": 850 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 4: Credit underwriting
       Base Y: 1100
       ------------------------------------------------------------------ */
    {
      "id": "l2-4",
      "data": { "label": "4. Credit underwriting" },
      "position": { "x": COL_L2, "y": 1100 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-4",
      "data": { "label": "Credit Score\nDBR\nOffer Letter" },
      "position": { "x": COL_DATA, "y": 1100 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-4a",
      "data": { "label": "Credit Risk" },
      "position": { "x": COL_RISK, "y": 1050 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-4b",
      "data": { "label": "Operational: Insurance" },
      "position": { "x": COL_RISK, "y": 1150 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-4a",
      "data": { "label": "Credit decision engine (A)" },
      "position": { "x": COL_CTRL, "y": 1050 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-4b",
      "data": { "label": "Mandatory Life Insurance (A)\nInsurance Onboarding (M)" },
      "position": { "x": COL_CTRL, "y": 1150 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 5: CASA account opening
       Base Y: 1450
       ------------------------------------------------------------------ */
    {
      "id": "l2-5",
      "data": { "label": "5. CASA account opening" },
      "position": { "x": COL_L2, "y": 1450 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-5",
      "data": { "label": "Insurance form\nAccount Details" },
      "position": { "x": COL_DATA, "y": 1450 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-5a",
      "data": { "label": "Fin Crime: Account Opening" },
      "position": { "x": COL_RISK, "y": 1350 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5b",
      "data": { "label": "Reputation/Comp: Ts&Cs" },
      "position": { "x": COL_RISK, "y": 1450 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5c",
      "data": { "label": "Ops: FATCA & Tax" },
      "position": { "x": COL_RISK, "y": 1550 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-5a",
      "data": { "label": "BAU CASA Onboarding (A)" },
      "position": { "x": COL_CTRL, "y": 1350 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5b",
      "data": { "label": "Signed Ts&Cs / Digital Form (A)" },
      "position": { "x": COL_CTRL, "y": 1450 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5c",
      "data": { "label": "FATCA CRS Declaration (A)\nFSK + Silent8 Screening (A)" },
      "position": { "x": COL_CTRL, "y": 1550 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 6: Loan conditions validation
       Base Y: 1850 -> Expanded Layout
       ------------------------------------------------------------------ */
    {
      "id": "l2-6",
      "data": { "label": "6. Loan conditions validation" },
      "position": { "x": COL_L2, "y": 1850 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-6",
      "data": { "label": "STL Record\nSalary Date\nSecurity Cheque" },
      "position": { "x": COL_DATA, "y": 1850 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-6a",
      "data": { "label": "Fin/Ops: IBAN & Block" },
      "position": { "x": COL_RISK, "y": 1750 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6b",
      "data": { "label": "Fraud: STL & QR" },
      "position": { "x": COL_RISK, "y": 1850 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6c",
      "data": { "label": "Fin/Comp: Cheques" },
      "position": { "x": COL_RISK, "y": 1950 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Added new risks from PDF Page 8 & 16
    {
      "id": "risk-6d",
      "data": { "label": "Fraud: Salary Source" },
      "position": { "x": COL_RISK, "y": 2050 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6e",
      "data": { "label": "Ops: Doc Storage" },
      "position": { "x": COL_RISK, "y": 2150 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    // Controls
    {
      "id": "ctrl-6a",
      "data": { "label": "IBAN Validation (A)\nDisbursal Block (A)" },
      "position": { "x": COL_CTRL, "y": 1750 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6b",
      "data": { "label": "Non eSTLs Filing (M)\nQR Code Validation (M)" },
      "position": { "x": COL_CTRL, "y": 1850 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6c",
      "data": { "label": "Signature Validation (M)\nCheque Acct = Salary Acct (M)" },
      "position": { "x": COL_CTRL, "y": 1950 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6d",
      "data": { "label": "Salary Source Valid. (T24) (M)\nVariance Check (M)" },
      "position": { "x": COL_CTRL, "y": 2050 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6e",
      "data": { "label": "DMS Storage (A)" },
      "position": { "x": COL_CTRL, "y": 2150 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 7: Loan disbursal / funds release
       Base Y: 2450 -> Shifted down
       ------------------------------------------------------------------ */
    {
      "id": "l2-7",
      "data": { "label": "7. Loan disbursal / funds release" },
      "position": { "x": COL_L2, "y": 2450 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-7",
      "data": { "label": "Loan Record\nTransactional Data\nContracts & Consents" },
      "position": { "x": COL_DATA, "y": 2450 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-7a",
      "data": { "label": "Ops: Maker Checker" },
      "position": { "x": COL_RISK, "y": 2350 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7b",
      "data": { "label": "Fin Crime: Documentation" },
      "position": { "x": COL_RISK, "y": 2450 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7c",
      "data": { "label": "Ops: Manual Process" },
      "position": { "x": COL_RISK, "y": 2550 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-7a",
      "data": { "label": "Maker Checker Process (M)\nSalary Variance Check (M)" },
      "position": { "x": COL_CTRL, "y": 2350 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7b",
      "data": { "label": "Customer Summary Attached (M)\nFile Mgmt Submission (2 days) (M)" },
      "position": { "x": COL_CTRL, "y": 2450 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7c",
      "data": { "label": "Manual Unblock via Email (M)" },
      "position": { "x": COL_CTRL, "y": 2550 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    }
  ],
  "edges": [
    // Row 1
    { "id": "e1-1", "source": "l2-1", "target": "data-1", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e1-2", "source": "data-1", "target": "risk-1a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e1-3", "source": "data-1", "target": "risk-1b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e1-4", "source": "risk-1a", "target": "ctrl-1a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e1-5", "source": "risk-1b", "target": "ctrl-1b", "type": "step", "style": { "stroke": "#10b981" } },
    // Row 2
    { "id": "e2-1", "source": "l2-2", "target": "data-2", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e2-2", "source": "data-2", "target": "risk-2a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e2-3", "source": "data-2", "target": "risk-2b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e2-4", "source": "risk-2a", "target": "ctrl-2a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e2-5", "source": "risk-2b", "target": "ctrl-2b", "type": "step", "style": { "stroke": "#10b981" } },
    // Row 3
    { "id": "e3-1", "source": "l2-3", "target": "data-3", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e3-2", "source": "data-3", "target": "risk-3a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e3-3", "source": "data-3", "target": "risk-3b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e3-4", "source": "data-3", "target": "risk-3c", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e3-5", "source": "risk-3a", "target": "ctrl-3a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e3-6", "source": "risk-3b", "target": "ctrl-3b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e3-7", "source": "risk-3c", "target": "ctrl-3c", "type": "step", "style": { "stroke": "#10b981" } },
    // Row 4
    { "id": "e4-1", "source": "l2-4", "target": "data-4", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e4-2", "source": "data-4", "target": "risk-4a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e4-3", "source": "data-4", "target": "risk-4b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e4-4", "source": "risk-4a", "target": "ctrl-4a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e4-5", "source": "risk-4b", "target": "ctrl-4b", "type": "step", "style": { "stroke": "#10b981" } },
    // Row 5
    { "id": "e5-1", "source": "l2-5", "target": "data-5", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e5-2", "source": "data-5", "target": "risk-5a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-3", "source": "data-5", "target": "risk-5b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-4", "source": "data-5", "target": "risk-5c", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-5", "source": "risk-5a", "target": "ctrl-5a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e5-6", "source": "risk-5b", "target": "ctrl-5b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e5-7", "source": "risk-5c", "target": "ctrl-5c", "type": "step", "style": { "stroke": "#10b981" } },
    // Row 6
    { "id": "e6-1", "source": "l2-6", "target": "data-6", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e6-2", "source": "data-6", "target": "risk-6a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-3", "source": "data-6", "target": "risk-6b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-4", "source": "data-6", "target": "risk-6c", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-5", "source": "data-6", "target": "risk-6d", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-6", "source": "data-6", "target": "risk-6e", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-7", "source": "risk-6a", "target": "ctrl-6a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-8", "source": "risk-6b", "target": "ctrl-6b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-9", "source": "risk-6c", "target": "ctrl-6c", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-10", "source": "risk-6d", "target": "ctrl-6d", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-11", "source": "risk-6e", "target": "ctrl-6e", "type": "step", "style": { "stroke": "#10b981" } },
    // Row 7
    { "id": "e7-1", "source": "l2-7", "target": "data-7", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e7-2", "source": "data-7", "target": "risk-7a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e7-3", "source": "data-7", "target": "risk-7b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e7-4", "source": "data-7", "target": "risk-7c", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e7-5", "source": "risk-7a", "target": "ctrl-7a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e7-6", "source": "risk-7b", "target": "ctrl-7b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e7-7", "source": "risk-7c", "target": "ctrl-7c", "type": "step", "style": { "stroke": "#10b981" } }
  ]
};
