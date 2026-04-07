# 🌿 Green Cloud Optimization

> **A real-time CI/CD pipeline energy monitoring and carbon optimization dashboard — built at a hackathon to make cloud resource waste visible, measurable, and solvable.**

<div align="center">

![Green Cloud Optimization](https://img.shields.io/badge/Green-Cloud%20Optimization-22c55e?style=for-the-badge&logo=leaf&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-73%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-26%25-1572B6?style=for-the-badge&logo=css3&logoColor=white)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Firebase_Hosting-orange?style=for-the-badge)](https://green-cloud-optimization.web.app)
[![GitHub](https://img.shields.io/badge/GitHub-SARVANMEHTA-181717?style=for-the-badge&logo=github)](https://github.com/SARVANMEHTA/Green-Cloud-Optimization-)

</div>

---

## 📌 Problem Statement

> *"Design and develop a tool that allows DevOps teams to monitor, analyze, and reduce the energy usage and associated emissions of their CI/CD pipelines."*

Every time a developer pushes code and a CI/CD build runs automatically — that single build consumes real electricity, produces real heat, and emits real CO₂. Multiply that by hundreds of builds per day across an organization, and the environmental and financial cost becomes enormous.

**The problem:** Not a single mainstream DevOps tool measures or manages this. Teams are completely blind to their pipeline's energy footprint.

**Our solution:** Green Cloud Optimization — a real-time dashboard that makes energy waste visible, calculates carbon emissions per build, detects idle resources, and suggests specific optimizations.

---

## 🎯 What It Does

```
CI/CD Pipeline Runs
        ↓
Real-Time Resource Monitoring (CPU, Memory, Power)
        ↓
Energy & Carbon Calculation (Physics-based formulas)
        ↓
Waste Detection (Idle CPU, Redundant Builds)
        ↓
Optimization Suggestions + Alerts
        ↓
Green Dashboard — Monitor · Analyze · Reduce
```

---

## ✨ Key Features

### 📊 Dashboard
- Live CPU and memory usage chart (updates every 5 seconds)
- Real-time energy consumption in Watts and kWh
- Carbon emission tracking in gCO₂eq per build
- Green Score indicator (0–100) per pipeline run
- Build duration history chart
- CI/CD pipeline list with per-build green badges

### ⚡ Pipeline Energy Calculator
- Interactive tool to model electrical and carbon impact of any CI/CD job
- **Inputs:** CPU TDP, Data Center Region, CPU Utilization %, Build Duration, Memory (GB), Facility PUE, Monthly Build Frequency
- **Outputs:** Energy Per Build (Wh), Carbon Impact (gCO₂eq), Monthly Fleet Projection (kWh, kg CO₂, USD cost)
- Supports multiple regions with real carbon intensity values (US-East 374 gCO₂/kWh, EU-West, US-West, IN-South, and more)

### 🔴 Idle Resource Alerts
- Detects when CPU falls below 10% threshold for sustained duration
- Fires red AlertBanner at top of dashboard
- Sends toast notification bottom-right
- Calculates wasted energy and CO₂ from idle time
- One-click simulate shutdown with before/after impact

### 🧠 Optimization Suggestions Panel
- Rule-based engine evaluates metrics and generates ranked recommendations
- **Rules implemented:**
  - `IDLE_SHUTDOWN` — CPU < 10% → suggest server shutdown
  - `SCALE_DOWN` — avg CPU < 30% → suggest smaller instance
  - `SCHEDULE_OFFHOURS` — low usage at night → suggest scheduled stop
  - `CANCEL_DUPLICATE` — same commit built multiple times → suggest cancel
- Each suggestion shows: Priority badge, estimated kWh savings, CO₂ savings, cost savings
- **Simulate** button — shows before/after impact without applying
- **Apply Fix** button — marks recommendation as applied, logs history

### 🤖 ML Predictions (Predict Page)
- Linear regression model trained on historical build data
- Predicts future energy usage and risk score (0–100)
- Forecasts CO₂ for next 24 hours
- Explains prediction trend (increasing/decreasing)
- Confidence percentage display

### 📈 Reports Page
- Historical build energy trends
- Monthly carbon emission summary
- Before vs after optimization comparison
- Exportable sustainability metrics

---

## 🔬 Energy Formulas Used

All calculations are based on the **SPECpower industry model** and **Green Software Foundation SCI specification**.

### CPU Power
```
CPU_Power (W) = Idle_Power + (CPU_Utilization / 100) × (TDP − Idle_Power)

Where:
  Idle_Power = 10W  (minimum draw at 0% load)
  TDP        = selected processor thermal design power
```

### Memory Power
```
Memory_Power (W) = Memory_GB × 0.3725
```

### Total Server Power with PUE
```
Actual_Power (W) = (CPU_Power + Memory_Power) × PUE

Where:
  PUE = Power Usage Effectiveness (data center overhead multiplier)
```

### Energy Per Build
```
Energy_Wh  = Actual_Power × (Duration_Minutes / 60)
Energy_kWh = Energy_Wh / 1000
```

### Carbon Emission
```
CO₂ (grams) = Energy_kWh × Carbon_Intensity_Region (gCO₂/kWh)
```

### Monthly Fleet Projection
```
Monthly_Energy_kWh = Energy_kWh × Monthly_Builds
Monthly_Carbon_kg  = (Monthly_Energy_kWh × Carbon_Intensity) / 1000
Monthly_Cost_USD   = Monthly_Energy_kWh × Electricity_Rate ($0.12/kWh)
```

### Complete Single Formula
```
CO₂ (g) = [Idle_Power + (CPU%/100) × (TDP − Idle_Power) + (RAM_GB × 0.3725)]
           × PUE
           × (Duration_min / 60)
           × (1 / 1000)
           × Carbon_Intensity_Region
```



## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite 5 |
| Styling | CSS (custom — 26% of codebase) |
| Real-time Database | Firebase Firestore |
| Hosting | Firebase Hosting |
| Charts | Recharts |
| Authentication | Firebase Auth |
| Build Tool | Vite with HMR |
| Linting | ESLint |

---

## 📁 Project Structure

```
Green-Cloud-Optimization-/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ResourceUsageChart.jsx    # Live CPU/Memory area chart
│   │   │   ├── EnergyCard.jsx            # Power W, kWh display
│   │   │   ├── CarbonCard.jsx            # CO₂ emission card
│   │   │   ├── GreenScore.jsx            # 0-100 gauge indicator
│   │   │   ├── OptimizationPanel.jsx     # Suggestions with Simulate/Apply
│   │   │   ├── PipelineList.jsx          # CI/CD runs list
│   │   │   └── BuildDurationChart.jsx    # Build history bar chart
│   │   ├── alerts/
│   │   │   ├── AlertBanner.jsx           # Red idle warning banner
│   │   │   └── ToastNotification.jsx     # Bottom-right toast alerts
│   │   └── calculator/
│   │       └── PipelineCalculator.jsx    # Interactive energy calculator
│   ├── pages/
│   │   ├── Dashboard.jsx                 # Main dashboard page
│   │   ├── Calculator.jsx                # Pipeline Energy Calculator
│   │   ├── Predict.jsx                   # ML predictions page
│   │   └── Reports.jsx                   # Historical reports
│   ├── hooks/
│   │   ├── useMetrics.js                 # Firestore realtime listener
│   │   ├── useAlerts.js                  # Alerts realtime listener
│   │   └── useRecommendations.js         # Recommendations listener
│   ├── utils/
│   │   ├── energyFormulas.js             # All physics formulas
│   │   ├── optimizationEngine.js         # Rule-based suggestion engine
│   │   └── carbonIntensity.js            # Region carbon intensity data
│   ├── firebase/
│   │   └── config.js                     # Firebase initialization
│   └── App.jsx
├── public/
├── .firebase/
├── firebase.json
├── .firebaserc
├── vite.config.js
├── eslint.config.js
├── index.html
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase account (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SARVANMEHTA/Green-Cloud-Optimization-.git

# 2. Navigate to project directory
cd Green-Cloud-Optimization-

# 3. Install dependencies
npm install
```

### Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select Firestore + Hosting)
firebase init
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ Never commit `.env.local` to GitHub. It is already in `.gitignore`.

### Run Locally

```bash
# Start development server with Hot Module Replacement
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Deploy to Firebase

```bash
firebase deploy
```

---

## 📱 Pages Overview

### 1. Dashboard
The main monitoring page. Shows live resource usage, energy cards, carbon cards, green score, optimization suggestions, and idle alerts — all updating in real time from Firebase Firestore.

### 2. Calculator
Interactive Pipeline Energy Calculator. Enter your build parameters and instantly see the energy per build (Wh), carbon impact (gCO₂eq), and monthly fleet projection (kWh, kg, USD).

### 3. Predict
ML Predictions page. Uses linear regression on historical build data to forecast energy risk score (0–100) and predicted CO₂ for the next 24 hours.

### 4. Reports
Historical reports showing energy trends, carbon emission summaries, and before vs after optimization comparisons.

---

## 💡 How the Idle Alert Works

```
Every 5 seconds:
  Agent collects CPU % → writes to Firestore

useMetrics hook:
  Reads last 60 samples → calculates rolling average CPU

If avgCPU < 10% for sustained window:
  optimizationEngine.js → writes IDLE_SHUTDOWN recommendation
  createAlert() → writes alert to Firestore 'alerts' collection

useAlerts hook detects new alert:
  Fires custom DOM event → AlertBanner appears (red, top of page)
                        → ToastNotification fires (bottom right)
                        → OptimizationPanel shows recommendation card
```

---

## 🏆 Built At

This project was built during a **Hackathon** with the problem statement:

> *"Design and develop a tool that allows DevOps teams to monitor, analyze, and reduce the energy usage and associated emissions of their CI/CD pipelines."*

We developed this project to the best of our capacity within the hackathon timeframe, implementing real physics-based energy formulas, Firebase real-time monitoring, an optimization rule engine, idle detection alerts, ML predictions, and an interactive pipeline energy calculator.

---

## 🌱 Why This Matters

| Scale | Impact |
|-------|--------|
| 1 build | 2–5 gCO₂ |
| 100 builds/month | 0.2–0.5 kg CO₂ |
| 10,000 builds/month | 20–50 kg CO₂ |
| Large enterprise (100K builds) | 200–500 kg CO₂/month |

500 kg CO₂/month = equivalent to driving a car for 3,000 kilometers — just from automated code pipelines.

**Green Cloud Optimization makes this waste visible for the first time.**

---

## 📊 Firestore Data Collections

```
metrics/{projectId}/hosts/{hostId}/samples/
  → timestamp, cpuPercent, memPercent, watts, phase

alerts/
  → projectId, type, message, severity, resolved

recommendations/{projectId}/items/
  → type, title, description, priority, impact, applied

ml_predictions/{projectId}/items/
  → riskScore, energyForecast_kWh, confidence, explanation
```

---

## 🔮 Future Scope

- [ ] Python agent with `psutil` for real server monitoring
- [ ] ElectricityMaps API integration for live carbon intensity
- [ ] Carbon-aware build scheduling (run builds when grid is cleanest)
- [ ] GitHub Actions native integration
- [ ] PDF report export
- [ ] Team-level green leaderboard
- [ ] Hardware RAPL power measurement support

---

## 👨‍💻 Author

**Sarvan Mehta**

[![GitHub](https://img.shields.io/badge/GitHub-SARVANMEHTA-181717?style=flat-square&logo=github)](https://github.com/SARVANMEHTA)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---
  developed by vaishnavi
## 🙏 Acknowledgements

- [Green Software Foundation](https://greensoftware.foundation/) — SCI Formula specification
- [ElectricityMaps](https://www.electricitymaps.com/) — Regional carbon intensity data reference
- [Firebase](https://firebase.google.com/) — Real-time database and hosting
- [Recharts](https://recharts.org/) — React charting library
- [Vite](https://vitejs.dev/) — Frontend build tool

---

<div align="center">

**🌿 Made with purpose — reducing the carbon footprint of software development, one build at a time.**

⭐ Star this repo if you found it useful!

</div>
