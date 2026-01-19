
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

// Layout Config (Coordinates are applied by filterDummyData but base Y is here)
const COL_L2 = 0;
const COL_DATA = 500;
const COL_RISK = 1000;
const COL_CTRL = 1500;
const COL_OUTPUT = 2000;

export const DUMMY_PROCESS_ANALYSIS_DATA = {
  "nodes": [
    /* ------------------------------------------------------------------
       STEP 1: Customer details & product selection
       Base: 200
       ------------------------------------------------------------------ */
    {
      "id": "l2-1",
      "data": { "label": "1. Customer details & product selection" },
      "position": { "x": COL_L2, "y": 200 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-1",
      "data": { "label": "Customer name\nEID\nEmail\nPhone" },
      "position": { "x": COL_DATA, "y": 200 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-1a",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-1a",
      "data": { "label": "Existing FAB customer and/or Application WIP will be dropped from the digital journey (A)" },
      "position": { "x": COL_CTRL, "y": 100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-1b",
      "data": { "label": "Compliance" },
      "position": { "x": COL_RISK, "y": 300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-1b",
      "data": { "label": "Restricted countries check (IP blocking) (A)\nEID or UAEPASS + OTP customer authentication (A)" },
      "position": { "x": COL_CTRL, "y": 300 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-1",
      "data": { "label": "New application record" },
      "position": { "x": COL_OUTPUT, "y": 200 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 2: Pre-eligibility + customer ID&V
       Base: 700 (Gap 500)
       ------------------------------------------------------------------ */
    {
      "id": "l2-2",
      "data": { "label": "2. Pre-eligibility + customer ID&V" },
      "position": { "x": COL_L2, "y": 700 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-2",
      "data": { "label": "EID copy (digital)" },
      "position": { "x": COL_DATA, "y": 700 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-2a",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2a",
      "data": { "label": "OCR EID scan (EFR) (A)" },
      "position": { "x": COL_CTRL, "y": 600 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-2b",
      "data": { "label": "Reputation" },
      "position": { "x": COL_RISK, "y": 800 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2b",
      "data": { "label": "Income threshold check (+7K salaried)\nMinimum age; AECB Risk Score Threshold (711+)\nExisting FAB application WIP check\nNegative Checklist (Mubadara)\nFraud Watchlist check; name + company (OFS) (A)" },
      "position": { "x": COL_CTRL, "y": 800 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-2",
      "data": { "label": "Affordability assessment results" },
      "position": { "x": COL_OUTPUT, "y": 700 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 3: Employer and salary validation
       Base: 1300 (Gap 600)
       ------------------------------------------------------------------ */
    {
      "id": "l2-3",
      "data": { "label": "3. Employer and salary validation" },
      "position": { "x": COL_L2, "y": 1300 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-3",
      "data": { "label": "Employer details, Salary\nUID/TL\nEFR/AECB/UAEFTS Reports" },
      "position": { "x": COL_DATA, "y": 1300 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3a",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 1100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3a",
      "data": { "label": "Employer category check (EFR/MOHRE/FAHR)\nEmployer name/sponsor details (EFR/MOHRE)\nCustomer employer unique identifiers (EFR UID & TL + MOHRE TL)\nEmployer validation via TML (UID/TL matching) (A)\nNew employer verification (adding to TML using NER employer info) (P)" },
      "position": { "x": COL_CTRL, "y": 1100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3b",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 1300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3b",
      "data": { "label": "IBAN validation (CB API – EID match + AECB API; last 4 digits) (A)\nAffordability assessment (CPR) (A)\nSalary details + bank statements (MOHRE labour contract salary + AECB/UAEFTS) (A)\nVerify salary source with Employer name (EFR TL Vs MOHRE TL logic) (A)\nCalculate variance threshold of salary from last 3 months (A)" },
      "position": { "x": COL_CTRL, "y": 1300 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3c",
      "data": { "label": "Compliance" },
      "position": { "x": COL_RISK, "y": 1500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3c",
      "data": { "label": "Taking the calculated salary as the most occurring salary in last 3 months (A)\nCustomer communication sent accordingly for the exceptions (A)" },
      "position": { "x": COL_CTRL, "y": 1500 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-3",
      "data": { "label": "employer validation response (y / n)\nsalary validation response (y / n)\nTML enrichment data points (UID / TL of employer)\nAECB report" },
      "position": { "x": COL_OUTPUT, "y": 1300 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 4: Credit underwriting
       Base: 1900 (Gap 600)
       ------------------------------------------------------------------ */
    {
      "id": "l2-4",
      "data": { "label": "4. Credit underwriting" },
      "position": { "x": COL_L2, "y": 1900 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-4",
      "data": { "label": "None" },
      "position": { "x": COL_DATA, "y": 1900 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-4a",
      "data": { "label": "Credit" },
      "position": { "x": COL_RISK, "y": 1800 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-4a",
      "data": { "label": "Credit decision engine (A)" },
      "position": { "x": COL_CTRL, "y": 1800 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-4b",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 2000 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-4b",
      "data": { "label": "Life insurance selection is mandatory (A)\nGenerate Insurance acceptance form and sent to customer (A)\nInsurance onboarding, registration & document registration(as per BAU Insurance group process) (M)\nLink insurance product to CIN/CIF (A)" },
      "position": { "x": COL_CTRL, "y": 2000 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-4",
      "data": { "label": "Customer internal credit score (app score)\nDBR\nPIL offer letter" },
      "position": { "x": COL_OUTPUT, "y": 1900 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 5: CASA account opening & insurance selection
       Base: 2500 (Gap 600)
       ------------------------------------------------------------------ */
    {
      "id": "l2-5",
      "data": { "label": "5. CASA account opening & insurance selection" },
      "position": { "x": COL_L2, "y": 2500 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-5",
      "data": { "label": "None" },
      "position": { "x": COL_DATA, "y": 2500 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5a1",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 2300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5a2",
      "data": { "label": "Financial Crime" },
      "position": { "x": COL_RISK, "y": 2400 }, // Spaced +100
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5a",
      "data": { "label": "Life insurance selection is mandatory (A)\nGenerate Insurance acceptance form and sent to customer (A)\nInsurance onboarding, registration & document registration(as per BAU Insurance group process) (M)\nLink insurance product to CIN/CIF (A)\nCreating Current account for the same customer via BAU CASA Onboarding journey (A)" },
      "position": { "x": COL_CTRL, "y": 2350 }, // Centered to 2300/2400
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5b1",
      "data": { "label": "Reputation" },
      "position": { "x": COL_RISK, "y": 2500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5b2",
      "data": { "label": "Compliance" },
      "position": { "x": COL_RISK, "y": 2600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5b",
      "data": { "label": "Signed Ts & Cs (A)\nDigital application form (A)\nAccount & PIL product linking (A)\nCooling off waiver / opt in (M)\nAbility to cancel application in cooling off period (M)" },
      "position": { "x": COL_CTRL, "y": 2550 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5c1",
      "data": { "label": "Financial" },
      "position": { "x": COL_RISK, "y": 2700 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5c2",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 2800 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5c",
      "data": { "label": "New To Bank CASA application capture (A)\nFATCA CRS declaration & tax status (A)\nFSK + Silent8 screening (A)\nBBL verification (A)\nCRAM risk rating verification (A)" },
      "position": { "x": COL_CTRL, "y": 2750 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-5",
      "data": { "label": "Insurance form" },
      "position": { "x": COL_OUTPUT, "y": 2500 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 6: Loan conditions validation
       Base: 3300 (Gap 550)
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
      "data": { "label": "STL record (image &/or hard copy)\nActual salary (amount)\nSalary credit date\nSource of salary\nSecurity cheque record (image & hard copy)" },
      "position": { "x": COL_DATA, "y": 3300 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6a1",
      "data": { "label": "Financial" },
      "position": { "x": COL_RISK, "y": 3000 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6a2",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 3100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6a3",
      "data": { "label": "Financial Crime" },
      "position": { "x": COL_RISK, "y": 3200 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6a",
      "data": { "label": "IBAN validation (CASA Vs PIL) (A)\nBlock placed on disbursed loan (T24) for non-waiver customers wherein the sec chq and first salary credit is not waived off (A)\nDocuments acquired from customers or captured during journey are stored in DMS (A)" },
      "position": { "x": COL_CTRL, "y": 3100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6b1",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 3300 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6b2",
      "data": { "label": "Compliance" },
      "position": { "x": COL_RISK, "y": 3400 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6b3",
      "data": { "label": "Financial" },
      "position": { "x": COL_RISK, "y": 3500 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6b",
      "data": { "label": "Non eSTLs are filed on customer file (M)\nQR code validation for eSTLs (M)\nSignature validation at point of cheque collection (M)\nCheques are filed on customer file (M)\nCheque account number = salary account number (M)" },
      "position": { "x": COL_CTRL, "y": 3400 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6c1",
      "data": { "label": "Fraud" },
      "position": { "x": COL_RISK, "y": 3600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6c2",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 3700 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6c",
      "data": { "label": "Salary amount and source of salary validation (T24) (M)\nValidate the variance for salary credited is not beyond 10% from T24 and calculated salary (M)\nVerify Source of employer for salary credit in T24 should be same as that Employer Validation outcome (M)" },
      "position": { "x": COL_CTRL, "y": 3650 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-6",
      "data": { "label": "None" },
      "position": { "x": COL_OUTPUT, "y": 3300 },
      "className": "output-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       STEP 7: Loan disbursal / funds release
       Base: 4000 (Gap 300)
       ------------------------------------------------------------------ */
    {
      "id": "l2-7",
      "data": { "label": "7. Loan disbursal / funds release" },
      "position": { "x": COL_L2, "y": 4000 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "data-7",
      "data": { "label": "None" },
      "position": { "x": COL_DATA, "y": 4000 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7a",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 3900 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7a",
      "data": { "label": "Maker checker process (T24) (M)\nValidate the variance for salary credited is not beyond 10% from T24 and calculated salary (M)\nManual sub processes be followed outside the workflow system via emails to unblock funds in T24 (M)" },
      "position": { "x": COL_CTRL, "y": 3900 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7b1",
      "data": { "label": "Financial Crime" },
      "position": { "x": COL_RISK, "y": 4100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7b2",
      "data": { "label": "Operational" },
      "position": { "x": COL_RISK, "y": 4200 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7b",
      "data": { "label": "Customer summary from workflow system that show application is completed and approved must be attached (M)\nDocuments must be sent to File Management within 2 business days of the application being fully approved (M)" },
      "position": { "x": COL_CTRL, "y": 4150 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "output-7",
      "data": { "label": "PIL record, Transactional data, PIL contract, Evidence of customer consents" },
      "position": { "x": COL_OUTPUT, "y": 4000 },
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
    { "id": "e1-CO", "source": "ctrl-1b", "target": "output-1", "type": "step", "style": { "stroke": "#8b5cf6" } }, 

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
