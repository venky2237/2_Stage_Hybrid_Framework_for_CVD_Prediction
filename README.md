# ❤️🩺 2-Stage Multi-Model Deep Learning Framework for Cardiovascular Disease Prediction

Developed a hybrid, two-stage Cardiovascular Disease (CVD) prediction system combining tabular clinical data and cardiac MRIs. This multi-model architecture improves diagnostic reliability and supports early clinical decision-making through a full-stack web application.

---

## 🔍 Project Overview

The core system is built on a hybrid two-stage workflow designed for comprehensive diagnostic checking:

### 🧠 Stage 1: Clinical Risk Prediction
* Uses a **Stacking Ensemble Model** combining **Random Forest (RF)**, **Extra Trees (ET)**, and **XGBoost**.
* Processes and analyzes standard patient clinical data to predict underlying cardiovascular risk percentages.

### 📷 Stage 2: MRI Image Analysis
* Utilizes a deep learning **Xception CNN architecture** with **Transfer Learning**.
* Automatically processes and classifies cardiac MRI scan images into **Normal** or **Diseased** categories.

---

## 💻 System Architecture & Stack

The repository splits cleanly into two specialized environments:

```text
├── cardio_flask/       # Backend API (Flask, TensorFlow, Scikit-Learn)
└── cardioai/           # Frontend UI (React.js, Vite, Tailwind CSS)
```

* **Frontend:** React.js, Vite, CSS
* **Backend:** Flask (Python 3.11)
* **AI/ML Libraries:** TensorFlow, Scikit-learn, OpenCV
* **Database:** PostgreSQL / SQLite (`schema.sql`)

---

## 📌 Key Features

* **Hybrid AI Prediction:** Merges structured clinical metrics with unstructured medical image scans.
* **Dual-Stage Workflow:** Offers balanced validation before confirming diagnostic outcomes.
* **Automated Diagnostics:** Generates automated, downloadable PDF patient risk reports.
* **Interactive UI:** Dynamic dashboard featuring visual risk gauges and seamless patient entry logs.

---

## 🚀 Getting Started

### 1. Backend Setup (Flask)
```bash
cd cardio_flask
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 2. Frontend Setup (React)
```bash
cd cardioai
npm install
npm run dev
```

---

## 📂 Model Storage Note
To keep the repository lightweight and within size compliance, heavy production model weights (`.keras` and `.pkl` formats) are ignored by Git. Contact the author directly or check the project deployment page to access or download the trained model binaries.
