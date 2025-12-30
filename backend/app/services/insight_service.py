# backend/app/services/insight_service.py
import os
import json
from openai import OpenAI  # Use OpenAI SDK for Groq compatibility
from sqlmodel import Session
from app.services import eda_service
from app.models.dataset import Dataset

# backend/app/services/insight_service.py
import os
import json
from openai import OpenAI  # Use OpenAI SDK for Groq compatibility
from sqlmodel import Session
from app.services import eda_service
from app.models.dataset import Dataset

def get_suitability_assessment(summary: dict, quality_score: int) -> dict:
    """
    Functionality 6.2: Suitability Analysis.
    Determines what the dataset is GOOD for and NOT GOOD for based on its shape and health.
    """
    good_for = []
    not_good_for = []
    
    cat_count = len(summary.get("categorical", []))
    num_count = len(summary.get("numeric", []))
    total_rows = summary.get("total_rows", 0)

    # 1. Suitability Logic
    if cat_count > 0:
        good_for.append("Grouping & comparison")
        good_for.append("Frequency analysis")
    
    if num_count > 0:
        good_for.append("Descriptive summaries")
    
    if num_count >= 2:
        good_for.append("Correlation analysis")
    else:
        not_good_for.append("Correlation analysis (needs 2+ numeric columns)")

    if total_rows > 50:
        good_for.append("Historical reporting")
    else:
        not_good_for.append("Robust Prediction (Too few rows)")

    # 2. Health Constraints
    if quality_score < 70:
        not_good_for.append("Automated Machine Learning (Data needs cleaning)")

    # 3. Hard Safety Limits (Transparency)
    not_good_for.append("Cause–effect conclusions")
    not_good_for.append("Prediction or forecasting")

    return {
        "good_for": good_for,
        "not_good_for": not_good_for
    }

def generate_insights(dataset_id: int, session: Session):
    """
    Functionality 6: Research-Level Insights Engine (Final V2).
    Returns strict JSON structure:
    {
      "health_score": int,
      "score_breakdown": [],
      "good_for": [],
      "not_good_for": [],
      "issues": {"high": [], "medium": [], "info": []},
      "patterns": [],
      "system_limits": [],
      "summary": ""
    }
    """
    # 1. FETCH METADATA (Source of Truth)
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        return {}
    
    ingestion_meta = json.loads(dataset.ingestion_insights) if dataset.ingestion_insights else {}
    score_breakdown = ingestion_meta.get("score_breakdown", [])
    data_issues = ingestion_meta.get("data_issues", [])
    
    # 2. CALCULATE SUITABILITY & PATTERNS
    eda_summary = eda_service.get_summary_statistics(dataset_id, session)
    suitability = get_suitability_assessment(eda_summary, dataset.quality_score or 0)
    
    # 3. GENERATE PATTERN INSIGHTS
    patterns = []
    
    # Pattern A: Skewness/Lopsidedness
    for col in eda_summary.get("numeric", []):
        if abs(col.get("skew", 0)) > 1:
            patterns.append({
                "title": f"Lopsided Distribution in '{col['column']}'",
                "explanation": "Most values are concentrated at one end of the range.",
                "metric": f"Skew: {col.get('skew', 0)}"
            })
            
    # Pattern B: Variance/Volatility
    for col in eda_summary.get("numeric", []):
        if "High Volatility" in col.get("insight", ""):
            patterns.append({
                "title": f"High Variability in '{col['column']}'",
                "explanation": "Values change a lot from row to row.",
                "metric": "High Std Dev"
            })

    # Pattern C: Correlations
    correlations = eda_service.get_correlation_matrix(dataset_id, session)
    for discovery in correlations.get("top_discoveries", []):
        if "Strength" in discovery:
            patterns.append({
                "title": "Hidden Connection",
                "explanation": discovery,
                "metric": "Strong Link"
            })
            
    # 4. CRITICAL ISSUES (Grouped by Priority)
    issues = {"high": [], "medium": [], "info": []}
    
    for issue in data_issues:
        sev = issue.get("severity", "Medium").lower()
        formatted_issue = {
            "title": f"{issue['issue_type']} in {issue['column_name']}",
            "evidence": issue["explanation"],
            "importance": "This can reduce accuracy when comparing values.",
            "recommendation": "Consider filling missing values or re-collecting data.",
            "source": "Preparation Scan"
        }
        
        if sev == "high":
            issues["high"].append(formatted_issue)
        elif sev == "medium":
            issues["medium"].append(formatted_issue)
        else:
            issues["info"].append(formatted_issue)

    # 5. CONSTRUCT FINAL RESEARCH OBJECT
    return {
        "health_score": dataset.quality_score,
        "score_breakdown": score_breakdown,
        "good_for": suitability["good_for"],
        "not_good_for": suitability["not_good_for"],
        "issues": issues,
        "patterns": patterns,
        "system_limits": [
            "A.V.I.S. does not predict future values",
            "Correlation does not imply causation",
            "Analysis depends on available data",
            "Some analysis skipped due to data structure"
        ],
        "summary": ingestion_meta.get("dataset_explanation", {}).get("description", "Dataset analyzed.")
    }