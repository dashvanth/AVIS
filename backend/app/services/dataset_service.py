import shutil
import os
import pandas as pd
import numpy as np
import json
import re  # Added for smarter filename parsing
import logging
from fastapi import UploadFile, HTTPException
from app.models.dataset import Dataset
from app.core.database import Session

# Setup high-fidelity logging for the Audit Trail
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def calculate_quality_score(df: pd.DataFrame) -> dict:
    """
    Calculates a multi-dimensional health score with explicit markdown explanation.
    Glass Box Logic: Start at 100, subtract points for specific issues.
    """
    total_cells = df.size
    row_count = len(df)
    score = 100
    breakdown = []
    
    if total_cells == 0:
        return {"score": 0, "rating": "Critical", "score_breakdown": [{"reason": "Empty File", "score_change": -100, "explanation": "File contains no data."}]}
    
    # 1. Missing Values (Heavy Penalty)
    missing_count = int(df.isnull().sum().sum())
    if missing_count > 0:
        penalty = 15
        if (missing_count / total_cells) > 0.1: penalty = 25 # High penalty if >10% missing
        score -= penalty
        breakdown.append({
            "reason": "Missing Values",
            "score_change": -penalty,
            "explanation": f"Found {missing_count} empty cells. Analysis requires complete data."
        })
    else:
        breakdown.append({
            "reason": "Complete Data",
            "score_change": 0,
            "explanation": "No empty cells found. Perfect density."
        })

    # 2. Duplicates (Medium Penalty)
    duplicate_rows = int(df.duplicated().sum())
    if duplicate_rows > 0:
        penalty = 10
        score -= penalty
        breakdown.append({
            "reason": "Duplicate Rows",
            "score_change": -penalty,
            "explanation": f"Found {duplicate_rows} identical rows. This can skew stats."
        })

    # 3. Valid Structure (Bonus)
    if len(df.columns) > 1 and row_count > 5:
        breakdown.append({
            "reason": "Good Structure",
            "score_change": 0,
            "explanation": "Dataset has sufficient rows and columns for analysis."
        })

    score = max(0, min(100, score))
    
    return {
        "score": score,
        "rating": "Optimal" if score > 85 else "Needs Cleaning",
        "score_breakdown": breakdown
    }

def generate_ingestion_insights(df: pd.DataFrame, quality: dict, filename: str = "") -> dict:
    """
    Functionality 1 (Enhanced): Glass Box Context Engine.
    Generates rich, intelligent natural language summaries for the dataset.
    """
    # 1. Parse Filename (Snake, Kebab, CamelCase)
    base_name = os.path.splitext(filename)[0]
    # Split by underscore or hyphen
    words = re.split(r'[_\-]', base_name)
    # Further split CamelCase if present in chunks
    final_words = []
    for w in words:
        # Split camelCase: "RetailSales" -> "Retail Sales"
        split_camel = re.sub('([a-z0-9])([A-Z])', r'\1 \2', w)
        final_words.append(split_camel)
    
    clean_title = " ".join(final_words).title()
    
    col_names_lower = [c.lower() for c in df.columns]
    col_text = " ".join(col_names_lower)
    
    # 2. Identify Domain & Entity
    domain = "General"
    entity = "record"
    action = "contains"
    
    # Priority 1: Healthcare (Distinct medical terms)
    if any(x in col_text for x in ['patient', 'diagnosis', 'treatment', 'health', 'glucose', 'insulin', 'bmi', 'blood', 'hba1c', 'diabetes']):
        domain = "Healthcare"
        entity = "patient case"
        action = "documents"
    # Priority 2: Retail & Finance (Money terms)
    elif any(x in col_text for x in ['price', 'cost', 'revenue', 'profit', 'currency', 'transaction', 'invoice']):
        domain = "Retail & Finance"
        entity = "transaction"
        action = "tracks"
    # Priority 3: Education (Must be specific)
    elif any(x in col_text for x in ['student', 'grade', 'marks', 'exam', 'semester', 'gpa']):
        domain = "Education"
        entity = "student record"
        action = "lists"
    # Priority 4: HR / CRM (People terms)
    elif any(x in col_text for x in ['employee', 'salary', 'job', 'department', 'hire', 'customer', 'churn']):
        domain = "Human Resources"
        entity = "personnel record"
        action = "manages"
    # Priority 5: IoT / Tech
    elif any(x in col_text for x in ['sensor', 'voltage', 'watt', 'hz', 'temperature', 'ip_address', 'latency']):
        domain = "IoT / Technology"
        entity = "sensor reading"
        action = "logs"
    # Fallback to general based on ID
    elif 'id' in col_text:
        domain = "General Business"
        entity = "entity"
        action = "catalogs"

    # 3. Identify Key Columns (Heuristic)
    key_cols = []
    for col in df.columns:
        cl = col.lower()
        if any(k in cl for k in ['id', 'key', 'code', 'date', 'time', 'year', 'month', 'name', 'category', 'status', 'target']):
             key_cols.append(col)
    
    # Pick top 3 most interesting columns (prioritize ID/Date/Categorical)
    highlight_cols = key_cols[:3] if key_cols else df.columns[:3].tolist()
    highlight_str = ", ".join([f"'{c}'" for c in highlight_cols])

    # 4. Construct Natural Language Description
    description = (
        f"The file **'{filename}'** appears to be a **{domain}** dataset. "
        f"It {action} **{len(df)} {entity}s** across {len(df.columns)} columns. "
        f"Key data points include {highlight_str}, which allows for in-depth analysis of trends and patterns."
    )

    explanation = {
        "description": description,
        "usage_examples": [
            f"Analyze the distribution of {highlight_cols[0] if highlight_cols else 'values'}",
            "Identify missing or incomplete records",
            "Discover correlations between columns"
        ]
    }
    
    # --- Step 9: Use Readiness Status ---
    readiness_status = "Ready" if quality['score'] > 85 else "Needs Cleaning"
    readiness_reason = "Data is robust and structured." if readiness_status == "Ready" else "Missing values or duplicates detected."
    
    return {
        "dataset_explanation": explanation,
        "readiness": {
            "status": readiness_status,
            "explanation": readiness_reason
        }
    }

def clean_and_audit(df: pd.DataFrame):
    """
    Functionality 2: Forensic Radical Transparency.
    Implements 'Glass Box' auditing: capturing Type, Issues, and Structure.
    """
    audit_log = []
    column_types = []
    data_issues = []
    
    # --- Capture RAW (Initial) Metrics ---
    initial_row_count = len(df)
    initial_col_count = len(df.columns)
    initial_null_count = int(df.isnull().sum().sum())

    # Forensic Step: Absolute Raw Metadata Capture
    forensic_trace = [
        {"timestamp": 0, "step": "Handshake", "code": "pd.read_{format}(file)", "result": "Success"},
        {"timestamp": 100, "step": "Dimensions Scan", "code": "df.shape", "result": f"({initial_row_count}, {initial_col_count})"},
        {"timestamp": 300, "step": "Null Sweep", "code": "df.isnull().sum().sum()", "result": f"{initial_null_count} Empty Cells"}
    ]

    raw_stats = {
        "total_nulls": initial_null_count,
        "null_rows": int(df.isnull().any(axis=1).sum()),
        "null_cols": int(df.isnull().any(axis=0).sum()),
        "duplicate_count": int(df.duplicated().sum())
    }

    # 1. Row Removal: Cleaning Empty Rows
    empty_rows = df.isnull().all(axis=1).sum()
    if empty_rows > 0:
        df = df.dropna(how='all')
        audit_log.append({
            "action": "Cleaning Empty Rows",
            "count": int(empty_rows),
            "reason": f"System removed {empty_rows} completely empty rows."
        })
        forensic_trace.append({
             "timestamp": 600,
             "step": "Row Cleaner",
             "code": "df.dropna(how='all')",
             "result": f"Pruned {empty_rows} rows"
        })

    # 2. Glass Box: Column Type & Issue Detection
    for col in df.columns:
        col_data = df[col]
        
        # Step 3: Column Types
        dtype_name = str(col_data.dtype)
        rep = "Text"
        if pd.api.types.is_numeric_dtype(col_data): rep = "Number"
        elif pd.api.types.is_datetime64_any_dtype(col_data): rep = "Date"
        
        column_types.append({
            "column_name": col,
            "representation": rep,
            "data_type": dtype_name
        })
        
        # Step 4: Missing Values
        missing = col_data.isnull().sum()
        if missing > 0:
            # Capture first 5 affected row indices (0-indexed)
            affected_rows = df[col_data.isnull()].index.tolist()[:5] 
            data_issues.append({
                "issue_type": "Missing Value",
                "column_name": col,
                "explanation": f"Column '{col}' has {missing} empty cells.",
                "severity": "High" if (missing/len(df)) > 0.1 else "Medium",
                "affected_rows": affected_rows
            })
            
        # Step 5: Type Mismatch (Text in Number column)
        if col_data.dtype == 'object':
            numeric_test = pd.to_numeric(col_data, errors='coerce')
            if numeric_test.notnull().mean() > 0.8: # If 80% is numeric
                 data_issues.append({
                    "issue_type": "Wrong Data Type",
                    "column_name": col,
                    "explanation": f"Column '{col}' looks like Numbers but is stored as Text.",
                    "severity": "Medium",
                    "affected_rows": [] # Difficult to capture specifically without deeper parse
                })

    # Capture final stats for summary
    raw_stats.update({
        "final_rows": len(df),
        "final_cols": len(df.columns)
    })

    return df, audit_log, raw_stats, forensic_trace, column_types, data_issues

def analyze_file_preview(file: UploadFile):
    """Functionality 1: Automated Orientation Engine."""
    temp_path = f"{UPLOAD_DIR}/temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            file.file.seek(0)
            
        file_ext = file.filename.split('.')[-1].lower()
        
        # Multi-format Ingestion Node (Robust Loaders)
        try:
            if file_ext == 'csv': 
                try: df = pd.read_csv(temp_path)
                except UnicodeDecodeError: df = pd.read_csv(temp_path, encoding='latin1')
            elif file_ext in ['xlsx', 'xls']: 
                df = pd.read_excel(temp_path)
            elif file_ext == 'json': 
                # Try multiple JSON orientations
                try: df = pd.read_json(temp_path)
                except ValueError: 
                    try: df = pd.read_json(temp_path, orient='index')
                    except ValueError: df = pd.read_json(temp_path, lines=True) # NDJSON
            elif file_ext == 'xml': 
                df = pd.read_xml(temp_path)
            else: 
                raise HTTPException(status_code=400, detail="Format not supported by A.V.I.S")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Orientation Error: {str(e)}")
            
        # Execute Forensic Audit
        df_cleaned, audit_log, forensic_stats, forensic_trace, column_types, data_issues = clean_and_audit(df)
        
        # Calculate Quality & Insights
        quality = calculate_quality_score(df)
        insight_ctx = generate_ingestion_insights(df, quality, filename=file.filename)
        
        # Isolate Anomaly Instances (Rows with at least one NULL)
        anomaly_df = df[df.isnull().any(axis=1)].head(50)
        
        return {
            "filename": file.filename,
            "file_type": file_ext,
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": list(df.columns),
            "full_data": df.head(100).replace({np.nan: None}).to_dict(orient="records"),
            "anomaly_data": anomaly_df.replace({np.nan: None}).to_dict(orient="records"),
            "dtypes": df.dtypes.astype(str).to_dict(),
            
            # Glass Box Metadata
            "quality_score": quality, # includes score, rating, score_breakdown
            "column_types": column_types,
            "data_issues": data_issues,
            "dataset_explanation": insight_ctx["dataset_explanation"],
            "readiness": insight_ctx["readiness"],
            
            "structural_audit": {
                "total_nulls": forensic_stats["total_nulls"],
                "null_rows": forensic_stats["null_rows"],
                "null_cols": forensic_stats["null_cols"],
                "duplicates": forensic_stats["duplicate_count"]
            },
            "processing_log": json.dumps(audit_log),
            "forensic_trace": forensic_trace
        }
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

def process_uploaded_file(file: UploadFile, session: Session) -> Dataset:
    """Functionality 7: Final Handshake and MySQL Persistence."""
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_ext = file.filename.split('.')[-1].lower()
    try:
        # Load for final audit (Robust Loaders)
        if file_ext == 'csv': 
            try: df = pd.read_csv(file_location)
            except UnicodeDecodeError: df = pd.read_csv(file_location, encoding='latin1')
        elif file_ext in ['xlsx', 'xls']: 
            df = pd.read_excel(file_location)
        elif file_ext == 'json': 
            try: df = pd.read_json(file_location)
            except ValueError: 
                try: df = pd.read_json(file_location, orient='index')
                except ValueError: df = pd.read_json(file_location, lines=True)
        elif file_ext == 'xml': 
            df = pd.read_xml(file_location)
        else:
             raise HTTPException(status_code=400, detail="Unsupported file format")
        
        df_cleaned, audit_log, forensic_stats, forensic_trace, column_types, data_issues = clean_and_audit(df)
        quality = calculate_quality_score(df)
        insight_ctx = generate_ingestion_insights(df, quality, filename=file.filename)
        
        # Save high-performance binary version
        storage_path = file_location.rsplit('.', 1)[0] + "_processed.csv"
        df_cleaned.to_csv(storage_path, index=False)
        
        # GLASS BOX PERSISTENCE: Pack all explanation metadata into the JSON field
        glass_box_metadata = {
            "dataset_explanation": insight_ctx["dataset_explanation"],
            "readiness": insight_ctx["readiness"],
            "data_issues": data_issues,
            "column_types": column_types,
            "score_breakdown": quality["score_breakdown"]
        }
        
        dataset = Dataset(
            filename=file.filename,
            filepath=storage_path,
            file_type=file_ext,
            row_count=len(df_cleaned),
            column_count=len(df_cleaned.columns),
            file_size_bytes=os.path.getsize(storage_path),
            unstructured_null_count=forensic_stats["total_nulls"],
            unstructured_row_removal_count=forensic_stats["null_rows"],
            quality_score=quality["score"],
            analyzed=True,
            processing_log=json.dumps(audit_log),
            forensic_trace=json.dumps(forensic_trace),
            ingestion_insights=json.dumps(glass_box_metadata)
        )
        
        session.add(dataset)
        session.commit()
        session.refresh(dataset)
        
        if file_location != storage_path and os.path.exists(file_location):
            os.remove(file_location)
            
        return dataset
    except Exception as e:
        if os.path.exists(file_location): os.remove(file_location)
        raise HTTPException(status_code=400, detail=f"Handshake Aborted: {str(e)}")