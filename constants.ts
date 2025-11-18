import { SopResponse } from './types';

export const MOCK_SOP_DATA: SopResponse = {
"startNode": {
"stepId": "START",
"stepName": "START",
"description": "Process Start",
"actor": "System",
"stepType": "Start",
"nextStep": "S1-1"
},
"endNode": {
"stepId": "END",
"stepName": "END",
"description": "Process Complete",
"actor": "System",
"stepType": "End",
"nextStep": null
},
"processDefinition": {
"title": "PERSONAL INCOME LOAN, DIGITAL CUSTOMER ONBOARDING",
"version": "20251014",
"classification": "Internal\ FAB Internal",
"documentLink": "PIL_DIGITAL_SIPOC_20251014.xlsx"
},
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
"inherentRisks": [
{
"riskId": "R1",
"riskType": "Financial Crime",
"description": "We onboard a customer subject to sanctions",
"category": "financial_crime"
},
{
"riskId": "R2",
"riskType": "Financial Crime",
"description": "We fail to identify higher risk customers",
"category": "financial_crime"
},
{
"riskId": "R3",
"riskType": "Financial Crime",
"description": "We do inadequate due diligence on higher risk customers",
"category": "financial_crime"
},
{
"riskId": "R4",
"riskType": "Fraud",
"description": "The customer is using fake identification, or spoofing their identity",
"category": "fraud"
},
{
"riskId": "R5",
"riskType": "Fraud",
"description": "The customer is falsifying their income and employment status to access credit beyond their entitlement",
"category": "fraud"
},
{
"riskId": "R6",
"riskType": "Credit Risk",
"description": "We onboard a customer outside our credit risk appetite",
"category": "credit_risk"
},
{
"riskId": "R7",
"riskType": "Credit Risk",
"description": "We lend a customer more than the regulated DBR threshold",
"category": "credit_risk"
},
{
"riskId": "R8",
"riskType": "Reputation Risk",
"description": "We engage in coercive selling conduct / don't advise customers of the implications of taking credit",
"category": "reputation_risk"
},
{
"riskId": "R9",
"riskType": "Financial Crime",
"description": "We fail to meet our international tax and compliance regulations (e.g. FATCA etc)",
"category": "compliance_risk"
},
{
"riskId": "R10",
"riskType": "Financial Risk",
"description": "We fail to collect the requirements to enforce the terms and conditions of the loan agreement",
"category": "operational_risk"
},
{
"riskId": "R11",
"riskType": "Compliance Risk",
"description": "We fail to adhere to compliance / regulatory requirements",
"category": "compliance_risk"
},
{
"riskId": "R12",
"riskType": "Operational Risk",
"description": "The risk of loss resulting from inadequate or failed internal processes, people and systems or from external events",
"category": "operational_risk"
}
],
"processFlow": {
"stages": [
{
"stageId": "S1",
"stageName": "Customer details & product selection",
"description": "Initial customer application and product selection",
"steps": [
{
"stepId": "S1-1",
"stepName": "Client application",
"description": "The client applies for a new PI Loan",
"actor": "Customer",
"stepType": "Customer input",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S1-2"
},
{
"stepId": "S1-2",
"stepName": "ETB check",
"description": "If customer is ETB, go to Product Selection",
"actor": "System",
"stepType": "Decision",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S1-3",
"decisionBranches": [
{
"condition": "Yes - Existing Customer",
"nextStep": "S1-4"
},
{
"condition": "No - New Customer",
"nextStep": "S1-3"
}
]
},
{
"stepId": "S1-3",
"stepName": "Customer authentication & pre-qualification",
"description": "A: EID / UAEPASS + OTP | B: credit pre-qualification using AECB",
"actor": "System",
"stepType": "Customer / system interaction",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R4",
"R11"
],
"controls": [
{
"controlId": "C1-3-1",
"name": "OTP mobile authentication",
"type": "automated",
"description": "One-time password verification via mobile"
},
{
"controlId": "C1-3-2",
"name": "OCR EID scan (EFR)",
"type": "automated",
"description": "Optical character recognition for EID scanning"
},
{
"controlId": "C1-3-3",
"name": "Customer data & document retrieval (EFR)",
"type": "automated",
"description": "Automated document retrieval from EFR"
},
{
"controlId": "C1-3-4",
"name": "Attempt limitation",
"type": "automated",
"description": "Cap number of attempts from same EID vs devices"
}
],
"nextStep": "S1-4"
},
{
"stepId": "S1-4",
"stepName": "Targeted product offering",
"description": "System calculates and offers appropriate products",
"actor": "System",
"stepType": "System calculation",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S1-5"
},
{
"stepId": "S1-5",
"stepName": "Customer Product Selection",
"description": "Customer selects desired product",
"actor": "Customer",
"stepType": "Customer input",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S1-6"
},
{
"stepId": "S1-6",
"stepName": "Liveness check",
"description": "EFR Liveness verification",
"actor": "System",
"stepType": "Control",
"automationLevel": "A",
"manualEffort": 2,
"risksMitigated": [
"R4"
],
"controls": [
{
"controlId": "C1-6-1",
"name": "Liveness video selfie (EFR)",
"type": "automated",
"description": "Video selfie for liveness detection and identity confirmation"
}
],
"nextStep": "S1-7"
},
{
"stepId": "S1-7",
"stepName": "Customer data capture",
"description": "Salary a/c Nr & IBAN, AECB/UAEFTS consent, Date of joining, salary payment date, loan calculator",
"actor": "Customer",
"stepType": "Customer Input",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S1-8"
},
{
"stepId": "S1-8",
"stepName": "Regulatory affordability assessment check",
"description": "System performs regulatory and policy checks",
"actor": "System",
"stepType": "Control",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R8"
],
"controls": [
{
"controlId": "C1-8-1",
"name": "Income threshold check",
"type": "automated",
"description": "+7K salaried minimum check"
},
{
"controlId": "C1-8-2",
"name": "Minimum age check",
"type": "automated",
"description": "Age verification"
},
{
"controlId": "C1-8-3",
"name": "AECB Risk Score Threshold",
"type": "automated",
"description": "650+ score requirement"
},
{
"controlId": "C1-8-4",
"name": "Existing FAB application WIP check",
"type": "automated",
"description": "Check for duplicate applications"
},
{
"controlId": "C1-8-5",
"name": "Negative Checklist (Mubadara)",
"type": "automated",
"description": "Internal watchlist screening"
},
{
"controlId": "C1-8-6",
"name": "Fraud Watchlist check",
"type": "automated",
"description": "Name + company screening via OFS"
}
],
"nextStep": "S1-9"
},
{
"stepId": "S1-9",
"stepName": "ETB decision",
"description": "If the client is ETB go to Calculate Loan Offer",
"actor": "System",
"stepType": "Decision",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R1",
"R2",
"R3"
],
"controls": [],
"nextStep": "S2-1",
"decisionBranches": [
{
"condition": "ETB Customer",
"nextStep": "S4-1"
},
{
"condition": "NTB Customer",
"nextStep": "S2-1"
}
]
}
]
},
{
"stageId": "S2",
"stageName": "Customer screening & validation",
"description": "Comprehensive customer screening and validation",
"steps": [
{
"stepId": "S2-1",
"stepName": "FSK screening",
"description": "Screen client against full FSK lists and automatically dispose of false hits",
"actor": "System",
"stepType": "Control",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R4"
],
"controls": [
{
"controlId": "C2-1-1",
"name": "FSK + Silent8 screening",
"type": "automated",
"description": "Comprehensive sanctions and watchlist screening"
},
{
"controlId": "C2-1-2",
"name": "BBL verification",
"type": "automated",
"description": "Bank blacklist verification"
},
{
"controlId": "C2-1-3",
"name": "CRAM risk rating verification",
"type": "automated",
"description": "Customer risk assessment"
}
],
"nextStep": "S3-1"
}
]
},
{
"stageId": "S3",
"stageName": "Employer and salary validation",
"description": "Employer and salary verification processes",
"steps": [
{
"stepId": "S3-1",
"stepName": "Employer validation",
"description": "Employer validation as per agreed employer validation rules",
"actor": "System",
"stepType": "Control",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R6"
],
"controls": [
{
"controlId": "C3-1-1",
"name": "Employer category check",
"type": "automated",
"description": "EFR sponsor type or MOHRE & FAHR verification"
},
{
"controlId": "C3-1-2",
"name": "Customer employer details validation",
"type": "automated",
"description": "Employer name and sponsor details verification"
},
{
"controlId": "C3-1-3",
"name": "Employer unique identifiers check",
"type": "automated",
"description": "EFR UID & TL + MOHRE TL validation"
},
{
"controlId": "C3-1-4",
"name": "TML employer validation",
"type": "automated",
"description": "UID/TL matching against TML"
},
{
"controlId": "C3-1-5",
"name": "New employer verification",
"type": "partially_automated",
"description": "Adding to TML using NER employer info"
}
],
"nextStep": "S3-2"
},
{
"stepId": "S3-2",
"stepName": "Salary validation",
"description": "Salary validation as per agreed salary validation rules",
"actor": "System",
"stepType": "Control",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R5",
"R7",
"R11"
],
"controls": [
{
"controlId": "C3-2-1",
"name": "IBAN validation",
"type": "automated",
"description": "CB API – EID match + AECB API; last 4 digits verification"
},
{
"controlId": "C3-2-2",
"name": "Affordability assessment (CPR)",
"type": "automated",
"description": "Credit payment ratio calculation"
},
{
"controlId": "C3-2-3",
"name": "Salary source verification",
"type": "automated",
"description": "MOHRE labour contract salary / FAHR salary certificate + AEC validation"
},
{
"controlId": "C3-2-4",
"name": "Pensioner income verification",
"type": "automated",
"description": "Verify pensioner income source via AECB"
},
{
"controlId": "C3-2-5",
"name": "Employer-salary source matching",
"type": "automated",
"description": "Verify salary source with Employer name (EFR TL Vs MOHRE TL logic)"
},
{
"controlId": "C3-2-6",
"name": "Salary variance calculation",
"type": "automated",
"description": "Calculate variance threshold of salary from last 3 months"
}
],
"nextStep": "S4-1"
}
]
},
{
"stageId": "S4",
"stageName": "Credit underwriting",
"description": "Credit decisioning and loan offer calculation",
"steps": [
{
"stepId": "S4-1",
"stepName": "Credit decisioning",
"description": "Credit decisioning & Calculate Loan Offer to customer",
"actor": "System",
"stepType": "System calculation & decision",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R6",
"R7",
"R11"
],
"controls": [
{
"controlId": "C4-1-1",
"name": "Credit decision engine",
"type": "automated",
"description": "Automated credit scoring and decisioning"
}
],
"nextStep": "S5-1"
}
]
},
{
"stageId": "S5",
"stageName": "CASA account opening & insurance onboarding",
"description": "Account creation and insurance product selection",
"steps": [
{
"stepId": "S5-1",
"stepName": "Loan offer acceptance",
"description": "Customer accepts or declines loan offer",
"actor": "Customer",
"stepType": "Customer input",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S5-2"
},
{
"stepId": "S5-2",
"stepName": "Offer decision",
"description": "If customer accepts loan offer, go to Loan Details, if declined go to Loan Decline",
"actor": "System",
"stepType": "Decision",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S5-4",
"decisionBranches": [
{
"condition": "Accepted",
"nextStep": "S5-4"
},
{
"condition": "Declined",
"nextStep": "S5-3"
}
]
},
{
"stepId": "S5-3",
"stepName": "Loan decline processing",
"description": "Loan Decline confirmation (triggers customer comms and stored history)",
"actor": "System",
"stepType": "System",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "END"
},
{
"stepId": "S5-4",
"stepName": "Insurance options presentation",
"description": "Provide life insurance options (cheapest first)",
"actor": "System",
"stepType": "System",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S5-5"
},
{
"stepId": "S5-5",
"stepName": "Insurance product selection",
"description": "Customer selects insurance product",
"actor": "Customer",
"stepType": "Customer",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R12"
],
"controls": [
{
"controlId": "C5-5-1",
"name": "Mandatory life insurance",
"type": "automated",
"description": "Life insurance selection is mandatory for journey progression"
},
{
"controlId": "C5-5-2",
"name": "Insurance onboarding & registration",
"type": "automated",
"description": "Automated insurance registration and document processing"
},
{
"controlId": "C5-5-3",
"name": "Insurance-CIF linking",
"type": "automated",
"description": "Link insurance product to CIN/CIF"
}
],
"nextStep": "S5-6"
},
{
"stepId": "S5-6",
"stepName": "Fees acceptance",
"description": "Loan fees & charges acceptance",
"actor": "Customer",
"stepType": "Customer",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R8",
"R10",
"R11",
"R12"
],
"controls": [
{
"controlId": "C5-6-1",
"name": "Mandatory fees acceptance",
"type": "automated",
"description": "Fees and charges acceptance is mandatory for journey progression"
}
],
"nextStep": "S5-7"
},
{
"stepId": "S5-7",
"stepName": "CASA account check",
"description": "If ETB customer has CASA account, go to Select Account for loan repayments. If no CASA account, go to CASA Data Capture",
"actor": "System",
"stepType": "Decision",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S5-10",
"decisionBranches": [
{
"condition": "Has CASA Account",
"nextStep": "S5-10"
},
{
"condition": "No CASA Account",
"nextStep": "S5-8"
}
]
},
{
"stepId": "S5-8",
"stepName": "CASA data capture",
"description": "CASA Data Capture (debit card embossing details, preferred branch, cheque book selection)",
"actor": "System",
"stepType": "System",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S5-9"
},
{
"stepId": "S5-9",
"stepName": "CASA account creation",
"description": "Create CASA account (includes debit card production & cheque book instructions)",
"actor": "System",
"stepType": "System",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R9",
"R10",
"R12"
],
"controls": [
{
"controlId": "C5-9-1",
"name": "NTB CASA application capture",
"type": "automated",
"description": "New To Bank CASA application processing"
},
{
"controlId": "C5-9-2",
"name": "FATCA CRS declaration",
"type": "automated",
"description": "Tax status declaration and verification"
},
{
"controlId": "C5-9-3",
"name": "PEP self declaration",
"type": "automated",
"description": "Politically Exposed Person declaration"
},
{
"controlId": "C5-9-4",
"name": "Account & IBAN creation",
"type": "automated",
"description": "T24 account creation"
}
],
"nextStep": "S5-10"
},
{
"stepId": "S5-10",
"stepName": "Repayment account selection",
"description": "Select Account for loan repayments",
"actor": "System",
"stepType": "System",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [],
"controls": [],
"nextStep": "S6-1"
}
]
},
{
"stageId": "S6",
"stageName": "Loan conditions validation",
"description": "Final validation and documentation",
"steps": [
{
"stepId": "S6-1",
"stepName": "Terms and conditions sign-off",
"description": "Islamic Murabaha contract signing & acceptance, cooling off waiver/opt in, marketing consent",
"actor": "System",
"stepType": "Control",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R8",
"R10",
"R11",
"R12"
],
"controls": [
{
"controlId": "C6-1-1",
"name": "Signed Ts & Cs",
"type": "automated",
"description": "Digital contract signing and acceptance"
},
{
"controlId": "C6-1-2",
"name": "Account welcome letter",
"type": "automated",
"description": "Automated welcome communication"
},
{
"controlId": "C6-1-3",
"name": "Digital application form",
"type": "automated",
"description": "Complete digital application processing"
},
{
"controlId": "C6-1-4",
"name": "Account & PIL product linking",
"type": "automated",
"description": "Automated product-account linkage"
}
],
"nextStep": "S6-2"
},
{
"stepId": "S6-2",
"stepName": "Loan approval & disbursal",
"description": "Loan approval & disbursal with block (unique application reference, application docs and data stored on DMS, workflow case created in Appro, Islamic DDA automation)",
"actor": "System",
"stepType": "Control",
"automationLevel": "A",
"manualEffort": 0,
"risksMitigated": [
"R9",
"R12"
],
"controls": [
{
"controlId": "C6-2-1",
"name": "Disbursal block placement",
"type": "automated",
"description": "Block placed on disbursed loan (T24) for non-Unicorn customers"
}
],
"nextStep": "S6-3"
},
{
"stepId": "S6-3",
"stepName": "STL document upload",
"description": "STL doc uploaded by Customer",
"actor": "Customer",
"stepType": "Customer",
"automationLevel": "M",
"manualEffort": 1,
"risksMitigated": [],
"controls": [],
"nextStep": "S6-4"
},
{
"stepId": "S6-4",
"stepName": "STL letter validation",
"description": "STL letter validation",
"actor": "Group Operations",
"stepType": "Control",
"automationLevel": "M",
"manualEffort": 1,
"risksMitigated": [
"R5",
"R9"
],
"controls": [
{
"controlId": "C6-4-1",
"name": "Digital document upload",
"type": "manual",
"description": "Customer document upload and verification"
}
],
"nextStep": "S6-5"
},
{
"stepId": "S6-5",
"stepName": "Instalment cheque provision",
"description": "Instalment cheque provided by customer",
"actor": "Customer",
"stepType": "Customer",
"automationLevel": "M",
"manualEffort": 1,
"risksMitigated": [
"R10",
"R11",
"R12"
],
"controls": [],
"nextStep": "S6-6"
},
{
"stepId": "S6-6",
"stepName": "Signature validation",
"description": "Signature validation at point of cheque collection",
"actor": "Group Operations",
"stepType": "Control",
"automationLevel": "M",
"manualEffort": 1,
"risksMitigated": [
"R10",
"R11",
"R12"
],
"controls": [
{
"controlId": "C6-6-1",
"name": "Cheque signature validation",
"type": "manual",
"description": "Manual signature verification on collected cheques"
}
],
"nextStep": "S6-7"
},
{
"stepId": "S6-7",
"stepName": "Card and cheque delivery",
"description": "Debit card & cheque book delivery to customer (new CASA accounts only)",
"actor": "TTP",
"stepType": "System",
"automationLevel": "M",
"manualEffort": 1,
"risksMitigated": [],
"controls": [],
"nextStep": "S6-8"
},
{
"stepId": "S6-8",
"stepName": "Salary credit verification",
"description": "Salary credited in FAB account",
"actor": "Customer",
"stepType": "Control",
"automationLevel": "M",
"manualEffort": 1,
"risksMitigated": [
"R5",
"R12"
],
"controls": [
{
"controlId": "C6-8-1",
"name": "Salary validation",
"type": "manual",
"description": "Salary amount and source validation via T24"
}
],
"nextStep": "S7-1"
}
]
},
{
"stageId": "S7",
"stageName": "Loan disbursal / funds release",
"description": "Final funds release and security handling",
"steps": [
{
"stepId": "S7-1",
"stepName": "Funds release",
"description": "Loan funds released to in customer PIL account (block released)",
"actor": "Group Operations",
"stepType": "System",
"automationLevel": "M",
"manualEffort": 1,
"risksMitigated": [
"R12"
],
"controls": [
{
"controlId": "C7-1-1",
"name": "Maker checker process",
"type": "manual",
"description": "Dual control for funds release in T24"
}
],
"nextStep": "S7-2"
},
{
"stepId": "S7-2",
"stepName": "Security cheque filing",
"description": "Security cheque filing and storage",
"actor": "Group Operations",
"stepType": "Control",
"automationLevel": "M",
"manualEffort": 1,
"risksMitigated": [
"R9",
"R12"
],
"controls": [],
"nextStep": "S8-1"
}
]
},
{
"stageId": "S8",
"stageName": "PIL QA process",
"description": "Post-disbursal quality assurance",
"steps": [
{
"stepId": "S8-1",
"stepName": "Quality assurance sampling",
"description": "Sampled QA process on all disbursed PILs issued in the prior month",
"actor": "Group Credit",
"stepType": "Control",
"automationLevel": "M",
"manualEffort": 2,
"risksMitigated": [
"R12"
],
"controls": [
{
"controlId": "C8-1-1",
"name": "Credit QA process",
"type": "manual",
"description": "Comprehensive quality assurance following SOP & standards"
}
],
"nextStep": "END"
}
]
}
]
},
"metricsAndMeasures": [
{
"metricId": "M1",
"type": "Time to funds",
"description": "Average time taken from application started to funds disbursed",
"target": "15 minutes",
"unit": "minutes"
},
{
"metricId": "M2",
"type": "Time to approval",
"description": "Average time from application started to credit approved / declined status",
"target": "TBD",
"unit": "minutes"
},
{
"metricId": "M3",
"type": "Approval Rate",
"description": "% approved applications that are disbursed",
"target": "TBD",
"unit": "percentage"
},
{
"metricId": "M4",
"type": "Booking rate",
"description": "% Applications that are eligible for credit assessment and return an approved status",
"target": "TBD",
"unit": "percentage"
},
{
"metricId": "M5",
"type": "Drop off rate",
"description": "% of customers that drop out of the journey before disbursal",
"target": "Minimize",
"unit": "percentage"
},
{
"metricId": "M6",
"type": "TAT",
"description": "Time to complete for each key journey stage",
"target": "Stage-specific",
"unit": "minutes"
}
],
"qualityAssurance": [
{
"qaProcessId": "QA1",
"name": "Credit QA Process",
"description": "Assures the full PIL onboarding journey and the included sub-processes. Managed and delivered by the Credit QA team.",
"scope": "Full PIL journey and sub-processes",
"responsibleTeam": "Credit QA team"
},
{
"qaProcessId": "QA2",
"name": "CASA KYC QA Process",
"description": "Assures the CASA onboarding journey in line with EDD/CDD requirements. Managed and delivered by the KYC team.",
"scope": "CASA onboarding journey",
"responsibleTeam": "KYC team"
}
],
"policiesAndStandards": [
{
"policyId": "POL1",
"name": "KYC Policy",
"description": "Know Your Customer policies and procedures"
},
{
"policyId": "POL2",
"name": "Credit Policy",
"description": "Credit risk management and lending policies"
},
{
"policyId": "POL3",
"name": "PIL 1_Customer Employer Validation",
"description": "Customer employer validation standards"
},
{
"policyId": "POL4",
"name": "PIL 2_Customer Validation",
"description": "Customer validation and screening standards"
},
{
"policyId": "POL5",
"name": "PIL 3_Salary Validation",
"description": "Salary verification and validation procedures"
},
{
"policyId": "POL6",
"name": "PIL 4_Loan Maintenance",
"description": "Loan maintenance and servicing standards"
},
{
"policyId": "POL7",
"name": "PIL 5_CB Loan Disbursement",
"description": "Loan disbursement procedures"
},
{
"policyId": "POL8",
"name": "PIL 6_Loan Conditions Validation",
"description": "Loan conditions validation standards"
},
{
"policyId": "POL9",
"name": "PIL 7_PL Application Form",
"description": "Personal loan application form standards"
},
{
"policyId": "POL10",
"name": "PIL 8_Risk Appetite Policy",
"description": "Risk appetite framework for PIL"
},
{
"policyId": "POL11",
"name": "PIL 9_Master T&C Loans",
"description": "Master terms and conditions for loans"
},
{
"policyId": "POL12",
"name": "Responsible lending",
"description": "Responsible lending practices and standards"
}
],
"metadata": {
"lastUpdated": "2025-10-14",
"version": "1.0",
"owner": "FAB Process Excellence Team",
"status": "Active"
}
};

export const INITIAL_PROMPTS = [
    "Create a Personal Loan Onboarding SOP",
    "Generate a Credit Card Application Flow",
    "Show me a standard KYC update process"
];