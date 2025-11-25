
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
        "steps": [
          {
            "stepId": "S1-1",
            "stepName": "The client applies for a new PI Loan",
            "description": "The client applies for a new PI Loan",
            "actor": "Customer",
            "stepType": "Customer input",
            "nextStep": "S1-2",
            "automationLevel": "M",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S1-2",
            "stepName": "If customer is ETB, go to Product Selection",
            "description": "If customer is ETB, go to Product Selection",
            "actor": "System",
            "stepType": "Decision",
            "nextStep": "S1-3",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S1-3",
            "stepName": "Customer authentication & pre-qualification (A: EID / UAEPASS + OTP / B: credit pre-qualification using AECB)",
            "description": "Customer authentication & pre-qualification (A: EID / UAEPASS + OTP / B: credit pre-qualification using AECB)",
            "actor": "System",
            "stepType": "Customer / system interaction",
            "nextStep": "S1-4",
            "automationLevel": "A",
            "risksMitigated": [
              "R4",
              "R11"
            ],
            "controls": [
              {
                "controlId": "S1-3-C1",
                "name": "OTP mobile authentication",
                "type": "Automated",
                "description": "OTP mobile authentication"
              },
              {
                "controlId": "S1-3-C2",
                "name": "OCR EID scan (EFR)",
                "type": "Automated",
                "description": "OCR EID scan (EFR)"
              },
              {
                "controlId": "S1-3-C3",
                "name": "Customer data & document retrieval (EFR)",
                "type": "Automated",
                "description": "Customer data & document retrieval (EFR)"
              },
              {
                "controlId": "S1-3-C4",
                "name": "Cap number of attempts from same EID Vs devices",
                "type": "Automated",
                "description": "Cap number of attempts from same EID Vs devices"
              }
            ],
            "policies": [
              "What standards govern this?"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S1-4",
            "stepName": "Targeted product offering",
            "description": "Targeted product offering",
            "actor": "System",
            "stepType": "System calculation",
            "nextStep": "S1-5",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S1-5",
            "stepName": "Customer Product Selection",
            "description": "Customer Product Selection",
            "actor": "System",
            "stepType": "Customer input",
            "nextStep": "S2-1",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          }
        ]
      },
      {
        "stageId": "S2",
        "stageName": "Customer screening",
        "description": "Customer screening",
        "steps": [
          {
            "stepId": "S2-1",
            "stepName": "Confirm liveliness check versus identity documents (EFR Liveness)",
            "description": "Confirm liveliness check versus identity documents (EFR Liveness)",
            "actor": "System",
            "stepType": "System Control",
            "nextStep": "S2-2",
            "automationLevel": "A",
            "risksMitigated": [
              "R4"
            ],
            "controls": [
              {
                "controlId": "S2-1-C1",
                "name": "Liveness video selfie (EFR)",
                "type": "Automated",
                "description": "Liveness video selfie (EFR)"
              }
            ],
            "policies": [
              "Is there a standard / policy for this?"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S2-2",
            "stepName": "Customer data capture: salary a/c Nr & IBAN, AECB/UAEFTS consent, Date of joining, salary payment date, loan calculator",
            "description": "Customer data capture: salary a/c Nr & IBAN, AECB/UAEFTS consent, Date of joining, salary payment date, loan calculator",
            "actor": "System",
            "stepType": "Customer Input",
            "nextStep": "S2-3",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S2-3",
            "stepName": "Regulatory affordability assessment check",
            "description": "Regulatory affordability assessment check",
            "actor": "System",
            "stepType": "System Control",
            "nextStep": "S2-4",
            "automationLevel": "A",
            "risksMitigated": [
              "R8"
            ],
            "controls": [
              {
                "controlId": "S2-3-C1",
                "name": "Income threshold check (+7K salaried)",
                "type": "Automated",
                "description": "Income threshold check (+7K salaried)"
              },
              {
                "controlId": "S2-3-C2",
                "name": "Minimum age",
                "type": "Automated",
                "description": "Minimum age"
              },
              {
                "controlId": "S2-3-C3",
                "name": "AECB Risk Score Threshold (650+)",
                "type": "Automated",
                "description": "AECB Risk Score Threshold (650+)"
              },
              {
                "controlId": "S2-3-C4",
                "name": "Existing FAB application WIP",
                "type": "Automated",
                "description": "Existing FAB application WIP"
              },
              {
                "controlId": "S2-3-C5",
                "name": "Negative Checklist (Mubadara)",
                "type": "Automated",
                "description": "Negative Checklist (Mubadara)"
              },
              {
                "controlId": "S2-3-C6",
                "name": "Fraud Watchlist check; name + company (OFS)",
                "type": "Automated",
                "description": "Fraud Watchlist check; name + company (OFS)"
              }
            ],
            "policies": [
              "[affordability regulations / standards]"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S2-4",
            "stepName": "If the client is ETB go to \"Calculate Loan Offer\"",
            "description": "If the client is ETB go to \"Calculate Loan Offer\"",
            "actor": "System",
            "stepType": "System decision",
            "nextStep": "S2-5",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S2-5",
            "stepName": "Screen client against full FSK lists and where possible automatically dispose of false hits",
            "description": "Screen client against full FSK lists and where possible automatically dispose of false hits",
            "actor": "System",
            "stepType": "Control sub-process",
            "nextStep": "S3-1",
            "automationLevel": "A",
            "risksMitigated": [
              "R1",
              "R2",
              "R3",
              "R4"
            ],
            "controls": [
              {
                "controlId": "S2-5-C1",
                "name": "FSK + Silent8 screening",
                "type": "Automated",
                "description": "FSK + Silent8 screening"
              },
              {
                "controlId": "S2-5-C2",
                "name": "BBL verification",
                "type": "Automated",
                "description": "BBL verification"
              },
              {
                "controlId": "S2-5-C3",
                "name": "CRAM risk rating verification",
                "type": "Automated",
                "description": "CRAM risk rating verification"
              }
            ],
            "policies": [
              "PIL 2_Customer Validation",
              "KYC Policy"
            ],
            "decisionBranches": []
          }
        ]
      },
      {
        "stageId": "S3",
        "stageName": "Employer and salary validation",
        "description": "Employer and salary validation",
        "steps": [
          {
            "stepId": "S3-1",
            "stepName": "Employer validation as per agreed employer validation rules",
            "description": "Employer validation as per agreed employer validation rules",
            "actor": "System",
            "stepType": "Control sub-process",
            "nextStep": "S3-2",
            "automationLevel": "A/P",
            "risksMitigated": [
              "R4",
              "R5",
              "R6"
            ],
            "controls": [
              {
                "controlId": "S3-1-C1",
                "name": "Employer category check (EFR sponsor type or MOHRE & FAHR)",
                "type": "Automated",
                "description": "Employer category check (EFR sponsor type or MOHRE & FAHR)"
              },
              {
                "controlId": "S3-1-C2",
                "name": "Customer employer name and/or sponsor details (EFR, MOHRE, FAHR)",
                "type": "Automated",
                "description": "Customer employer name and/or sponsor details (EFR, MOHRE, FAHR)"
              },
              {
                "controlId": "S3-1-C3",
                "name": "Customer employer unique identifiers (EFR UID & TL + MOHRE TL)",
                "type": "Automated",
                "description": "Customer employer unique identifiers (EFR UID & TL + MOHRE TL)"
              },
              {
                "controlId": "S3-1-C4",
                "name": "Employer validation via TML (UID / TL matching)",
                "type": "Automated",
                "description": "Employer validation via TML (UID / TL matching)"
              },
              {
                "controlId": "S3-1-C5",
                "name": "New employer verification (adding to TML using NER employer info)",
                "type": "Partial / Hybrid",
                "description": "New employer verification (adding to TML using NER employer info)"
              }
            ],
            "policies": [
              "PIL 1_Customer Employer Validation",
              "PIL 2_Customer Validation",
              "KYC Policy",
              "Credit Policy (TML listing)"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S3-2",
            "stepName": "Salary validation as per agreed salary validation rules",
            "description": "Salary validation as per agreed salary validation rules",
            "actor": "System",
            "stepType": "Control sub-process",
            "nextStep": "S4-1",
            "automationLevel": "A",
            "risksMitigated": [
              "R5",
              "R6",
              "R7",
              "R11"
            ],
            "controls": [
              {
                "controlId": "S3-2-C1",
                "name": "IBAN validation (CB API \u2013 EID match + AECB API; last 4 digits)",
                "type": "Automated",
                "description": "IBAN validation (CB API \u2013 EID match + AECB API; last 4 digits)"
              },
              {
                "controlId": "S3-2-C2",
                "name": "Affordability assessment (CPR)",
                "type": "Automated",
                "description": "Affordability assessment (CPR)"
              },
              {
                "controlId": "S3-2-C3",
                "name": "Salary details + bank statements (MOHRE labour contract salary / FAHR salary certificate + AECB/UAEFTS)",
                "type": "Automated",
                "description": "Salary details + bank statements (MOHRE labour contract salary / FAHR salary certificate + AECB/UAEFTS)"
              },
              {
                "controlId": "S3-2-C4",
                "name": "Verify pensioner income source (AECB)",
                "type": "Automated",
                "description": "Verify pensioner income source (AECB)"
              },
              {
                "controlId": "S3-2-C5",
                "name": "Verify salary source with Employer name (EFR TL Vs MOHRE TL logic)",
                "type": "Automated",
                "description": "Verify salary source with Employer name (EFR TL Vs MOHRE TL logic)"
              },
              {
                "controlId": "S3-2-C6",
                "name": "Calculate variance threshold of salary from last 3 months?",
                "type": "Automated",
                "description": "Calculate variance threshold of salary from last 3 months?"
              }
            ],
            "policies": [
              "PIL 2_Customer Validation",
              "PIL 3_Salary Validation",
              "Credit Policy (TML listing)"
            ],
            "decisionBranches": []
          }
        ]
      },
      {
        "stageId": "S4",
        "stageName": "Credit underwriting",
        "description": "Credit underwriting",
        "steps": [
          {
            "stepId": "S4-1",
            "stepName": "Credit decisioning & Calculate Loan Offer to customer",
            "description": "Credit decisioning & Calculate Loan Offer to customer",
            "actor": "System",
            "stepType": "System calculation & decision",
            "nextStep": "S5-1",
            "automationLevel": "A",
            "risksMitigated": [
              "R6",
              "R7",
              "R11"
            ],
            "controls": [
              {
                "controlId": "S4-1-C1",
                "name": "Credit decision engine",
                "type": "Automated",
                "description": "Credit decision engine"
              }
            ],
            "policies": [
              "PIL 8_Risk Appetite Policy",
              "PIL 6_Loan Conditions Validation",
              "Responsible lending",
              "Credit Policy"
            ],
            "decisionBranches": []
          }
        ]
      },
      {
        "stageId": "S5",
        "stageName": "CASA account opening & insurance onboarding",
        "description": "CASA account opening & insurance onboarding",
        "steps": [
          {
            "stepId": "S5-1",
            "stepName": "Accept loan offer",
            "description": "Accept loan offer",
            "actor": "Customer",
            "stepType": "Customer input",
            "nextStep": "S5-2",
            "automationLevel": "M",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S5-2",
            "stepName": "If customer accepts loan offer, go to \"Loan Details\", if customer declines loan offer go to \"Loan Decline\"",
            "description": "If customer accepts loan offer, go to \"Loan Details\", if customer declines loan offer go to \"Loan Decline\"",
            "actor": "System",
            "stepType": "Decision",
            "nextStep": "S5-3",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S5-3",
            "stepName": "Loan Decline confirmation (triggers customer comms and stored history against the customer record)",
            "description": "Loan Decline confirmation (triggers customer comms and stored history against the customer record)",
            "actor": "System",
            "stepType": "Input",
            "nextStep": "S5-4",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S5-4",
            "stepName": "Provide life insurance options (cheapest first)",
            "description": "Provide life insurance options (cheapest first)",
            "actor": "System",
            "stepType": "System",
            "nextStep": "S5-5",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S5-5",
            "stepName": "Select insurance product",
            "description": "Select insurance product",
            "actor": "System",
            "stepType": "Customer",
            "nextStep": "S5-6",
            "automationLevel": "A",
            "risksMitigated": [
              "R12"
            ],
            "controls": [
              {
                "controlId": "S5-5-C1",
                "name": "Life insurance selection is mandatory",
                "type": "Automated",
                "description": "Life insurance selection is mandatory"
              },
              {
                "controlId": "S5-5-C2",
                "name": "Insurance onboarding, registration & document registration",
                "type": "Automated",
                "description": "Insurance onboarding, registration & document registration"
              },
              {
                "controlId": "S5-5-C3",
                "name": "Link insurance product to CIN/CIF",
                "type": "Automated",
                "description": "Link insurance product to CIN/CIF"
              }
            ],
            "policies": [
              "Credit policy"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S5-6",
            "stepName": "Loan fees & charges acceptance",
            "description": "Loan fees & charges acceptance",
            "actor": "System",
            "stepType": "Customer",
            "nextStep": "S5-7",
            "automationLevel": "A",
            "risksMitigated": [
              "R8",
              "R10",
              "R11",
              "R12"
            ],
            "controls": [
              {
                "controlId": "S5-6-C1",
                "name": "Fees and charges acceptance is mandatory for journey progression",
                "type": "Automated",
                "description": "Fees and charges acceptance is mandatory for journey progression"
              }
            ],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S5-7",
            "stepName": "If ETB customer has CASA account, go to Select Account for loan repayments. If no CASA account, go to CASA Data Capture",
            "description": "If ETB customer has CASA account, go to Select Account for loan repayments. If no CASA account, go to CASA Data Capture",
            "actor": "System",
            "stepType": "Decision",
            "nextStep": "S5-8",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S5-8",
            "stepName": "CASA Data Capture (debit card embossing details, preferred branch, cheque book selection)",
            "description": "CASA Data Capture (debit card embossing details, preferred branch, cheque book selection)",
            "actor": "System",
            "stepType": "Input",
            "nextStep": "S5-9",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S5-9",
            "stepName": "Create CASA account (includes debit card production & cheque book instructions)",
            "description": "Create CASA account (includes debit card production & cheque book instructions)",
            "actor": "System",
            "stepType": "System",
            "nextStep": "S5-10",
            "automationLevel": "A",
            "risksMitigated": [
              "R9",
              "R10",
              "R12"
            ],
            "controls": [
              {
                "controlId": "S5-9-C1",
                "name": "New To Bank CASA application capture",
                "type": "Automated",
                "description": "New To Bank CASA application capture"
              },
              {
                "controlId": "S5-9-C2",
                "name": "FATCA CRS declaration & tax status",
                "type": "Automated",
                "description": "FATCA CRS declaration & tax status"
              },
              {
                "controlId": "S5-9-C3",
                "name": "PEP self declaration",
                "type": "Automated",
                "description": "PEP self declaration"
              },
              {
                "controlId": "S5-9-C4",
                "name": "Account & IBAN creation (T24)",
                "type": "Automated",
                "description": "Account & IBAN creation (T24)"
              }
            ],
            "policies": [
              "KYC Policy",
              "What policies here?"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S5-10",
            "stepName": "Select Account for loan repayments",
            "description": "Select Account for loan repayments",
            "actor": "System",
            "stepType": "Input",
            "nextStep": "S6-1",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          }
        ]
      },
      {
        "stageId": "S6",
        "stageName": "Loan conditions validation",
        "description": "Loan conditions validation",
        "steps": [
          {
            "stepId": "S6-1",
            "stepName": "Ts&Cs customer sign off: Islamic Murabaha contract signing & acceptance, cooling off waiver/opt in, marketing consent",
            "description": "Ts&Cs customer sign off: Islamic Murabaha contract signing & acceptance, cooling off waiver/opt in, marketing consent",
            "actor": "System",
            "stepType": "Control",
            "nextStep": "S6-2",
            "automationLevel": "A",
            "risksMitigated": [
              "R8",
              "R10",
              "R11",
              "R12"
            ],
            "controls": [
              {
                "controlId": "S6-1-C1",
                "name": "Signed Ts & Cs",
                "type": "Automated",
                "description": "Signed Ts & Cs"
              },
              {
                "controlId": "S6-1-C2",
                "name": "Account welcome letter",
                "type": "Automated",
                "description": "Account welcome letter"
              },
              {
                "controlId": "S6-1-C3",
                "name": "Digital application form",
                "type": "Automated",
                "description": "Digital application form"
              },
              {
                "controlId": "S6-1-C4",
                "name": "Account & PIL product linking",
                "type": "Automated",
                "description": "Account & PIL product linking"
              }
            ],
            "policies": [
              "PIL 7_PL Application Form",
              "PIL 9_Master T&C Loans",
              "What standards / policy needs to go here?"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S6-2",
            "stepName": "Loan approval & disbursal with block (unique application reference, application docs and data stored on DMS, workflow case created in Appro, Islamic DDA automation, customer loan offer comms)",
            "description": "Loan approval & disbursal with block (unique application reference, application docs and data stored on DMS, workflow case created in Appro, Islamic DDA automation, customer loan offer comms)",
            "actor": "System",
            "stepType": "Control",
            "nextStep": "S6-3",
            "automationLevel": "A",
            "risksMitigated": [
              "R9",
              "R12"
            ],
            "controls": [
              {
                "controlId": "S6-2-C1",
                "name": "Block placed on disbursed loan (T24) for non-Unicorn customers",
                "type": "Automated",
                "description": "Block placed on disbursed loan (T24) for non-Unicorn customers"
              }
            ],
            "policies": [
              "PIL 5_CB Loan Disbursement",
              "Credit policy"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S6-3",
            "stepName": "STL doc uploaded by Customer",
            "description": "STL doc uploaded by Customer",
            "actor": "Customer",
            "stepType": "Input",
            "nextStep": "S6-4",
            "automationLevel": "M",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S6-4",
            "stepName": "STL letter validation",
            "description": "STL letter validation",
            "actor": "Group Operations",
            "stepType": "Control",
            "nextStep": "S6-5",
            "automationLevel": "M",
            "risksMitigated": [
              "R5",
              "R9"
            ],
            "controls": [
              {
                "controlId": "S6-4-C1",
                "name": "Digital document upload by customer",
                "type": "Manual",
                "description": "Digital document upload by customer"
              }
            ],
            "policies": [
              "PIL 6_Loan Conditions Validation",
              "Credit policy"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S6-5",
            "stepName": "Instalment cheque provided by customer",
            "description": "Instalment cheque provided by customer",
            "actor": "Customer",
            "stepType": "Input",
            "nextStep": "S6-6",
            "automationLevel": "M",
            "risksMitigated": [
              "R10",
              "R11",
              "R12"
            ],
            "controls": [
              {
                "controlId": "S6-5-C1",
                "name": "Signature validation at point of cheque collection",
                "type": "Manual",
                "description": "Signature validation at point of cheque collection"
              }
            ],
            "policies": [
              "PIL 6_Loan Conditions Validation",
              "Credit policy"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S6-6",
            "stepName": "Debit card & cheque book delivery to customer (new CASA accounts only)",
            "description": "Debit card & cheque book delivery to customer (new CASA accounts only)",
            "actor": "TTP",
            "stepType": "System",
            "nextStep": "S6-7",
            "automationLevel": "A",
            "risksMitigated": [],
            "controls": [],
            "policies": [],
            "decisionBranches": []
          },
          {
            "stepId": "S6-7",
            "stepName": "Salary credited in FAB account",
            "description": "Salary credited in FAB account",
            "actor": "Customer",
            "stepType": "Control",
            "nextStep": "S7-1",
            "automationLevel": "M",
            "risksMitigated": [
              "R5",
              "R12"
            ],
            "controls": [
              {
                "controlId": "S6-7-C1",
                "name": "Salary amount and source of salary validation (T24)",
                "type": "Manual",
                "description": "Salary amount and source of salary validation (T24)"
              }
            ],
            "policies": [
              "PIL 3_Salary Validation",
              "Credit policy"
            ],
            "decisionBranches": []
          }
        ]
      },
      {
        "stageId": "S7",
        "stageName": "Loan disbursal / funds release",
        "description": "Loan disbursal / funds release",
        "steps": [
          {
            "stepId": "S7-1",
            "stepName": "Loan funds released to customer PIL account (block released)",
            "description": "Loan funds released to customer PIL account (block released)",
            "actor": "Group Operations",
            "stepType": "System",
            "nextStep": "S7-2",
            "automationLevel": "M",
            "risksMitigated": [
              "R12"
            ],
            "controls": [
              {
                "controlId": "S7-1-C1",
                "name": "Maker checker process (T24)",
                "type": "Manual",
                "description": "Maker checker process (T24)"
              }
            ],
            "policies": [
              "PIL 4_Loan Maintenance",
              "PIL 5_CB Loan Disbursement"
            ],
            "decisionBranches": []
          },
          {
            "stepId": "S7-2",
            "stepName": "Security cheque filing",
            "description": "Security cheque filing",
            "actor": "Group Operations",
            "stepType": "Control",
            "nextStep": "S8-1",
            "automationLevel": "M",
            "risksMitigated": [
              "R9",
              "R12"
            ],
            "controls": [
              {
                "controlId": "S7-2-C1",
                "name": "??",
                "type": "Not specified",
                "description": "??"
              }
            ],
            "policies": [],
            "decisionBranches": []
          }
        ]
      },
      {
        "stageId": "S8",
        "stageName": "PIL QA process",
        "description": "PIL QA process",
        "steps": [
          {
            "stepId": "S8-1",
            "stepName": "Sampled QA process on all disbursed PILs issued in the prior month",
            "description": "Sampled QA process on all disbursed PILs issued in the prior month",
            "actor": "Group Credit",
            "stepType": "Control",
            "nextStep": "END",
            "automationLevel": "M",
            "risksMitigated": [
              "R12"
            ],
            "controls": [],
            "policies": [
              "Credit QA SOP & standards"
            ],
            "decisionBranches": []
          }
        ]
      }
    ]
  },
  "inherentRisks": [
    {
      "riskId": "R4",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R4",
      "category": "Operational"
    },
    {
      "riskId": "R11",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R11",
      "category": "Operational"
    },
    {
      "riskId": "R8",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R8",
      "category": "Operational"
    },
    {
      "riskId": "R1",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R1",
      "category": "Operational"
    },
    {
      "riskId": "R2",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R2",
      "category": "Operational"
    },
    {
      "riskId": "R3",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R3",
      "category": "Operational"
    },
    {
      "riskId": "R5",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R5",
      "category": "Operational"
    },
    {
      "riskId": "R6",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R6",
      "category": "Operational"
    },
    {
      "riskId": "R7",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R7",
      "category": "Operational"
    },
    {
      "riskId": "R12",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R12",
      "category": "Operational"
    },
    {
      "riskId": "R10",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R10",
      "category": "Operational"
    },
    {
      "riskId": "R9",
      "riskType": "Process Risk",
      "description": "Mitigated by steps referencing R9",
      "category": "Operational"
    }
  ],
  "processObjectives": [
    {
      "id": "PO1",
      "description": "Open PIL account for individual customers within 15min",
      "type": "timing"
    },
    {
      "id": "PO2",
      "description": "Assign customer to appropriate segment",
      "type": "segmentation"
    },
    {
      "id": "PO3",
      "description": "Manage attendant risks and scalability requirements",
      "type": "risk_management"
    }
  ],
  "metricsAndMeasures": [
    {
      "metricId": "M1",
      "type": "Time to funds",
      "description": "Average time taken from application started to funds disbursed",
      "target": "15 minutes",
      "unit": "minutes",
      "currentValue": 12
    },
    {
      "metricId": "M2",
      "type": "Approval Rate",
      "description": "% approved applications that are disbursed",
      "target": "85%",
      "unit": "percentage",
      "currentValue": 88
    },
    {
      "metricId": "M5",
      "type": "Drop off rate",
      "description": "% of customers that drop out of the journey before disbursal",
      "target": "< 10%",
      "unit": "percentage",
      "currentValue": 8.5
    }
  ],
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
