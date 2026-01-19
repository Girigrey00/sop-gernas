
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
       STEP 1: Customer details & product selection
       Y Range: 50 - 250
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
    // Row 1
    {
      "id": "risk-1a",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 50 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-1a",
      "data": { "label": "Existing FAB customer/App WIP dropped (A)" },
      "position": { "x": COL_CTRL, "y": 50 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 2
    {
      "id": "risk-1b",
      "data": { "label": "Compliance" },
      "position": { "x": COL_RISK, "y": 150 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-1b",
      "data": { "label": "Restricted countries check (IP blocking) (A)\nEID or UAEPASS + OTP (A)" },
      "position": { "x": COL_CTRL, "y": 150 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-1",
      "data": { "label": "New application record" },
      "position": { "x": COL_OUTPUT, "y": 100 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 2: Pre-eligibility + customer ID&V
       Y Range: 350 - 550
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
    // Row 1
    {
      "id": "risk-2a",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 350 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2a",
      "data": { "label": "OCR EID scan (EFR) (A)" },
      "position": { "x": COL_CTRL, "y": 350 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 2
    {
      "id": "risk-2b",
      "data": { "label": "Reputation" },
      "position": { "x": COL_RISK, "y": 450 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2b",
      "data": { "label": "Income threshold (+7K) (A)\nMin age; AECB (711+); WIP check\nNegative Checklist; Fraud Watchlist (A)" },
      "position": { "x": COL_CTRL, "y": 450 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-2",
      "data": { "label": "Affordability assessment results" },
      "position": { "x": COL_OUTPUT, "y": 400 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 3: Employer and salary validation
       Y Range: 650 - 950
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
      "data": { "label": "Employer details, Salary\nUID/TL\nEFR/AECB/UAEFTS Reports" },
      "position": { "x": COL_DATA, "y": 750 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 1
    {
      "id": "risk-3a",
      "data": { "label": "Fraud (Employer)" },
      "position": { "x": COL_RISK, "y": 650 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3a",
      "data": { "label": "Employer category check (EFR/MOHRE)\nUID/TL matching; TML validation (A)\nNER verification (P)" },
      "position": { "x": COL_CTRL, "y": 650 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 2
    {
      "id": "risk-3b",
      "data": { "label": "Fraud (Salary)" },
      "position": { "x": COL_RISK, "y": 750 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3b",
      "data": { "label": "IBAN val (CB/AECB); Affordability (CPR)\nSalary details + bank statements\nSalary source & Variance threshold (A)" },
      "position": { "x": COL_CTRL, "y": 750 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 3
    {
      "id": "risk-3c",
      "data": { "label": "Compliance" },
      "position": { "x": COL_RISK, "y": 850 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3c",
      "data": { "label": "Most occurring salary logic (3mo)\nException communication (A)" },
      "position": { "x": COL_CTRL, "y": 850 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-3",
      "data": { "label": "Employer/Salary val response (y/n)\nTML enrichment data\nAECB report" },
      "position": { "x": COL_OUTPUT, "y": 750 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 4: Credit underwriting
       Y Range: 1000 - 1200
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
      "data": { "label": "Application Data\n(None specified)" },
      "position": { "x": COL_DATA, "y": 1100 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 1
    {
      "id": "risk-4a",
      "data": { "label": "Credit" },
      "position": { "x": COL_RISK, "y": 1050 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-4a",
      "data": { "label": "Credit decision engine (A)" },
      "position": { "x": COL_CTRL, "y": 1050 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 2
    {
      "id": "risk-4b",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 1150 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-4b",
      "data": { "label": "Life insurance selection mandatory\nGenerate form (A); Onboarding (M)\nLink insurance to CIN/CIF (A)" },
      "position": { "x": COL_CTRL, "y": 1150 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-4",
      "data": { "label": "Customer internal credit score\nDBR\nPIL offer letter" },
      "position": { "x": COL_OUTPUT, "y": 1100 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 5: CASA account opening & insurance selection
       Y Range: 1300 - 1650
       ------------------------------------------------------------------ */
    {
      "id": "l2-5",
      "data": { "label": "5. CASA account opening & insurance" },
      "position": { "x": COL_L2, "y": 1450 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-5",
      "data": { "label": "CASA/Insurance Data\n(None specified)" },
      "position": { "x": COL_DATA, "y": 1450 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 1 - Operational / Financial Crime split
    {
      "id": "risk-5a1",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 1300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5a2",
      "data": { "label": "Financial Crime" },
      "position": { "x": COL_RISK, "y": 1360 }, // Stacked
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5a",
      "data": { "label": "Mandatory life insurance & form gen (A)\nRegistration/filing (M)\nCurrent account via BAU CASA (A)" },
      "position": { "x": COL_CTRL, "y": 1330 }, // Centered
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 2 - Reputation / Compliance split
    {
      "id": "risk-5b1",
      "data": { "label": "Reputation" },
      "position": { "x": COL_RISK, "y": 1420 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5b2",
      "data": { "label": "Compliance" },
      "position": { "x": COL_RISK, "y": 1480 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5b",
      "data": { "label": "Signed Ts&Cs; Digital app form\nAccount & PIL linking (A)\nCooling off waiver/opt-in (M)" },
      "position": { "x": COL_CTRL, "y": 1450 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 3 - Financial / Fraud split
    {
      "id": "risk-5c1",
      "data": { "label": "Financial" },
      "position": { "x": COL_RISK, "y": 1540 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5c2",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 1600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5c",
      "data": { "label": "NTB CASA capture (A)\nFATCA CRS; FSK + Silent8\nBBL verification; CRAM rating (A)" },
      "position": { "x": COL_CTRL, "y": 1570 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-5",
      "data": { "label": "Insurance form" },
      "position": { "x": COL_OUTPUT, "y": 1450 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 6: Loan conditions validation
       Y Range: 1700 - 2000
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
      "data": { "label": "STL record; Actual salary\nSalary credit date; Source\nSecurity cheque record" },
      "position": { "x": COL_DATA, "y": 1850 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 1 - Fin / Ops / Fin Crime
    {
      "id": "risk-6a1",
      "data": { "label": "Financial" },
      "position": { "x": COL_RISK, "y": 1700 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6a2",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 1740 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6a3",
      "data": { "label": "Fin Crime" },
      "position": { "x": COL_RISK, "y": 1780 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6a",
      "data": { "label": "IBAN validation (CASA Vs PIL) (A)\nDisbursal Block in T24 (A)\nDMS Storage (A)" },
      "position": { "x": COL_CTRL, "y": 1740 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 2 - Fraud / Compliance / Financial
    {
      "id": "risk-6b1",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 1840 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6b2",
      "data": { "label": "Compliance" },
      "position": { "x": COL_RISK, "y": 1880 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6b3",
      "data": { "label": "Financial" },
      "position": { "x": COL_RISK, "y": 1920 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6b",
      "data": { "label": "Filing non-eSTLs/cheques (M)\nQR code validation (eSTLs) (M)\nSignature val; Acct match (M)" },
      "position": { "x": COL_CTRL, "y": 1880 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 3 - Fraud / Ops
    {
      "id": "risk-6c1",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 1980 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6c2",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 2020 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6c",
      "data": { "label": "Salary amt/source val (T24)\nVariance val (<10%) T24 vs Calc\nEmployer source val (M)" },
      "position": { "x": COL_CTRL, "y": 2000 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-6",
      "data": { "label": "None" },
      "position": { "x": COL_OUTPUT, "y": 1850 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 7: Loan disbursal / funds release
       Y Range: 2150 - 2300
       ------------------------------------------------------------------ */
    {
      "id": "l2-7",
      "data": { "label": "7. Loan disbursal / funds release" },
      "position": { "x": COL_L2, "y": 2200 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-7",
      "data": { "label": "None" },
      "position": { "x": COL_DATA, "y": 2200 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 1
    {
      "id": "risk-7a",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 2150 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7a",
      "data": { "label": "Maker checker process (T24) (M)\nVariance val (<10%) (M)\nUnblocking via emails (M)" },
      "position": { "x": COL_CTRL, "y": 2150 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Row 2
    {
      "id": "risk-7b1",
      "data": { "label": "Fin Crime" },
      "position": { "x": COL_RISK, "y": 2230 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7b2",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 2270 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7b",
      "data": { "label": "Workflow summary attachment\nDoc delivery to FM (2 days) (M)" },
      "position": { "x": COL_CTRL, "y": 2250 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-7",
      "data": { "label": "PIL record\nTransactional data\nPIL contract\nConsents" },
      "position": { "x": COL_OUTPUT, "y": 2200 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    }
  ],
  "edges": [
    // Step 1
    { "id": "e1-L", "source": "l2-1", "target": "data-1", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e1-DRa", "source": "data-1", "target": "risk-1a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e1-DRb", "source": "data-1", "target": "risk-1b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e1-RCa", "source": "risk-1a", "target": "ctrl-1a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e1-RCb", "source": "risk-1b", "target": "ctrl-1b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e1-CO", "source": "ctrl-1b", "target": "output-1", "type": "step", "style": { "stroke": "#8b5cf6" } }, // Link only last ctrl for simplicity

    // Step 2
    { "id": "e2-L", "source": "l2-2", "target": "data-2", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e2-DRa", "source": "data-2", "target": "risk-2a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e2-DRb", "source": "data-2", "target": "risk-2b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e2-RCa", "source": "risk-2a", "target": "ctrl-2a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e2-RCb", "source": "risk-2b", "target": "ctrl-2b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e2-CO", "source": "ctrl-2b", "target": "output-2", "type": "step", "style": { "stroke": "#8b5cf6" } },

    // Step 3
    { "id": "e3-L", "source": "l2-3", "target": "data-3", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e3-DRa", "source": "data-3", "target": "risk-3a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e3-DRb", "source": "data-3", "target": "risk-3b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e3-DRc", "source": "data-3", "target": "risk-3c", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e3-RCa", "source": "risk-3a", "target": "ctrl-3a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e3-RCb", "source": "risk-3b", "target": "ctrl-3b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e3-RCc", "source": "risk-3c", "target": "ctrl-3c", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e3-CO", "source": "ctrl-3b", "target": "output-3", "type": "step", "style": { "stroke": "#8b5cf6" } },

    // Step 4
    { "id": "e4-L", "source": "l2-4", "target": "data-4", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e4-DRa", "source": "data-4", "target": "risk-4a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e4-DRb", "source": "data-4", "target": "risk-4b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e4-RCa", "source": "risk-4a", "target": "ctrl-4a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e4-RCb", "source": "risk-4b", "target": "ctrl-4b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e4-CO", "source": "ctrl-4a", "target": "output-4", "type": "step", "style": { "stroke": "#8b5cf6" } },

    // Step 5
    { "id": "e5-L", "source": "l2-5", "target": "data-5", "type": "step", "style": { "stroke": "#94a3b8" } },
    // Fan to multiple risks
    { "id": "e5-DRa1", "source": "data-5", "target": "risk-5a1", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-DRa2", "source": "data-5", "target": "risk-5a2", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-DRb1", "source": "data-5", "target": "risk-5b1", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-DRb2", "source": "data-5", "target": "risk-5b2", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-DRc1", "source": "data-5", "target": "risk-5c1", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-DRc2", "source": "data-5", "target": "risk-5c2", "type": "step", "style": { "stroke": "#f43f5e" } },
    // Many risks to shared control
    { "id": "e5-RCa1", "source": "risk-5a1", "target": "ctrl-5a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e5-RCa2", "source": "risk-5a2", "target": "ctrl-5a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e5-RCb1", "source": "risk-5b1", "target": "ctrl-5b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e5-RCb2", "source": "risk-5b2", "target": "ctrl-5b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e5-RCc1", "source": "risk-5c1", "target": "ctrl-5c", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e5-RCc2", "source": "risk-5c2", "target": "ctrl-5c", "type": "step", "style": { "stroke": "#10b981" } },
    // Output
    { "id": "e5-CO", "source": "ctrl-5a", "target": "output-5", "type": "step", "style": { "stroke": "#8b5cf6" } },

    // Step 6
    { "id": "e6-L", "source": "l2-6", "target": "data-6", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e6-DRa1", "source": "data-6", "target": "risk-6a1", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-DRa2", "source": "data-6", "target": "risk-6a2", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-DRa3", "source": "data-6", "target": "risk-6a3", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-DRb1", "source": "data-6", "target": "risk-6b1", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-DRb2", "source": "data-6", "target": "risk-6b2", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-DRb3", "source": "data-6", "target": "risk-6b3", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-DRc1", "source": "data-6", "target": "risk-6c1", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-DRc2", "source": "data-6", "target": "risk-6c2", "type": "step", "style": { "stroke": "#f43f5e" } },
    // Connect to controls
    { "id": "e6-RCa1", "source": "risk-6a1", "target": "ctrl-6a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-RCa2", "source": "risk-6a2", "target": "ctrl-6a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-RCa3", "source": "risk-6a3", "target": "ctrl-6a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-RCb1", "source": "risk-6b1", "target": "ctrl-6b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-RCb2", "source": "risk-6b2", "target": "ctrl-6b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-RCb3", "source": "risk-6b3", "target": "ctrl-6b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-RCc1", "source": "risk-6c1", "target": "ctrl-6c", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-RCc2", "source": "risk-6c2", "target": "ctrl-6c", "type": "step", "style": { "stroke": "#10b981" } },
    // Output
    { "id": "e6-CO", "source": "ctrl-6c", "target": "output-6", "type": "step", "style": { "stroke": "#8b5cf6" } },

    // Step 7
    { "id": "e7-L", "source": "l2-7", "target": "data-7", "type": "step", "style": { "stroke": "#94a3b8" } },
    { "id": "e7-DRa", "source": "data-7", "target": "risk-7a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e7-DRb1", "source": "data-7", "target": "risk-7b1", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e7-DRb2", "source": "data-7", "target": "risk-7b2", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e7-RCa", "source": "risk-7a", "target": "ctrl-7a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e7-RCb1", "source": "risk-7b1", "target": "ctrl-7b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e7-RCb2", "source": "risk-7b2", "target": "ctrl-7b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e7-CO", "source": "ctrl-7b", "target": "output-7", "type": "step", "style": { "stroke": "#8b5cf6" } },
  ]
};
