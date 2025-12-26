import os
import json
from google import genai
from google.genai import types
from sqlmodel import Session
from app.services import eda_service

def generate_insights(dataset_id: int, session: Session):
    """
    Generative Forensic Insights: Uses Gemini to detect patterns beyond simple rules.
    """
    # Fetch discovery metrics as context
    summary = eda_service.get_summary_statistics(dataset_id, session)
    correlations = eda_service.get_correlation_matrix(dataset_id, session)
    
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    prompt = f"""
    Act as a Senior Data Forensic Scientist. Perform a deep audit on the following dataset metrics:
    
    SUMMARY METRICS:
    {json.dumps(summary)}
    
    RELATIONSHIP MATRIX:
    {json.dumps(correlations)}
    
    TASK:
    Generate exactly 6-8 high-fidelity insights. 
    Focus on: Skewness risks, high-impact missing data, multicollinearity, and grouping variety.
    
    RESPONSE FORMAT (STRICT JSON LIST):
    [
      {{
        "type": "insight" | "recommendation",
        "severity": "low" | "medium" | "high",
        "column": "Column Name",
        "message": "Clear, forensic explanation of the finding."
      }}
    ]
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2 # Lower temperature for forensic consistency
            ),
            contents=prompt
        )
        
        # Parse the AI response
        insights = json.loads(response.text)
        return insights
        
    except Exception as e:
        # Fallback Heuristics (in case of API rate limits)
        return [{
            "type": "recommendation",
            "severity": "medium",
            "column": "System",
            "message": "AI Node is temporarily offline. Heuristic backup: Check for high skewness in numerical columns."
        }]