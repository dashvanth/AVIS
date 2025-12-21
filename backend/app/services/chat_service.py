import re
import numpy as np
from sqlmodel import Session
from app.services import eda_service
from app.models.dataset import Dataset

def process_message(dataset_id: int, message: str, session: Session):
    msg = message.lower()
    dataset = session.get(Dataset, dataset_id)
    filename = dataset.filename if dataset else "Dataset"

    # Intent 1: Summary / Stats
    if any(k in msg for k in ["summary", "stats", "describe", "overview", "analysis"]):
        try:
            summary = eda_service.get_summary_statistics(dataset_id, session)
            response = f"Analysis complete for **{filename}**:\n\n"
            response += f"- **Instances**: {summary['total_rows']}\n"
            response += f"- **Features**: {summary['total_columns']}\n"
            
            if summary['numeric']:
                response += "\n**Numeric Insights**:\n"
                for col in summary['numeric'][:3]:
                    val = col['mean']
                    mean_str = f"{val:.2f}" if val is not None else "N/A"
                    response += f"- {col['column']}: Average = {mean_str}\n"
            return {"response": response}
        except Exception as e:
            return {"response": f"Audit Error: {str(e)}"}

    # Intent 2: Dynamic Charting
    plot_match = re.search(r"(plot|chart|graph|show)\s+(?:of\s+)?([a-z0-9_]+)(?:\s+(?:vs|against|by)\s+([a-z0-9_]+))?", msg)
    if plot_match:
        col1 = plot_match.group(2)
        col2 = plot_match.group(3)
        df = eda_service.get_dataframe(dataset_id, session)
        
        real_col1 = next((c for c in df.columns if c.lower() == col1), None)
        real_col2 = next((c for c in df.columns if c.lower() == col2), None) if col2 else None

        if not real_col1:
            return {"response": f"Dimension '{col1}' not found in relational schema."}
        
        return {
            "response": f"Generating visualization for {real_col1}...",
            "plot_config": {
                "chartType": "scatter" if real_col2 else "bar",
                "xColumn": real_col1,
                "yColumn": real_col2 or ""
            }
        }
        
    return {"response": f"Handshake confirmed. I am monitoring **{filename}**. Try asking for a 'summary' or to 'plot' a column."}