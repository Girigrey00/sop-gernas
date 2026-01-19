
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

export const DUMMY_PROCESS_ANALYSIS_DATA = {
  "nodes": [
    /* ------------------------------------------------------------------
       ROW 1: Customer details & product selection
       ------------------------------------------------------------------ */
    {
      "id": "l2-1",
      "data": { "label": "1. Customer details & product selection" },
      "position": { "x": 0, "y": 100 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Data
    {
      "id": "data-1",
      "data": { "label": "Customer name\nEID\nEmail\nPhone" },
      "position": { "x": 350, "y": 100 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-1a",
      "data": { "label": "R4: Fraud - App WIP" },
      "position": { "x": 700, "y": 0 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-1b",
      "data": { "label": "R11: Compliance - Auth" },
      "position": { "x": 700, "y": 150 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-1a",
      "data": { "label": "Existing FAB customer/WIP check (A)" },
      "position": { "x": 1050, "y": 0 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-1b",
      "data": { "label": "Restricted IP check (A)" },
      "position": { "x": 1050, "y": 100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-1c",
      "data": { "label": "EID/UAEPASS + OTP (A)" },
      "position": { "x": 1050, "y": 200 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 2: Pre-eligibility + customer ID&V
       ------------------------------------------------------------------ */
    {
      "id": "l2-2",
      "data": { "label": "2. Pre-eligibility + customer ID&V" },
      "position": { "x": 0, "y": 450 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Data
    {
      "id": "data-2",
      "data": { "label": "EID copy (digital)" },
      "position": { "x": 350, "y": 450 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-2a",
      "data": { "label": "R4: Fraud - Identity" },
      "position": { "x": 700, "y": 350 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-2b",
      "data": { "label": "R8: Reputation - Eligibility" },
      "position": { "x": 700, "y": 550 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-2a",
      "data": { "label": "OCR EID scan (EFR) (A)" },
      "position": { "x": 1050, "y": 350 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2b",
      "data": { "label": "Income (+7K), Age, AECB (711+) (A)" },
      "position": { "x": 1050, "y": 450 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2c",
      "data": { "label": "Negative Checklist (Mubadara) (A)" },
      "position": { "x": 1050, "y": 550 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-2d",
      "data": { "label": "Fraud Watchlist check (OFS) (A)" },
      "position": { "x": 1050, "y": 650 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 3: Employer and salary validation
       ------------------------------------------------------------------ */
    {
      "id": "l2-3",
      "data": { "label": "3. Employer and salary validation" },
      "position": { "x": 0, "y": 1000 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Data
    {
      "id": "data-3",
      "data": { "label": "Employer details\nSalary\nUID/TL\nEFR/AECB Reports" },
      "position": { "x": 350, "y": 1000 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-3a",
      "data": { "label": "R4: Fraud - Employer" },
      "position": { "x": 700, "y": 850 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3b",
      "data": { "label": "R5: Fraud - Banking/Salary" },
      "position": { "x": 700, "y": 1000 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-3c",
      "data": { "label": "R11: Compliance - Salary Rule" },
      "position": { "x": 700, "y": 1200 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-3a",
      "data": { "label": "Employer category, Name, UID/TL check (A)" },
      "position": { "x": 1050, "y": 800 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3b",
      "data": { "label": "TML Validation (UID/TL) (A)" },
      "position": { "x": 1050, "y": 900 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3c",
      "data": { "label": "IBAN val, Affordability (CPR) (A)" },
      "position": { "x": 1050, "y": 1000 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3d",
      "data": { "label": "Salary Variance threshold (A)" },
      "position": { "x": 1050, "y": 1100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-3e",
      "data": { "label": "Calculated salary rule & comms (A)" },
      "position": { "x": 1050, "y": 1200 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 4: Credit underwriting
       ------------------------------------------------------------------ */
    {
      "id": "l2-4",
      "data": { "label": "4. Credit underwriting" },
      "position": { "x": 0, "y": 1400 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Data (Generic)
    {
      "id": "data-4",
      "data": { "label": "Credit Profile" },
      "position": { "x": 350, "y": 1400 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-4a",
      "data": { "label": "R7: Credit Risk" },
      "position": { "x": 700, "y": 1350 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-4b",
      "data": { "label": "R12: Operational Risk" },
      "position": { "x": 700, "y": 1450 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-4a",
      "data": { "label": "Credit decision engine (A)" },
      "position": { "x": 1050, "y": 1350 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-4b",
      "data": { "label": "Life insurance mandatory & Linking (A)" },
      "position": { "x": 1050, "y": 1450 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 5: CASA account opening & insurance selection
       ------------------------------------------------------------------ */
    {
      "id": "l2-5",
      "data": { "label": "5. CASA account opening & insurance selection" },
      "position": { "x": 0, "y": 1750 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Data
    {
      "id": "data-5",
      "data": { "label": "Account Details\nInsurance Choice" },
      "position": { "x": 350, "y": 1750 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-5a",
      "data": { "label": "R8: Reputation\nR11: Compliance" },
      "position": { "x": 700, "y": 1600 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5b",
      "data": { "label": "R2, R3: Fin Crime" },
      "position": { "x": 700, "y": 1750 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-5c",
      "data": { "label": "R10: Financial\nR4: Fraud" },
      "position": { "x": 700, "y": 1900 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-5a",
      "data": { "label": "Signed Ts & Cs\nDigital Form (A)" },
      "position": { "x": 1050, "y": 1600 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5b",
      "data": { "label": "FSK + Silent8 + BBL Screening (A)" },
      "position": { "x": 1050, "y": 1750 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-5c",
      "data": { "label": "New To Bank CASA capture, CRAM (A)" },
      "position": { "x": 1050, "y": 1900 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 6: Loan conditions validation
       ------------------------------------------------------------------ */
    {
      "id": "l2-6",
      "data": { "label": "6. Loan conditions validation" },
      "position": { "x": 0, "y": 2200 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Data
    {
      "id": "data-6",
      "data": { "label": "STL\nSalary Date\nSec Cheque" },
      "position": { "x": 350, "y": 2200 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-6a",
      "data": { "label": "R10: Financial" },
      "position": { "x": 700, "y": 2100 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6b",
      "data": { "label": "R9: Fin Crime\nR5: Fraud" },
      "position": { "x": 700, "y": 2250 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-6c",
      "data": { "label": "R12: Operational" },
      "position": { "x": 700, "y": 2400 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-6a",
      "data": { "label": "IBAN match (A)\nSig val (M)" },
      "position": { "x": 1050, "y": 2100 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6b",
      "data": { "label": "Block loan (A)\nQR code (M)\nNon eSTL filing (M)" },
      "position": { "x": 1050, "y": 2250 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-6c",
      "data": { "label": "DMS Document Storage (M)" },
      "position": { "x": 1050, "y": 2400 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },

    /* ------------------------------------------------------------------
       ROW 7: Loan disbursal / funds release
       ------------------------------------------------------------------ */
    {
      "id": "l2-7",
      "data": { "label": "7. Loan disbursal / funds release" },
      "position": { "x": 0, "y": 2600 },
      "className": "l2-process-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Data
    {
      "id": "data-7",
      "data": { "label": "Disbursal Confirmation" },
      "position": { "x": 350, "y": 2600 },
      "className": "data-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Risks
    {
      "id": "risk-7a",
      "data": { "label": "R12: Operational" },
      "position": { "x": 700, "y": 2550 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "risk-7b",
      "data": { "label": "R9: Fin Crime" },
      "position": { "x": 700, "y": 2650 },
      "className": "risk-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    // Controls
    {
      "id": "ctrl-7a",
      "data": { "label": "Maker checker (M)\nSalary Variance (M)" },
      "position": { "x": 1050, "y": 2550 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    },
    {
      "id": "ctrl-7b",
      "data": { "label": "Customer summary attached (M)" },
      "position": { "x": 1050, "y": 2650 },
      "className": "control-node",
      "sourcePosition": "right",
      "targetPosition": "left"
    }
  ],
  "edges": [
    // Row 1
    { "id": "e1-d", "source": "l2-1", "target": "data-1", "type": "step", "style": { "stroke": "#cbd5e1" } },
    { "id": "e1-r1", "source": "data-1", "target": "risk-1a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e1-r2", "source": "data-1", "target": "risk-1b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e1-c1", "source": "risk-1a", "target": "ctrl-1a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e1-c2", "source": "risk-1b", "target": "ctrl-1b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e1-c3", "source": "risk-1b", "target": "ctrl-1c", "type": "step", "style": { "stroke": "#10b981" } },

    // Row 2
    { "id": "e2-d", "source": "l2-2", "target": "data-2", "type": "step", "style": { "stroke": "#cbd5e1" } },
    { "id": "e2-r1", "source": "data-2", "target": "risk-2a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e2-r2", "source": "data-2", "target": "risk-2b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e2-c1", "source": "risk-2a", "target": "ctrl-2a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e2-c2", "source": "risk-2b", "target": "ctrl-2b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e2-c3", "source": "risk-2b", "target": "ctrl-2c", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e2-c4", "source": "risk-2b", "target": "ctrl-2d", "type": "step", "style": { "stroke": "#10b981" } },

    // Row 3
    { "id": "e3-d", "source": "l2-3", "target": "data-3", "type": "step", "style": { "stroke": "#cbd5e1" } },
    { "id": "e3-r1", "source": "data-3", "target": "risk-3a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e3-r2", "source": "data-3", "target": "risk-3b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e3-r3", "source": "data-3", "target": "risk-3c", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e3-c1", "source": "risk-3a", "target": "ctrl-3a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e3-c2", "source": "risk-3a", "target": "ctrl-3b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e3-c3", "source": "risk-3b", "target": "ctrl-3c", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e3-c4", "source": "risk-3b", "target": "ctrl-3d", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e3-c5", "source": "risk-3c", "target": "ctrl-3e", "type": "step", "style": { "stroke": "#10b981" } },

    // Row 4
    { "id": "e4-d", "source": "l2-4", "target": "data-4", "type": "step", "style": { "stroke": "#cbd5e1" } },
    { "id": "e4-r1", "source": "data-4", "target": "risk-4a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e4-r2", "source": "data-4", "target": "risk-4b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e4-c1", "source": "risk-4a", "target": "ctrl-4a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e4-c2", "source": "risk-4b", "target": "ctrl-4b", "type": "step", "style": { "stroke": "#10b981" } },

    // Row 5
    { "id": "e5-d", "source": "l2-5", "target": "data-5", "type": "step", "style": { "stroke": "#cbd5e1" } },
    { "id": "e5-r1", "source": "data-5", "target": "risk-5a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-r2", "source": "data-5", "target": "risk-5b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-r3", "source": "data-5", "target": "risk-5c", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e5-c1", "source": "risk-5a", "target": "ctrl-5a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e5-c2", "source": "risk-5b", "target": "ctrl-5b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e5-c3", "source": "risk-5c", "target": "ctrl-5c", "type": "step", "style": { "stroke": "#10b981" } },

    // Row 6
    { "id": "e6-d", "source": "l2-6", "target": "data-6", "type": "step", "style": { "stroke": "#cbd5e1" } },
    { "id": "e6-r1", "source": "data-6", "target": "risk-6a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-r2", "source": "data-6", "target": "risk-6b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-r3", "source": "data-6", "target": "risk-6c", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e6-c1", "source": "risk-6a", "target": "ctrl-6a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-c2", "source": "risk-6b", "target": "ctrl-6b", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e6-c3", "source": "risk-6c", "target": "ctrl-6c", "type": "step", "style": { "stroke": "#10b981" } },

    // Row 7
    { "id": "e7-d", "source": "l2-7", "target": "data-7", "type": "step", "style": { "stroke": "#cbd5e1" } },
    { "id": "e7-r1", "source": "data-7", "target": "risk-7a", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e7-r2", "source": "data-7", "target": "risk-7b", "type": "step", "style": { "stroke": "#f43f5e" } },
    { "id": "e7-c1", "source": "risk-7a", "target": "ctrl-7a", "type": "step", "style": { "stroke": "#10b981" } },
    { "id": "e7-c2", "source": "risk-7b", "target": "ctrl-7b", "type": "step", "style": { "stroke": "#10b981" } }
  ]
};
