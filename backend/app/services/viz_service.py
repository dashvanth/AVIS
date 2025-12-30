import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.eda_service import get_dataframe

def get_chart_data(dataset_id: int, x_col: str, chart_type: str, y_col: str = None, session: Session = None):
    """
    Functionality 4: High-Fidelity Visualization Node.
    Reformats raw database matrices into Plotly-compliant arrays (x, y).
    """
    df = get_dataframe(dataset_id, session)
    
    if x_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{x_col}' not found")
    
    MAX_POINTS = 1000
    
    try:
        y_label = "Count"
        
        # --- LOGIC LAYER: DATA AGGREGATION & FORMATTING ---
        if chart_type in ['bar', 'line', 'area']:
            if y_col and y_col in df.columns:
                # Forensic Check: Is Y numeric?
                if pd.api.types.is_numeric_dtype(df[y_col]):
                    grouped = df.groupby(x_col)[y_col].mean().reset_index()
                    y_label = f"Average of {y_col}"
                else:
                    # Fallback: Count occurrences if Y is categorical
                    grouped = df.groupby(x_col).size().reset_index(name='count')
                    y_label = "Frequency Count"
            else:
                # Basic frequency count for single-axis analysis
                grouped = df[x_col].value_counts().reset_index()
                grouped.columns = [x_col, 'count']
                y_label = "Total Count"

            # Clean, sort, and limit to ensure UI stability
            grouped = grouped.dropna().head(50)
            x_data = grouped[x_col].tolist()
            y_data = grouped.iloc[:, 1].tolist() # Use the calculated mean or count

        elif chart_type == 'pie':
            counts = df[x_col].value_counts().head(10)
            x_data = counts.index.tolist()
            y_data = counts.values.tolist()
            y_label = "Proportional Distribution"

        elif chart_type == 'scatter':
            if not y_col:
                raise HTTPException(status_code=400, detail="Scatter plots require an intersect (Y) dimension.")
            
            # Sampling for high-performance rendering (Deterministic)
            plot_df = df[[x_col, y_col]].dropna().sample(min(len(df), MAX_POINTS), random_state=42)
            x_data = plot_df[x_col].tolist()
            y_data = plot_df[y_col].tolist()
            y_label = y_col

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported chart architecture: {chart_type}")

        # --- PRESENTATION LAYER: PLOTLY HANDSHAKE ---
        # We restructure the data here into 'x' and 'y' arrays to prevent Frontend 500 errors.
        trace = {
            "x": x_data,
            "y": y_data,
            "type": chart_type,
            "mode": 'lines+markers' if chart_type == 'line' else ('markers' if chart_type == 'scatter' else None),
            "marker": {"color": "#6366f1", "size": 8 if chart_type == 'scatter' else None},
            "labels": x_data if chart_type == 'pie' else None,
            "values": y_data if chart_type == 'pie' else None,
            "hole": 0.4 if chart_type == 'pie' else None # Modern donut aesthetic
        }

        # Remove keys with None values to keep the JSON payload clean
        trace = {k: v for k, v in trace.items() if v is not None}

        return {
            "data": [trace],
            "layout": {
                "title": f"Forensic Audit: {x_col} Analysis",
                "xaxis": {"title": x_col, "color": "#94a3b8"},
                "yaxis": {"title": y_label, "color": "#94a3b8"},
                "paper_bgcolor": "rgba(0,0,0,0)",
                "plot_bgcolor": "rgba(0,0,0,0)",
                "font": {"family": "Inter, sans-serif", "color": "#94a3b8"},
                "margin": {"t": 50, "b": 50, "l": 50, "r": 50}
            }
        }
        
    except Exception as e:
        # Standardized Forensic Error Mapping
        raise HTTPException(status_code=500, detail=f"Visualization Node Failure: {str(e)}")