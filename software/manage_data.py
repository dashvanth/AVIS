# software/manage_data.py
import mysql.connector as my
from tkinter import messagebox
import datetime
import os
import re
import pandas as pd
import numpy as np
import sys

# --- Configuration ---
#configuration
# FIX: Try importing directly first (for when running software/main.py)
try:
    from db_config import DB_HOST, DB_USER, DB_PASSWORD
except ImportError:
    # Fallback in case it's run as a module from root
    from software.db_config import DB_HOST, DB_USER, DB_PASSWORD

# GLOBAL STATE VARIABLE: Must be initialized in the global scope
z = 0 

mycon = None
try:
    mycon = my.connect(host=DB_HOST, user=DB_USER, passwd=DB_PASSWORD)
    cursor = mycon.cursor()
    db_status = "Connected"
except Exception as e:
    print(f"Database Connection Error: {e}")
    # AVIS Rebranding applied here for error message
    messagebox.showerror("Database Error", f"Failed to connect to the database: {e}\n\nExecute the following query in your MySQL Workbench or MySQL Shell and then try again:\n\nCREATE DATABASE AVIS_DB;")
    db_status = "Disconnected"

# ----------------------------------------------------------------------------------
# A. USER AUTHENTICATION
# ----------------------------------------------------------------------------------

def check_credentials(username, password):
    # FIX: Declare global z immediately upon entering the function where it is modified.
    global z 
    
    if db_status == "Disconnected":
        return "Database is disconnected."
        
    try:
        cursor.execute("USE AVIS_DB") # AVIS Database name used here
        query = "SELECT u_id, pwd FROM user WHERE u_name='{}'".format(username)
        cursor.execute(query)
        data = cursor.fetchall()
        
        if not data:
            return "No such user found! ✖"

        user_id = data[0][0]
        encrypted_password = data[0][1]
        
        # NOTE: You must ensure the password variable 'password' holds the *encrypted* input
        if password == encrypted_password: 
            message = f"Login Successful. ✓\nUser ID: {user_id}"
            z = 0 # CRITICAL FIX: Reset counter on SUCCESS
            return message
        else:
            message = "Incorrect password! ✖"
            z += 1
            if z >= 2:
                print("There have been more than 1 failed login attempts. Closing the system.")
            return message

    except Exception as e:
        return f"Authentication Error: {e}"

# Placeholder for future Predictive Analytical Engine (Phase 3)
def predict_future_expenditure(df):
    """Placeholder for ARIMA/scikit-learn forecasting model."""
    return 1000.00 

def view_data(u_id):
    # Legacy function (kept for completeness)
    try:
        cursor.execute("USE AVIS_DB")
        query = "SELECT salary, gold, stocks, commodity, sales, expenditure, total, entryDate FROM finance WHERE u_id={}".format(u_id)
        cursor.execute(query)
        data = cursor.fetchall()

        if not data:
            return "No financial data found."

        header = ["Salary", "Gold", "Stocks", "Commodity", "Sales", "Expenditure", "Total", "Date"]
        from tabulate import tabulate
        return tabulate(data, headers=header, tablefmt="fancy_grid")

    except Exception as e:
        return f"Data View Error: {e}"

def plot_data(requireds, u_name):
    # Legacy function (kept for completeness)
    return 0, 0 

# ----------------------------------------------------------------------------------
# B. AUTOMATED EDA & INGESTION (New Core Logic for 40% Claim)
# ----------------------------------------------------------------------------------

def load_and_process_data(file_path):
    """
    Functionality 1: Handles CSV/Excel ingestion.
    Functionality 3: Performs basic Automated EDA (cleaning, type detection).
    """
    try:
        if file_path.lower().endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.lower().endswith(('.xlsx', '.xls')):
            # CRITICAL for Phase 1: Support Excel
            df = pd.read_excel(file_path)
        else:
            # Future logic would include JSON, XML, PDF readers
            return None, "A.V.I.S. Prototype Error: Only CSV and Excel files supported in this 40% prototype.", None

        # Automated EDA step 1: Cleaning and preparation
        # Clean column names for easier Python access
        df.columns = [re.sub(r'[^A-Za-z0-9_]+', '', col.replace(' ', '_')) for col in df.columns]
        df = df.dropna().reset_index(drop=True) 
        
        # Automated EDA step 2: Type Inference & Feature Selection
        numeric_cols = df.select_dtypes(include=np.number).columns
        non_numeric_cols = df.select_dtypes(exclude=np.number).columns
        
        if len(numeric_cols) < 2:
            return None, "Error: Data is invalid. Need at least two numeric columns for automatic plotting.", None
            
        X_COL = numeric_cols[0]
        Y_COL = numeric_cols[1]
        
        # Automated EDA step 3: Generate Comprehensive Summary (Functionality 3)
        data_summary = f"A.V.I.S. Automated EDA Complete! (File: {os.path.basename(file_path)})\n\n"
        data_summary += f"Shape: {df.shape[0]} rows, {df.shape[1]} columns\n"
        data_summary += f"Numeric Features Found: {len(numeric_cols)}\n"
        data_summary += f"Categorical Features Found: {len(non_numeric_cols)}\n\n"
        
        data_summary += "Statistical Summary (Top 5 Rows):\n"
        data_summary += df.head().to_string()

        # Return the clean DataFrame and the columns to plot
        return df, data_summary, X_COL, Y_COL

    except Exception as e:
        return None, f"A.V.I.S. Data Processing Failed: {type(e).__name__} - {e}", None