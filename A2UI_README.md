
# 🧠 GERNAS A2UI (Adaptive AI User Interface) Specification

**A2UI** is the frontend design pattern used in GERNAS. Instead of rendering simple text, the Chat Interface listens to the incoming text stream, detects specific Markdown patterns using Regex, and "hydrates" them into rich, interactive React components (Widgets) in real-time.

To utilize these widgets, the Backend (LLM System Prompt) must output text following the strict formatting contracts below.

---

## 🎨 Widget Library & Contracts

### 1. 📊 Bar Chart Widget
**Use Case:** Comparing volumes, risk counts, distributions, or financial data.
*   **Visual:** A horizontal bar chart with labels and values.
*   **Behavior:** Appears when a list is detected where items follow `Label: Number`.

**Backend Output Requirement:**
A standard bulleted list. Each item **must** contain a colon `:` followed by a number.
```markdown
### Risk Distribution
- High Risk: 15
- Medium Risk: 45
- Low Risk: 120
```

### 2. ⏲️ Gauge / Score Widget
**Use Case:** Displaying confidence scores, match probabilities, or credit scores.
*   **Visual:** A circular progress ring (Green > 80%, Amber > 40%, Red < 40%).
*   **Behavior:** Triggers on specific keywords like "Score", "Confidence", "Probability".

**Backend Output Requirement:**
A line starting with the keyword in bold.
```markdown
**Score**: 85%
**Confidence**: 0.92
**Probability**: High (0.8)
**Match**: 95/100
```

### 3. ✅ Checklist Widget
**Use Case:** Requirements gathering, document checks, or pre-flight checks.
*   **Visual:** A card containing items. Checked items are struck through and green.
*   **Behavior:** Triggers on standard Markdown checklist syntax.

**Backend Output Requirement:**
```markdown
**Required Documents:**
- [x] Emirates ID (Validated)
- [x] Salary Certificate
- [ ] 3 Months Bank Statement
```

### 4. 🗺️ Step Widget (Navigation)
**Use Case:** Deep-linking the Chat to the Process Canvas.
*   **Visual:** A clickable card showing the Step ID (e.g., `S1-1`), Actor, and Description.
*   **Interactivity:** Clicking "LOCATE" pans the ReactFlow canvas to that specific node.

**Backend Output Requirement:**
The Line must start with the Step ID format `S[Stage]-[Step]`.
```markdown
The process starts here:
- **S1-1**: Customer applies for a PI Loan
- **S1-2**: System checks for existing account
```

### 5. 🛑 Risk Widget
**Use Case:** Highlighting operational, financial, or compliance risks inline.
*   **Visual:** A rose/red-colored alert card with a warning octagon icon.

**Backend Output Requirement:**
Reference the Risk ID (e.g., `R[Number]`).
```markdown
- **R4**: Identity theft possibility (Operational)
- **R12**: Funds disbursement error
```

### 6. 🛡️ Policy & Alert Widget
**Use Case:** Compliance warnings, mandatory policy checks, or critical notes.
*   **Visual:** 
    *   `POLICY`: Blue Shield.
    *   `WARNING` / `CRITICAL`: Red Triangle.
    *   `NOTE`: Gray Info Icon.

**Backend Output Requirement:**
Specific keywords in bold at the start of a bullet or line.
```markdown
- **POLICY**: User must verify biometric data via EFR.
- **WARNING**: Do not proceed if KYC is expired > 30 days.
- **NOTE**: This step is optional for VIP clients.
```

### 7. 📅 Timeline / Log Widget
**Use Case:** Displaying audit trails, history logs, or sequence of events.
*   **Visual:** A vertical connected timeline. Time on the left, event on the right.

**Backend Output Requirement:**
Time format in bold at the start of the line.
```markdown
**10:00 AM**: Application Received
**10:05 AM**: KYC Verified
**10:15 AM**: Approval Granted
```

### 8. 🔢 Metric Widget (KPI Dashboard)
**Use Case:** Comparing Targets vs. Actuals.
*   **Visual:** A horizontal scrolling container of cards.
*   **Behavior:** Triggers when a Markdown Table contains headers like "Metric", "Target", "Actual", "Value".

**Backend Output Requirement:**
A standard Markdown Table.
```markdown
| Metric | Target | Actual |
|--------|--------|--------|
| SLA    | 15m    | 12m    |
| NPS    | >50    | 65     |
```

### 9. 👤 Role Widget
**Use Case:** Defining responsibilities or actors.
*   **Visual:** A card with a User Avatar icon, Role Title, and Description.
*   **Behavior:** Triggers when a line starts with a Role Name (Manager, Officer, Admin, Customer, etc.).

**Backend Output Requirement:**
```markdown
**Credit Officer**: Reviews the application for policy adherence.
**System Admin**: Manages user access rights.
```

### 10. 🔀 Decision Option Widget
**Use Case:** Presenting A/B choices or decision paths.
*   **Visual:** A vertical list of clickable options (A, B, C).
*   **Behavior:** Triggers when list items start with "Option".

**Backend Output Requirement:**
```markdown
- **Option A**: Proceed with standard approval
- **Option B**: Refer to Credit Committee
```

---

## 🤖 Recommended System Prompt

To ensure the AI generates the correct format, append this to your System Instruction:

> **UI Rendering Rules (Strict):**
> 1.  **Process Steps:** Always use the format `- **StepID**: Description` (e.g., `- **S1-1**: Description`) so they become clickable links.
> 2.  **Risks:** Use `- **RiskID**: Description` (e.g., `- **R4**: Fraud`).
> 3.  **Metrics:** Always present KPIs in a Markdown Table.
> 4.  **Charts:** For data comparison, use a list format: `- Label: Value`.
> 5.  **Alerts:** Use `- **POLICY**: ...` or `- **WARNING**: ...` for critical info.
> 6.  **Timeline:** Use `- **HH:MM**: Event` for logs.
> 7.  **Roles:** Use `- **Role Name**: Description`.
>
> **Do not output JSON.** Use natural language formatted with these Markdown rules.
