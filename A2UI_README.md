
# 🧠 GERNAS A2UI (Adaptive AI User Interface) Specification

**A2UI** is the frontend design pattern used in GERNAS. Instead of rendering simple text, the Chat Interface listens to the incoming text stream, detects specific Markdown patterns using Regex, and "hydrates" them into rich, interactive React components (Widgets) in real-time.

---

## 🎨 Widget Library & Contracts (24 Widgets)

### 1. 📦 Product Details
**Use Case:** Showing product ID and status.
*   **Visual:** Card with icon and status pill.
*   **Trigger:** `**Product**: Name | ID | Status`.
```markdown
**Product**: Personal Loan | PL-101 | Active
```

### 2. ❓ Knowledge Base FAQ
**Use Case:** Q&A pairs from KB.
*   **Visual:** Accordion.
*   **Trigger:** `**Q**: Question`.
```markdown
**Q**: What is the tenure?
**A**: 48 Months
```

### 3. ❝ Knowledge Snippets
**Use Case:** Direct quotes from policy documents.
*   **Visual:** Blockquote.
*   **Trigger:** `> Text`.
```markdown
> "Strictly prohibited."
```

### 4. 🏷️ Topic Tags
**Use Case:** Keywords.
*   **Visual:** Pill list.
*   **Trigger:** `**Tags**: T1, T2`.
```markdown
**Tags**: Lending, Risk
```

### 5. 📉 Trends & Analysis
**Use Case:** Showing historical data points.
*   **Visual:** A sparkline chart.
*   **Trigger:** List items with date keys (e.g., `Jan: 100`).
```markdown
- Jan: 100
- Feb: 200
```

### 6. 👣 Process Status
**Use Case:** Tracking phase completion.
*   **Visual:** Horizontal stepper with checkmarks.
*   **Trigger:** List items containing "Step" and status keywords (Done, Active).
```markdown
- Step 1: Done
- Step 2: Active
```

### 7. 📎 File Attachment
**Use Case:** Displaying downloadable files.
*   **Visual:** File card icon.
*   **Trigger:** `[File] Filename`.
```markdown
[File] Report.pdf
```

### 8. 📇 Contact Card
**Use Case:** Personnel details.
*   **Visual:** User profile card.
*   **Trigger:** `**Owner**: Name | Role`.
```markdown
**Owner**: John Doe | Manager
```

### 9. ⏳ SLA Timer
**Use Case:** Deadlines.
*   **Visual:** Pulsing timer badge.
*   **Trigger:** `**SLA**: Time`.
```markdown
**SLA**: 2 Hours
```

### 10. 📍 Locations
**Use Case:** Map points.
*   **Visual:** Pin icon with text.
*   **Trigger:** `**Location**: Place`.
```markdown
**Location**: Dubai
```

### 11. ⭐ Ratings
**Use Case:** Scores.
*   **Visual:** Star icons.
*   **Trigger:** `**Rating**: 4/5`.
```markdown
**Rating**: 4/5
```

### 12. 📊 Comparisons
**Use Case:** Side-by-side options.
*   **Trigger:** Markdown table or structured list.

### 13. 🥧 Pie Charts
**Use Case:** Percentage distribution.
*   **Trigger:** List where values are %.

### 14. 📊 Bar Charts
**Use Case:** Data comparison.
*   **Trigger:** List `Label: Value`.

### 15. ⏲️ Gauges
**Use Case:** Confidence scores.
*   **Trigger:** `**Score**: 90%`.

### 16. ✅ Checklists
**Use Case:** Tasks.
*   **Trigger:** `[x] Item`.

### 17. 🗺️ Navigation Steps
**Use Case:** Deep linking.
*   **Trigger:** `**S1-1**: Desc`.

### 18. 🛑 Risks
**Use Case:** Alerts.
*   **Trigger:** `**R1**: Desc`.

### 19. 🛡️ Policies
**Use Case:** Compliance.
*   **Trigger:** `**POLICY**: Text`.

### 20. 📅 Timelines
**Use Case:** History.
*   **Trigger:** `**10:00**: Event`.

### 21. 🔢 Metric Tables
**Use Case:** KPIs.
*   **Trigger:** Markdown Table with 'Metric' header.

### 22. 👤 Roles
**Use Case:** Actors.
*   **Trigger:** `**Admin**: Desc`.

### 23. 🔀 Decision Options
**Use Case:** Choices.
*   **Trigger:** `**Option A**: Desc`.

### 24. 🏷️ Key-Value Data
**Use Case:** Properties.
*   **Trigger:** `Key: Value`.

### 25. 💻 JSON Viewer
**Use Case:** Raw Data.
*   **Trigger:** Code block or `{`.

---

## 🤖 System Prompt Recommendation

Ensure the AI generates natural language lists or markdown tables matching these triggers to activate the A2UI engine.
