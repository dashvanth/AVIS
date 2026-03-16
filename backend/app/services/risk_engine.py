import pandas as pd
import numpy as np

def calculate_repair_risk(original_df: pd.DataFrame, repaired_df: pd.DataFrame) -> dict:
    """
    Evaluates the statistical risk of applying a repair strategy by comparing the original 
    and modified data arrays across Distribution Distortion, Correlation Impact, 
    and Information Replacement.
    """
    
    # 1. DISTRIBUTION DISTORTION (Shift in scalar means)
    distribution_shift = 0.0
    numeric_cols = original_df.select_dtypes(include=[np.number]).columns
    
    if len(numeric_cols) > 0:
        shifts = []
        for col in numeric_cols:
             mean_original = original_df[col].mean()
             mean_repaired = repaired_df[col].mean()
             
             if pd.notna(mean_original) and pd.notna(mean_repaired) and mean_original != 0:
                  shift = abs(mean_original - mean_repaired) / abs(mean_original)
             elif pd.notna(mean_original) and mean_original == 0 and mean_repaired != 0:
                  shift = abs(mean_repaired) # Edge case normalized
             else:
                  shift = 0.0
                  
             shifts.append(min(shift, 1.0)) # Cap extreme skew at 1.0 (100% distortion)

        if shifts:
             distribution_shift = float(np.mean(shifts))

    # 2. CORRELATION IMPACT (Mean absolute diff of matrix bounds)
    correlation_impact = 0.0
    if len(numeric_cols) > 1:
         corr_original = original_df[numeric_cols].corr().fillna(0)
         corr_repaired = repaired_df[numeric_cols].corr().fillna(0)
         
         # Element-wise diff calculation isolating absolute mean drift
         diff = (corr_original - corr_repaired).abs()
         correlation_impact = float(diff.mean().mean())

    # 3. INFORMATION REPLACEMENT (Ratio of edited cells)
    total_cells = original_df.shape[0] * original_df.shape[1]
    information_loss = 0.0
    
    if total_cells > 0:
         # Need to handle NaNs safely as NaN != NaN in numpy
         if original_df.shape == repaired_df.shape:
             try:
                 unchanged = (original_df == repaired_df) | (original_df.isna() & repaired_df.isna())
                 changed_cells = (~unchanged).sum().sum()
             except ValueError:
                 changed_cells = total_cells - (repaired_df.shape[0] * repaired_df.shape[1])
         else:
             repaired_cells = repaired_df.shape[0] * repaired_df.shape[1]
             changed_cells = abs(total_cells - repaired_cells)
             
         information_loss = float(changed_cells / total_cells)

    # 4. AGGREGATING FINAL RISK SCORE
    risk_score = (
        0.4 * distribution_shift + 
        0.4 * correlation_impact + 
        0.2 * information_loss
    )
    
    # Restrict score mapped strictly between logical bounds
    risk_score = float(np.clip(risk_score, 0.0, 1.0))

    if risk_score <= 0.2:
         risk_level = "LOW"
    elif risk_score <= 0.5:
         risk_level = "MEDIUM"
    else:
         risk_level = "HIGH"

    return {
         "distribution_shift": round(distribution_shift, 4),
         "correlation_impact": round(correlation_impact, 4),
         "information_loss": round(information_loss, 4),
         "risk_score": round(risk_score, 4),
         "risk_level": risk_level
    }
