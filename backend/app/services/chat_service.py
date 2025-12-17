import re
from sqlmodel import Session
from app.services import eda_service
from app.models.dataset import Dataset
from app.services.eda_service import get_dataframe

def process_message(dataset_id: int, message: str, session: Session):
    msg = message.lower()
    dataset = session.get(Dataset, dataset_id)
    filename = dataset.filename if dataset else "Dataset"

    # Intent 1: Summary / Stats
    if any(k in msg for k in ["summary", "stats", "describe", "overview", "analysis"]):
        try:
            summary = eda_service.get_summary_statistics(dataset_id, session)
            rows = summary['total_rows']
            cols = summary['total_columns']
            response = f"Here is the summary for **{filename}**:\n\n"
            response += f"- **Rows**: {rows}\n"
            response += f"- **Columns**: {cols}\n"
            response += "\n**Numeric Columns**:\n"
            for col in summary['numeric'][:3]: # Show top 3
                response += f"- {col['column']}: Mean={col['mean']:.2f}\n"
            return {"response": response}
        except Exception as e:
            return {"response": f"I tried to fetch the summary but encountered an error: {str(e)}"}

    # Intent 2: Plotting (Regex to catch "plot X vs Y")
    # Match patterns like: "plot sales vs date", "graph of age", "scatter chart of price vs area"
    plot_match = re.search(r"(plot|chart|graph|show)\s+(?:of\s+)?([a-z0-9_]+)(?:\s+(?:vs|against|by)\s+([a-z0-9_]+))?", msg)
    if plot_match:
        col1 = plot_match.group(2) # First captured column
        col2 = plot_match.group(3) # Second (Optional)
        
        # Determine chart type
        chart_type = 'bar'
        if 'scatter' in msg: chart_type = 'scatter'
        elif 'line' in msg: chart_type = 'line'
        elif 'pie' in msg: chart_type = 'pie'
        else:
            # Simple heuristic: if 2 cols, scatter/line. If 1, bar/hist.
            if col2: chart_type = 'scatter'
            
        try:
            # Verify columns exist
            df = get_dataframe(dataset_id, session)
            cols = [c.lower() for c in df.columns]
            
            # Fuzzy match or simple check
            real_col1 = next((c for c in df.columns if c.lower() == col1), None)
            real_col2 = next((c for c in df.columns if c.lower() == col2), None) if col2 else None

            if not real_col1:
                return {"response": f"I couldn't find a column named '{col1}'. Please check the spelling."}
            
            # Generate config for frontend
            # We don't actually generate the data here to save bandwidth, 
            # we tell frontend "Go fetch this chart". 
            # BUT, for chat, it's cooler if we return the data config directly so it just renders.
            # Let's reuse viz_service logic implicitly or just return the config for the frontend to call the viz API.
            # Ideally, we return a special 'plot_config' object.
            
            return {
                "response": f"Here is the {chart_type} chart for {real_col1} {f'vs {real_col2}' if real_col2 else ''}.",
                "plot_config": {
                    "chartType": chart_type,
                    "xColumn": real_col1,
                    "yColumn": real_col2 if real_col2 else "" # Frontend handles empty Y as count
                }
            }
        except Exception as e:
            return {"response": f"Error preparing chart: {str(e)}"}

    # Intent 3: Forecast
    if "forecast" in msg or "predict" in msg:
        return {
            "response": "I can help with forecasting! Please go to the **Forecasting Dashboard** using the button in the dataset list to configure parameters interactively."
        }
        
    # Default
    return {
        "response": f"I'm listening! I can help you analyze **{filename}**.\n\nTry asking:\n- 'Show me a summary'\n- 'Plot [Column]'\n- 'Plot [Column A] vs [Column B]'"
    }
