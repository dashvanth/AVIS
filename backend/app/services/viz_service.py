import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.eda_service import get_dataframe

def get_chart_data(dataset_id: int, x_col: str, chart_type: str, y_col: str = None, session: Session = None):
    df = get_dataframe(dataset_id, session)
    
    if x_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{x_col}' not found")
    
    if y_col and y_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{y_col}' not found")

    # Simple data aggregation/sampling for performance
    MAX_POINTS = 1000
    
    try:
        data = []
        if chart_type == 'scatter':
            if not y_col:
                raise HTTPException(status_code=400, detail="Scatter plot requires Y column")
            # Drop NAs
            plot_df = df[[x_col, y_col]].dropna()
            # Sample if too large
            if len(plot_df) > MAX_POINTS:
                plot_df = plot_df.sample(MAX_POINTS)
            
            data = plot_df.to_dict(orient='records')
            
        elif chart_type in ['bar', 'line', 'area']:
            if y_col:
                # Aggregate: Average of Y by X
                # Check if Y is numeric
                if pd.api.types.is_numeric_dtype(df[y_col]):
                    grouped = df.groupby(x_col)[y_col].mean().reset_index()
                else:
                    # Count
                    grouped = df.groupby([x_col, y_col]).size().reset_index(name='count')
            else:
                # Count by X
                grouped = df[x_col].value_counts().reset_index()
                grouped.columns = [x_col, 'count']
                y_col = 'count' # implicit Y

            # Sort by X usually makes sense for lines/bars
            if pd.api.types.is_numeric_dtype(grouped[x_col]) or pd.api.types.is_datetime64_any_dtype(grouped[x_col]):
                 grouped = grouped.sort_values(x_col)
            else:
                 grouped = grouped.head(50) # Limit categories
            
            data = grouped.to_dict(orient='records')

        elif chart_type == 'pie':
            # Count by X
            grouped = df[x_col].value_counts().reset_index()
            grouped.columns = [x_col, 'count']
            grouped = grouped.head(10) # Top 10 for pie
            data = grouped.to_dict(orient='records')
            y_col = 'count' # implicit

        elif chart_type == 'histogram':
             # Return raw values for plotly to bin, sampled
             plot_df = df[[x_col]].dropna()
             if len(plot_df) > MAX_POINTS:
                plot_df = plot_df.sample(MAX_POINTS)
             data = plot_df.to_dict(orient='records')

        return {
            "data": data,
            "layout": {
                "title": f"{chart_type.title()} Chart of {x_col}" + (f" vs {y_col}" if y_col else ""),
                "xaxis": {"title": x_col},
                "yaxis": {"title": y_col or "Count"}
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
