# Sigma Exacta — Open Source Engineering Tools

[![Version](https://img.shields.io/badge/version-2.0-blue)](https://sigmaexacta.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-red)](https://www.gnu.org/licenses/agpl-3.0.html)
[![Privacy](https://img.shields.io/badge/Privacy-Local%20First-green)](https://sigmaexacta.com/about)
[![PWA](https://img.shields.io/badge/PWA-%E2%9C%93-purple)](https://sigmaexacta.com)

**Sigma Exacta** is a comprehensive suite of free, open-source engineering tools covering the full product development lifecycle — from process capability and FMEA to TRIZ, Design Thinking, and strategic management.

Built by industrial engineers for industrial engineers. The platform runs entirely in your browser with a **privacy-first, client-side architecture**: no data is ever sent to a server, no account is required, and your sensitive industrial data never leaves your device. Available as a **Progressive Web App (PWA)** for full offline functionality.

🌐 **Live at [sigmaexacta.com](https://sigmaexacta.com)**

---

## Table of Contents

- [Key Features](#key-features)
- [Tool Suite](#tool-suite)
  - [Quality & Process Control](#quality--process-control)
  - [Design & Innovation](#design--innovation)
  - [Strategy & Management](#strategy--management)
- [Common Workflow: Save, Load, Revise, Export](#common-workflow-save-load-revise-export)
- [Tech Stack](#tech-stack)
- [Installation & Usage](#installation--usage)
- [URL Parameter Automation](#url-parameter-automation)
- [License](#license)
- [Authors & Acknowledgments](#authors--acknowledgments)
- [Disclaimer](#disclaimer)

---

## Key Features

| Feature | Detail |
|---|---|
| **Privacy-First** | 100% client-side. No server processing, no telemetry, no accounts. All data stays in your browser. |
| **No Installation** | Runs in any modern browser (Chrome, Edge, Firefox, Safari). No Node.js, no build step. |
| **PWA Support** | Install as a standalone desktop or mobile app. Full offline access after the first load. |
| **Unified Revision System** | Every tool supports `New → Load → Revise → Save (.json) → Export PDF` — a traceable, AIAG/IATF 16949-aligned document lifecycle. |
| **Professional Exports** | PDF reports, Excel (.xlsx) spreadsheets, and JPG/PNG diagram images across the suite. |
| **Load Example** | Every tool ships with a realistic pre-filled case study for instant exploration. |
| **Responsive Design** | Optimised for desktop, tablet, and mobile. |
| **URL Automation** | Deep-link support: pre-fill data and trigger calculations via URL parameters for integration with external dashboards. |

---

## Tool Suite

### Quality & Process Control

#### Process Capability (Cpk) Calculator
Statistical analysis of process performance against engineering specifications.
- Calculates **Cp, Cpk, Pp, Ppk** with full interpretation guidance.
- **Normality test** (Shapiro-Wilk / Anderson-Darling) to validate the statistical model.
- **Control charts** (X-bar, R-chart) for visual SPC monitoring.
- **Histogram** with fitted normal distribution overlay.
- Batch data import and URL parameter support for automation.

#### Control Plan Creator
AIAG-compliant control plan management for production and pre-launch phases.
- Structured table covering Part/Process characteristics, control methods, reaction plans, and sample sizes.
- Standard dropdowns aligned with AIAG APQP references.
- Excel (.xlsx) export for submission packages.

#### Weibull Analysis
Reliability engineering and failure time prediction.
- Supports **2-parameter and 3-parameter Weibull** distribution fitting.
- Probability plotting with **MTTF (Mean Time to Failure)** and B10/B50 life calculation.
- Gamma function computation and confidence interval bands.
- Export to PDF and Excel.

#### PDCA Cycle (Deming Wheel)
Continuous improvement management across four structured phases.
- Interactive Deming wheel diagram with phase-by-phase guided fields.
- Plan → Do → Check → Act tracking with notes and action ownership.
- Export to PDF.

#### 8D Problem Solving (D0–D8)
Fully structured digital 8D report aligned with AIAG and IATF 16949.
- All **nine disciplines (D0–D8)** on separate sub-tabs:
  - **D0** — Plan & Prepare: Report ID, urgency level, ERA date, initial evidence.
  - **D1** — Team: Leader, Champion/Sponsor, members.
  - **D2** — Problem Description: IS / IS NOT matrix (5 dimensions: What, Where, When, Who, How Many).
  - **D3** — Containment Actions: responsible person, deadline, verification method.
  - **D4** — Root Cause: 5 Whys, Ishikawa inputs, technical and escape root cause.
  - **D5** — Permanent Corrective Actions (PCA): owner and deadline per action.
  - **D6** — PCA Implementation & Validation: Cpk evidence, containment removal confirmation.
  - **D7** — Prevent Recurrence: WI updated, training completed, error-proofing, horizontal deployment, PFMEA and Control Plan updated.
  - **D8** — Team Recognition: acknowledgement, lessons learned, knowledge sharing plan, champion sign-off.
- Save/Load JSON, traceable revision history, Export PDF.

#### Ishikawa (Fishbone) Diagram
Professional cause-and-effect diagram generator.
- Six **6M category sub-tabs** (Manpower, Methods, Machines, Materials, Measurement, Mother Nature).
- **Two-level sub-causes** per category for deep root-cause decomposition.
- Auto-rendered professional fishbone diagram via **JointJS**.
- Export as **JPG image** and **Excel (.xlsx)** structured cause list.
- AIAG/IATF 16949-aligned revision lifecycle.

#### APQP / PPAP Project Planner
Full product launch planning tool compliant with AIAG APQP 2nd Edition and PPAP 4th Edition.
- **Five APQP phase sub-tabs** (Plan & Define → Product Design → Process Design → Product & Process Validation → Feedback & Corrective Action) with per-task owner, dates, and status.
- Automatic **Gantt Chart** rendered from task dates, colour-coded by completion status.
- Consolidated **Action Plan** register aggregating all open tasks across phases and PPAP checklist.
- **18-element PPAP Checklist** with Ppk/Cpk and %GRR data fields; AIAG sequence validation prevents PSW approval until all applicable elements are closed.
- **Part Submission Warrant (PSW)** with submission level control (Levels 1–5) and approval lock.
- **Verify AIAG** button: automated compliance check flagging missing or out-of-sequence elements.
- Save/Load JSON, traceable revision history, Export PDF (including Gantt).

---

### Design & Innovation

#### Taguchi Design of Experiments (DOE)
Robust design methodology for optimising process parameters.
- Orthogonal arrays **L4, L8, L9, L12, L16, L18, L27**.
- **Signal-to-Noise (S/N) Ratio** analysis: Smaller-is-Better, Larger-is-Better, Nominal-is-Best.
- **ANOVA** (Analysis of Variance) for factor significance ranking.
- **Pareto chart** of factor contributions.
- Excel export of full DOE results.

#### FMEA (Failure Mode and Effects Analysis)
AIAG-VDA 2019 aligned DFMEA and PFMEA.
- **Action Priority (AP)** system (High / Medium / Low) replacing the legacy RPN threshold approach.
- Structure network diagrams (System → Subsystem → Component) via **vis.js**.
- Auto-calculated Severity, Occurrence, and Detection scores with AP assignment.
- Excel export and PDF report generation.

#### QFD — House of Quality
Translates customer requirements (Voice of the Customer) into engineering specifications.
- Interactive **relationship matrix** (What vs. How) with strength ratings.
- **Correlation roof** for identifying engineering trade-offs.
- Automatic **priority ranking** and importance weighting.
- Export to Excel.

#### TRIZ Inventive Problem Solving
Comprehensive TRIZ toolkit for systematic innovation.
- **8-step sequential workflow** on integrated sub-tabs:
  1. Problem Definition (system, primary useful function, main drawback).
  2. LDST Analysis — all 8 Laws of Development of Technical Systems with lifecycle-stage mapping and Principles Correlation Matrix.
  3. Ideal Final Result (IFR) formulation.
  4. 9 Windows (System Operator) — 3×3 time × system-level matrix.
  5. Function Analysis — components, contacts, and function classification (Useful/Harmful, Normal/Insufficient/Excessive).
  6. Technical Contradiction — **Classic Contradiction Matrix (39×39 parameters, Altshuller)** and **Matrix 2003 (48×48 parameters, Darell Mann)** — returns ranked **40 Inventive Principles** with descriptions and examples.
  7. Physical Contradiction — **6 Separation Strategies** (Space, Time, Relation, System Level, Satisfy Both, Bypass) with targeted principles and canonical examples.
  8. Su-Field Analysis — substance-field triads, 6 problem types, recommendations from the **76 Standard Solutions** (5 classes).
- Save/Load JSON (full state including Function Analysis and Su-Field systems), Export PDF (multi-page), Export Excel.

#### Tolerance Stack-Up Analysis
Dimensional analysis for mechanical assemblies.
- **Worst-Case**, **RSS (Root Sum of Squares / Probabilistic)**, and **Monte Carlo simulation** methods.
- Bilateral and unilateral tolerances, multiple contributor chains.
- Automatic gap/interference calculation with confidence levels.
- Export to PDF and Excel.

#### VAVE — Value Analysis / Value Engineering
Function-cost analysis for product cost reduction.
- **Function-Cost matrix**: maps components to functions and calculates value index per function.
- **Value Index** (VI) highlighting over-engineered and under-performing functions.
- Network visualisation via **vis.js**.
- Export to Excel.

#### Design Thinking Facilitator
Human-centered, iterative innovation process.
- **Three-tab structure** (Start & Info, Design Thinking Tool, Report) with **five phase sub-tabs**:
  - **Empathize** — User Research & Observations, User Personas, User Journey Map.
  - **Define** — Point-of-View (POV) Statement ("User needs X because Y"), Key Insights.
  - **Ideate** — "How Might We…" (HMW) questions, Ideas & Concepts.
  - **Prototype** — Prototype Type, Core Features, Assumptions to Test.
  - **Test** — Testing Plan, User Feedback, Success Metrics, Iterations & Next Steps.
- Auto-generated **Report tab** aggregating all five phases.
- Save/Load JSON, traceable revision history, Export PDF.

#### Pugh Matrix (Concept Selection)
Weighted decision-matrix for comparing design concepts against a baseline.
- Configurable evaluation criteria with importance weights.
- `+` / `0` / `–` scoring against a selected baseline concept.
- Automatic weighted total and concept ranking.
- Export to Excel.

#### Kano Model
Customer satisfaction feature classification and prioritisation.
- **Functional/Dysfunctional paired survey** data entry (5×5 matrix per feature).
- Automatic classification into **A** (Attractive), **O** (One-Dimensional), **M** (Must-Be), **I** (Indifferent), **R** (Reverse), **Q** (Questionable).
- Interactive **Kano Graph** (satisfaction vs. functionality axes) via Chart.js.
- **Customer Satisfaction Index**: CS+ (satisfaction coefficient) and CS− (dissatisfaction coefficient) per feature.
- Save/Load JSON, traceable revision history, Export PDF (including graph and CS index table).

---

### Strategy & Management

#### Eisenhower Matrix Task Prioritiser
Time management and task prioritisation using the Urgent × Important framework.
- Four quadrants with inline task entry, editing (pencil icon), and deletion (trash icon):
  - **Q1 – Do** (Urgent & Important): crises, immediate deadlines.
  - **Q2 – Decide / Schedule** (Not Urgent & Important): strategic planning, prevention — the long-term value quadrant.
  - **Q3 – Delegate** (Urgent & Not Important): reactive requests, interruptions.
  - **Q4 – Delete** (Not Urgent & Not Important): time wasters.
- Save/Load JSON, traceable revision history, Export PDF.

#### Balanced Scorecard (Strategy Scorecard)
Strategic performance management across four organisational perspectives.
- **Vision and Mission** statements anchoring the scorecard.
- **Four perspective sub-tabs** — Financial, Customer, Internal Process, Learning & Growth — each with: objective, KPI name, unit of measure, baseline, target, and strategic initiative.
- Auto-generated **Strategy Map** diagram showing the cause-and-effect chain (Learning → Process → Customer → Financial).
- Report tab with consolidated scorecard table for management review.
- Save/Load JSON, traceable revision history, Export PDF.

#### SWOT Analysis Matrix
Strategic planning with integrated TOWS cross-analysis.
- **Four-quadrant matrix** (Strengths, Weaknesses, Opportunities, Threats) with inline item entry and editing.
- Automatically generated **TOWS cross-analysis strategies**:
  - **SO – Maxi-Maxi** (Strengths × Opportunities): growth and attack strategies.
  - **ST – Maxi-Mini** (Strengths × Threats): defensive differentiation.
  - **WO – Mini-Maxi** (Weaknesses × Opportunities): turnaround and investment strategies.
  - **WT – Mini-Mini** (Weaknesses × Threats): survival and contingency strategies.
- Each strategy card pairs the specific items that generated it — no generic output.
- Save/Load JSON, traceable revision history, Export PDF.

#### Organisational Maturity Assessment (EFQM-inspired)
Holistic business excellence self-assessment with radar chart.
- **Seven scored criteria** evaluated via 0–100% sliders, each expanded in an accordion:
  1. Leadership (direction, strategy communication, culture of excellence).
  2. People (talent development, inclusive culture, employee well-being).
  3. Stakeholder Partnerships (needs anticipation, relationship value, feedback loops).
  4. Processes (process design, quality & efficiency, risk and opportunity management).
  5. Innovation & Transformation (innovation management, digital leverage, agility).
  6. Stakeholder Perception Results (customer satisfaction, employee engagement, societal perception).
  7. Strategic & Business Results (strategic goal achievement, operational targets, financial health).
- Live **Results dashboard**: score summary cards, overall **Maturity Level** band (Initial → Managed → Defined → Measured → Optimising), **seven-axis Radar Chart** (Chart.js), and detailed sub-criterion breakdown table.
- Save/Load JSON, traceable revision history, Export PDF.

---

## Common Workflow: Save, Load, Revise, Export

All tools share a **unified document lifecycle**, designed for traceability in regulated environments (AIAG, IATF 16949, ISO 9001):

| Action | Description |
|---|---|
| **New** | Clears all data and starts a blank project. |
| **Load** | Opens a `.json` file and restores the full project state in **read-only mode**. |
| **Load Example** | Pre-fills the tool with a realistic case study for immediate exploration. Also read-only. |
| **Revise** | Registers a revision (date, description, author) and **unlocks all fields** for editing. Revision records are embedded in the JSON and appear in all exported PDFs. |
| **Save** | Downloads the complete project as a `.json` file including data and revision history. |
| **Export PDF** | Generates a print-ready, multi-section PDF report. |
| **Export Excel** | Exports structured data as `.xlsx` (available on most tools). |

---

## Tech Stack

Lightweight, zero-dependency core — no framework, no build pipeline required.

| Layer | Libraries / Standards |
|---|---|
| **Core** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **PWA** | Service Worker, Web App Manifest |
| **Diagrams** | [JointJS](https://www.jointjs.com/) (Ishikawa), [vis.js](https://visjs.org/) (FMEA, VAVE structure networks), [Mermaid.js](https://mermaid.js.org/) (TRIZ functional diagrams) |
| **Charts** | [Chart.js](https://www.chartjs.org/) (Kano graph, Maturity radar, Weibull, control charts) |
| **PDF Export** | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) |
| **Excel Export** | [SheetJS (xlsx)](https://sheetjs.com/) |
| **Math Rendering** | [KaTeX](https://katex.org/) |
| **Image Export** | html2canvas (JPG/PNG diagram export) |

---

## Installation & Usage

### Use Online (Recommended)

The full suite is available immediately at **[sigmaexacta.com](https://sigmaexacta.com)** — no account, no installation.

### Install as a PWA

1. Visit [sigmaexacta.com](https://sigmaexacta.com) in a modern browser (Chrome, Edge, Safari, Firefox).
2. Click the **Install** button in the address bar or via the browser menu (⋮ → Install Sigma Exacta).
3. Follow the prompts to add it to your desktop or home screen.
4. Launch it like a native app — **fully offline** after the initial load.

The PWA retains all privacy and local-first advantages: no data leaves your device even when running as an installed app.

### Run Locally (Offline / Air-Gapped)

Because the architecture is purely client-side, any tool can be run from a local file — no server or build process required:

```bash
git clone https://github.com/Gibraltar1974/SigmaExacta.git
cd SigmaExacta
```

Open `index.html` (or any individual tool file such as `triz.html`, `fmea.html`, `8d.html`) directly in your browser. That's it.

---

## URL Parameter Automation

All tools support the **Universal Query Handler**, allowing you to pre-fill field values and trigger calculations automatically via URL. This enables integration with external dashboards, MES systems, or shared bookmarks for specific scenarios.

**General conventions:**
- Parameter names map to HTML field IDs (lowercase, underscores replace hyphens).
- `auto_calculate=1` triggers the primary calculation function on page load.

**Example — Process Capability:**
```
https://sigmaexacta.com/cpk_calculator.html?data=10.2,10.5,9.8,10.1&lsl=9.0&usl=11.0&target=10.0&auto_calculate=1
```

**Example — Taguchi DOE:**
```
https://sigmaexacta.com/taguchi_doe.html?experiment-name=TestRun&factors=Temp|Press&levels=Low,High|10psi,20psi&array=L4&auto_calculate=1
```

---

## License

This project is licensed under the **GNU Affero General Public License v3 (AGPL v3)**.

- You are free to **use, modify, and distribute** this software.
- If you deploy a **modified version over a network** (e.g., a public website), you must make the modified source code available to users under the same licence.

Full licence text: [https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html)

Copyright © 2025 Javier Casal Gómez.

---

## Authors & Acknowledgments

**Creator**

**Javier Casal Gómez** — Industrial Engineer (Spain) with over 20 years of experience in product development and manufacturing engineering. Holds a Master in Numerical Simulation (UNED) and an MBA in Automotive Management. Creator and lead developer of the Sigma Exacta platform.

**Contributors**

**Wahyudin Syam** (Indonesia) — PhD in geometrical metrology and manufacturing metrology. Contributing to **Stack-Up Analysis** development.

**Robert Adunka** (Germany) — PhD in design technology, TRIZ Master, author and academic. Member of [TRIZ Consulting Group GmbH](https://www.triz-consulting.de). Contributing to **TRIZ** tool development.

---

## Disclaimer

The tools and information provided on Sigma Exacta are for informational and educational purposes only. This software implements established industrial methodologies including, but not limited to, APQP, PPAP, FMEA (AIAG-VDA), TRIZ, Taguchi DOE, QFD, Balanced Scorecard, EFQM, and others. The intellectual property rights to these methodologies belong to their respective creators and standardisation bodies (AIAG, IATF, EFQM Foundation, etc.). This project is an independent software implementation and is not affiliated with, endorsed by, or sponsored by any of these organisations.

The authors and contributors assume no responsibility or liability for any decisions, actions, or outcomes resulting from the use of this software. Users are solely responsible for verifying calculations, validating results, and making their own professional engineering judgements.
