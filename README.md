# A.V.I.S. — Automated Visualization and Intelligent Simulation System

A.V.I.S. is a research-oriented data quality analysis and repair system designed to provide transparent, explainable, and non-destructive data preprocessing.

Unlike traditional exploratory data analysis tools, A.V.I.S. introduces a simulation-first approach, allowing users to evaluate the impact of data repair strategies before modifying the dataset.

---

🚀 Core Idea

Modern data preprocessing is often destructive and opaque. Once a cleaning method is applied, the original statistical properties may be lost without visibility.

A.V.I.S. solves this by introducing:

- Explainable Data Quality Metrics
- Simulation-Based Repair Engine
- Version-Controlled Dataset Evolution
- Deterministic Analysis (No black-box decisions)

---

🧠 System Workflow

A.V.I.S. follows a structured analytical pipeline:

1. **Upload Dataset**
2. **Analyze** (Understanding & Diagnostics)
3. **Repair** (Simulation & Application)
4. **Statistics** (Distribution Analysis)
5. **Visualization** (Exploration)

```text
Upload Dataset
        ↓
Analyze (Understanding & Diagnostics)
        ↓
Repair (Simulation & Application)
        ↓
Statistics (Distribution Analysis)
        ↓
Visualization (Exploration)
```

---

🔍 Key Features

### 1. Deterministic Data Quality Engine

- Computes dataset health using measurable factors:
  - Completeness (missing values)
  - Consistency (duplicates)
  - Uniqueness
  - Type Integrity
- All scores are traceable to raw data
- No hidden logic or AI-based scoring

---

### 2. Interactive Dataset Diagnostics

- **Dataset Overview**:
  - Rows, Columns, Missing Values, Duplicates
- **Quality Profile** (Radar Metrics)
- **Column-Level Issue Detection**:
  - Missing values
  - Outliers
  - Type mismatches
- **Record-level inspection** via modal views

---

### 3. Simulation-Based Repair Engine (Core Contribution)

Instead of directly modifying data:

- Creates a temporary dataset copy
- Applies repair strategies:
  - Mean Imputation
  - Median Imputation
  - KNN-based Imputation
- Shows:
  - Before vs After distributions
  - Impact on statistics
  - Data changes preview

---

### 4. Strategy Comparison Engine

- Compares multiple repair strategies
- Evaluates based on:
  - Data quality improvement
  - Statistical distortion
- Helps select optimal repair method

---

### 5. Dataset Versioning System

Every repair creates a new dataset version:

```text
Original Dataset (v1)
        ↓
After Repair (v2)
        ↓
Further Repair (v3)
```

- Enables undo / restore
- Maintains full lineage
- Prevents destructive overwrites

---

### 6. Statistical Analysis Engine

Provides structured analysis of dataset properties:

**Numerical Analysis**
- Distribution plots
- Mean, Median, Standard Deviation
- Skewness detection

**Categorical Analysis**
- Frequency distributions
- Mode detection
- Category imbalance

---

### 7. Transparent Data Interaction (NEW)

- Clicking any metric shows:
  - Actual rows and columns involved
  - Real data values
  - Expandable tables
- No AI chat interruptions for core analysis
- Designed for academic explainability

---

🛠️ Technology Stack

**Frontend**
- React 18 + TypeScript
- Tailwind CSS
- Plotly.js (Data Visualization)
- Context API (DatasetContext for shared state)

**Backend**
- FastAPI (Async API Layer)
- Pandas, NumPy (Data Processing)
- Scikit-learn (Imputation Models)
- SQLAlchemy / SQLModel
- MySQL / SQLite

---

🏗️ Architecture Overview

The system follows a layered architecture:

```text
Frontend (React UI)
        ↓
FastAPI Backend
        ↓
Data Processing Layer (Pandas / NumPy)
        ↓
Database + File Storage
```

**Key Design Principle**: Separation of Analysis, Repair, and Visualization.

---

📊 Research Contributions

- Introduces Counterfactual Data Repair Simulation
- Provides Explainable Data Quality Metrics
- Ensures Non-Destructive Data Cleaning
- Enables Version-Based Dataset Governance

---

⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**Create ".env" file**:
```env
DATABASE_URL=sqlite:///./avis.db
SECRET_KEY=your_secret_key
```

**Run server**:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Open**: http://localhost:5173

---

📌 Future Enhancements

- Correlation heatmap integration
- Large-scale dataset support (beyond Pandas)
- Advanced anomaly detection
- Multi-dataset comparison system

---

🤝 Contribution

Contributions are welcome. Please fork the repository and submit a pull request.

---

👨‍💻 Author

**Dashvanth Raj H C**
Department of Computer Applications
PES University, Bangalore, India

---

📄 License

This project is developed for academic and research purposes.
