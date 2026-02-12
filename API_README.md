
# GERNAS Process Builder API Specification

This document outlines the API endpoints required to power the **Process Builder** module. This flow moves away from the generic `/ingest` endpoint and uses a two-step generation process:
1.  **Structure Generation**: Extracting editable tables (Objectives, Definition, Risks) from raw documents.
2.  **Flow Generation**: Converting the (potentially edited) tables into a visual node-link diagram.

## Base URL
All endpoints are relative to the API base (e.g., `/api`).

---

## 1. Create Process Structure
**Endpoint:** `POST /createprocess`

**Description:** 
Accepts a product name and a list of stages. Each stage contains a list of Azure Blob Storage URLs (SAS URLs) for the documents uploaded by the frontend. The backend analyzes these documents to extract structured data for the "Review" screen.

### Request Payload
```json
{
  "productName": "PIL Onboarding",
  "stages": [
    {
      "id": 171500123, 
      "stageName": "Customer Application",
      "documents": [
        "https://auranpunawlsa.blob.core.windows.net/cbg-knowledge-hub/PIL_App_Form.pdf?sp=r&st=...",
        "https://auranpunawlsa.blob.core.windows.net/cbg-knowledge-hub/Policy_v1.pdf?sp=r&st=..."
      ]
    },
    {
      "id": 171500456,
      "stageName": "Credit Underwriting",
      "documents": [
        "https://auranpunawlsa.blob.core.windows.net/cbg-knowledge-hub/Risk_Policy.docx?sp=r&st=..."
      ]
    }
  ]
}
```

### Response Payload
The response returns three distinct arrays used to populate the **Review Process Definition** screen (tabs: Objectives, Definition, Risks).

```json
{
  "objectives": [
    {
      "id": "obj-1",
      "key": "Speed",
      "value": "Provide PIL full approval within 15 mins in Full STP scenario.",
      "editable": true
    },
    {
      "id": "obj-2",
      "key": "Compliance",
      "value": "Ensure 100% adherence to Central Bank regulations.",
      "editable": true
    }
  ],
  "definition": [
    {
      "id": "S1-1",
      "l2Process": "Customer Application",
      "stepName": "Explain Product Features",
      "stepDescription": "CSO explains all account terms, features, charges to customer.",
      "actor": "CSO",
      "stepType": "Interaction",
      "system": "N/A",
      "processingTime": "10m",
      "risks": "Mis-selling"
    },
    {
      "id": "S1-2",
      "l2Process": "Customer Application",
      "stepName": "Data Entry",
      "stepDescription": "Enter customer details into the core banking system.",
      "actor": "CSO",
      "stepType": "Activity",
      "system": "T24",
      "processingTime": "15m",
      "risks": "Data Entry Error"
    }
  ],
  "risks": [
    {
      "id": "r-1",
      "key": "R1 - Fraud",
      "value": "Customer provides invalid or forged documents.",
      "editable": true
    },
    {
      "id": "r-2",
      "key": "R2 - Operational",
      "value": "System downtime preventing application completion.",
      "editable": true
    }
  ]
}
```

---

## 2. Generate Flow Diagram
**Endpoint:** `POST /generateflow`

**Description:**
Accepts the *reviewed and edited* data from the previous step. The backend calculates the logic connections (`nextStep`, decision branches) and returns the standard `SopResponse` JSON used to render the ReactFlow canvas.

### Request Payload
This contains the final state of the tables after the user has made edits in the UI.

```json
{
  "productName": "PIL Onboarding",
  "objectives": [
    {
      "id": "obj-1",
      "key": "Speed",
      "value": "Provide PIL full approval within 15 mins in Full STP scenario.",
      "editable": true
    }
  ],
  "definition": [
    {
      "id": "S1-1",
      "l2Process": "Customer Application",
      "stepName": "Explain Product Features",
      "stepDescription": "CSO explains all account terms...",
      "actor": "CSO",
      "stepType": "Interaction",
      "system": "N/A",
      "processingTime": "10m",
      "risks": "Mis-selling"
    },
    {
      "id": "S1-2",
      "l2Process": "Customer Application",
      "stepName": "Data Entry",
      "stepDescription": "Enter customer details...",
      "actor": "CSO",
      "stepType": "Activity",
      "system": "T24",
      "processingTime": "15m",
      "risks": "Data Entry Error"
    }
  ],
  "risks": [
    {
      "id": "r-1",
      "key": "R1 - Fraud",
      "value": "Customer provides invalid or forged documents.",
      "editable": true
    }
  ]
}
```

### Response Payload
Returns the complete SOP structure including the visual graph logic (`startNode`, `endNode`, `processFlow`).

```json
{
  "startNode": {
    "stepId": "START",
    "stepName": "Start",
    "description": "Process initiation",
    "actor": "System",
    "stepType": "Start",
    "nextStep": "S1-1"
  },
  "endNode": {
    "stepId": "END",
    "stepName": "End",
    "description": "Process completion",
    "actor": "System",
    "stepType": "End",
    "nextStep": null
  },
  "processDefinition": {
    "title": "PIL Onboarding",
    "version": "1.0",
    "classification": "Internal",
    "documentLink": "#"
  },
  "processObjectives": [
    {
      "description": "Speed: Provide PIL full approval within 15 mins in Full STP scenario."
    }
  ],
  "inherentRisks": [
    {
      "riskId": "R1",
      "riskType": "Fraud",
      "description": "Customer provides invalid or forged documents.",
      "category": "Operational"
    }
  ],
  "processFlow": {
    "stages": [
      {
        "stageId": "S1",
        "stageName": "Customer Application",
        "description": "Customer Application",
        "steps": [
          {
            "stepId": "S1-1",
            "stepName": "Explain Product Features",
            "description": "CSO explains all account terms...",
            "actor": "CSO",
            "stepType": "Interaction",
            "nextStep": "S1-2",
            "risksMitigated": ["R1"],
            "processingTime": "10m",
            "system": "N/A"
          },
          {
            "stepId": "S1-2",
            "stepName": "Data Entry",
            "description": "Enter customer details...",
            "actor": "CSO",
            "stepType": "Activity",
            "nextStep": "END", 
            "risksMitigated": [],
            "processingTime": "15m",
            "system": "T24"
          }
        ]
      }
    ]
  },
  "metadata": {
    "product_name": "PIL Onboarding",
    "generated_at": "2023-10-27T10:00:00Z"
  }
}
```
