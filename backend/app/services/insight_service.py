# backend/app/services/insight_service.py
import os
import json
from openai import OpenAI  # Use OpenAI SDK for Groq compatibility
from sqlmodel import Session
from app.services import eda_service

def generate_insights(dataset_id: int, session: Session):
    """
    Functionality 6: Universal Discovery & Educational Insights.
    Powered by Groq for high-speed, jargon-free storytelling.
    """
    # 1. Fetch rich context from EDA
    summary = eda_service.get_summary_statistics(dataset_id, session)
    correlations = eda_service.get_correlation_matrix(dataset_id, session)
    
    # 2. Initialize the OpenAI client pointing to Groq
    client = OpenAI(
        api_key=os.getenv("GROQ_API_KEY"),
        base_url="https://api.groq.com/openai/v1"
    )
    
    # ADVANCED PROMPT: Enforces universal terminology
    prompt = f"""
    Act as a 'Universal Data Guide' for beginners. 
    Analyze these metrics and explain them as if talking to someone who has never used a computer.
    
    METRICS:
    {json.dumps(summary)}
    {json.dumps(correlations)}
    
    TASK:
    Generate exactly 6 insights. 
    STRICTLY AVOID: 'Skewness', 'Multicollinearity', 'Pearson', 'Standard Deviation', 'Variance'.
    USE INSTEAD: 'Uneven Pattern', 'Overlapping Info', 'Strong Connection', 'Spread of Data'.
    
    For each insight, explain: 
    1. The Headline (What was found?)
    2. The Reason (Why should I care?)
    3. The Action (What should I do next?)
    
    RESPONSE FORMAT (STRICT JSON LIST):
    [
      {{
        "type": "insight" | "recommendation",
        "severity": "low" | "medium" | "high",
        "column": "Column Name",
        "message": "Simple headline. (New line) Explaining why it's important. (New line) Action to take."
      }}
    ]
    """

    try:
        # 3. Call Groq using a high-performance model
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}, # Ensures valid JSON output
            temperature=0.3
        )
        
        # 4. Parse the content from the choices array
        raw_content = response.choices[0].message.content
        return json.loads(raw_content)

    except Exception as e:
        print(f"Groq Intelligence Error: {str(e)}")
        # Graceful fallback for the UI
        return [{
            "type": "insight",
            "severity": "medium",
            "column": "System Node",
            "message": "Patterns detected! While our AI is summarizing them, look at the Summary page for columns with a wide 'Spread of Data'."
        }]