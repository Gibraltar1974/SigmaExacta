
# Sigma Exacta Suite - Open Source Engineering Tools

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/License-AGPL%20v3-red)
![Privacy](https://img.shields.io/badge/Privacy-Local%20First-green)
![PWA](https://img.shields.io/badge/PWA-✓-purple)

**Sigma Exacta** is a comprehensive suite of free, open-source engineering tools designed for product development, quality control, innovation, and strategic management. 

Developed by industrial engineers, this platform operates on a **privacy-first, client-side architecture**. All calculations run directly in your browser using Vanilla JavaScript—no data is ever sent to a server, ensuring your sensitive industrial data remains secure on your device.

Now available as a **Progressive Web App (PWA)** – install it on your device and use it like a native app, with full offline functionality.

## 🚀 Key Features

* **Privacy Focused:** No server-side storage or processing. All data remains in the user's browser.
* **No Installation Required:** Runs entirely in modern web browsers using standard web technologies.
* **PWA Support:** Install as a standalone app on desktop or mobile for an app-like experience with offline access.
* **Professional Export:** Most tools support exporting reports and data to Excel (XLSX), PDF, or Images (JPG/PNG).
* **Responsive Design:** Optimized for desktop, tablet, and mobile devices.
* **Automation Ready:** Supports deep-linking and data injection via URL parameters for integration with other systems.

## 🛠️ Tool Suite

The suite includes 20 specialized tools covering the entire product development lifecycle:

### Quality & Process Control
| Tool | Description | Key Features |
|------|-------------|--------------|
| **[Control Plan Creator](./control-plan.html)** | APQP-compliant control plan management. | Interactive tables, standard dropdowns, Excel export. |
| **[Process Capability (Cpk)](./cpk_calculator.html)** | Statistical analysis of process capability. | Cp, Cpk, Pp, Ppk, Normality tests, Control charts. |
| **[Weibull Analysis](./weibull.html)** | Reliability engineering and failure prediction. | Probability plotting, MTTF calculation, Gamma function. |
| **[PDCA Cycle](./pdca.html)** | Continuous improvement management. | Interactive Deming wheel, 4-phase tracking. |
| **[8D Problem Solving](./8d.html)** | Structured root cause analysis and reporting. | Complete 8-discipline form, D0-D7 tabs, Report generation. |
| **[Ishikawa Diagram](./ishikawa.html)** | Fishbone diagram generator. | Interactive SVG, 6M categories, drag-and-drop. |
| **[APQP/PPAP Planner](./apqp-ppap.html)** | Product launch planning. | Gantt charts, Phase tracking, PPAP checklist. |

### Design & Innovation
| Tool | Description | Key Features |
|------|-------------|--------------|
| **[Taguchi DOE](./taguchi_doe.html)** | Design of Experiments (Robust Design). | Orthogonal arrays (L4-L16), S/N Ratios, ANOVA, Pareto charts. |
| **[FMEA](./fmea.html)** | Failure Modes and Effects Analysis. | DFMEA/PFMEA, RPN Auto-calc, Structure network diagrams. |
| **[QFD (House of Quality)](./qfd.html)** | Customer requirement translation. | Relationship matrix, Correlation roof, Priority ranking. |
| **[TRIZ](./triz.html)** | Inventive problem solving. | Contradiction Matrix (Classic/2003), 40 Principles, Su-Field. |
| **[Tolerance Stack-Up](./stack_up_analysis.html)** | Dimensional analysis. | Worst-case, RSS (Probabilistic), & Monte Carlo simulation. |
| **[VAVE](./vave.html)** | Value Analysis / Value Engineering. | Function-Cost analysis, Value Index, Network visualization. |
| **[Design Thinking](./design_thinking.html)** | Human-centered innovation. | 5-Stage process (Empathize, Define, Ideate, Prototype, Test). |
| **[Pugh Matrix](./pugh.html)** | Decision-matrix method. | Weighted concept selection, Baseline comparison. |
| **[Kano Model](./kano.html)** | Customer satisfaction analysis. | Interactive chart, Satisfaction Coefficient calculation. |

### Strategy & Management
| Tool | Description | Key Features |
|------|-------------|--------------|
| **[Balanced Scorecard](./balancedcard.html)** | Strategic performance management. | 4 Perspectives, KPI tracking, Progress visualization. |
| **[SWOT Analysis](./swot.html)** | Strategic planning matrix. | Interactive 4-quadrant grid, Export to Excel. |
| **[Eisenhower Matrix](./eisenhower.html)** | Task prioritization. | Urgent vs Important quadrants, Task management. |
| **[Maturity Assessment](./efqm.html)** | Organizational excellence (EFQM/Baldrige). | Radar charts, Weighted scoring, Strength/Weakness analysis. |

## 💻 Tech Stack

This project is built to be lightweight, fast, and easy to maintain:

* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **PWA:** Service Worker, Web App Manifest for offline functionality and app installation.
* **Data Handling:** `SheetJS` (xlsx.full.min.js) for Excel exports.
* **Visualization:** 
  * `Chart.js` for statistical graphs.
  * `vis.js` for network diagrams (FMEA, VAVE).
  * `Mermaid.js` for functional diagrams (TRIZ).
  * `html2canvas` for image exports.
* **Math:** `KaTeX` for formula rendering.

## 📥 Installation & Usage

### Online
You can use the full suite immediately at **[SigmaExacta.com](http://SigmaExacta.com)**.

### Install as a PWA (Progressive Web App)
1. Visit **[SigmaExacta.com](http://SigmaExacta.com)** in a modern browser (Chrome, Edge, Safari, etc.).
2. Click the **Install** button in the address bar or via the browser menu.
3. Follow the prompts to add Sigma Exacta to your home screen or desktop.
4. Launch the app anytime—works fully offline after initial load.

### Local Usage (Offline)
Because the architecture is client-side only, you can run these tools offline:

1. Clone the repository:
    ```bash
    git clone https://github.com/Gibraltar1974/SigmaExacta.git
    ```
2. Navigate to the folder:
    ```bash
    cd SigmaExacta
    ```
3. Open `index.html` (or any specific tool file) directly in your web browser. No local server, Node.js, or build process is required.

## 🔗 URL Parameter Automation

All tools support the **Universal Query Handler**. This allows you to pre-fill data and trigger calculations via URL, enabling integration with external dashboards or sharing specific scenarios.

**General logic:**
* Parameter names generally map to field IDs (lowercase, underscores replace hyphens).
* `auto_calculate=1` triggers the main calculation function automatically.

**Example (Process Capability):**
https://sigmaexacta.com/cpk_calculator.html?data=10.2,10.5,9.8,10.1&lsl=9.0&usl=11.0&target=10.0&auto_calculate=1

text

**Example (Taguchi DOE):**
https://sigmaexacta.com/taguchi_doe.html?experiment-name=TestRun&factors=Temp|Press&levels=Low,High|10psi,20psi&array=L4&auto_calculate=1

text

## 📄 License
This project is licensed under the GNU Affero General Public License v3 (AGPL v3).

You are free to use, modify, and distribute this software.

If you deploy a modified version over a network (e.g., a website), you must provide the source code to users.

## 👥 Author & Acknowledgments
**Creator:** Javier Casal Gómez (Industrial Engineer)

**Contributors:**
* Wahyudin Syam (Stack-up Analysis)
* Robert Adunka (TRIZ Methodology)

**Disclaimer:** These tools are provided for educational and professional support purposes. While based on standard industrial methodologies (AIAG, VDA, ISO), the user assumes responsibility for final engineering decisions.