import pandas as pd
import numpy as np
from fastapi import HTTPException
from sqlmodel import Session
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from app.services.eda_service import get_dataframe

def generate_forecast(dataset_id: int, date_col: str, value_col: str, periods: int, session: Session):
    df = get_dataframe(dataset_id, session)
    
    if date_col not in df.columns or value_col not in df.columns:
        raise HTTPException(status_code=400, detail="Invalid columns")

    try:
        # 1. Prepare Data
        # Convert date column
        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        df = df.dropna(subset=[date_col, value_col])
        df = df.sort_values(by=date_col)
        
        if df.empty:
             raise HTTPException(status_code=400, detail="No valid data after processing dates")

        # Set index and resample (handling multiple entries per day or missing days)
        df.set_index(date_col, inplace=True)
        
        # Infer frequency or default to Daily if fails
        # simple resampling to 'D' (Daily) mean for now to ensure regularity
        # Ideally we'd detect freq, but 'D' is safe for many business metrics (Sales/Traffic)
        ts_data = df[value_col].resample('D').mean().interpolate()
        
        # Ensure we have enough data points
        if len(ts_data) < 10:
             raise HTTPException(status_code=400, detail="Not enough data points for forecasting (min 10)")

        # 2. Train Model (Holt-Winters)
        # Seasonal periods: 7 for weekly seasonality in daily data
        model = ExponentialSmoothing(
            ts_data, 
            seasonal_periods=7, 
            trend='add', 
            seasonal='add', 
            damped_trend=True
        ).fit()
        
        # 3. Forecast
        forecast_values = model.forecast(periods)
        
        # 4. Format Results
        # Historical Data
        history = [{"date": str(idx.date()), "actual": val, "predicted": None} for idx, val in ts_data.items()]
        
        # Forecast Data
        future_dates = pd.date_range(start=ts_data.index[-1] + pd.Timedelta(days=1), periods=periods)
        forecast = [{"date": str(date.date()), "actual": None, "predicted": val} for date, val in zip(future_dates, forecast_values)]
        
        return history + forecast

    except Exception as e:
        print(f"Forecast Error: {e}")
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {str(e)}")
