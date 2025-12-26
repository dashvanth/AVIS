import os
from google import genai
from pydantic_settings import BaseSettings

# 1. Load the key from your .env file
class Settings(BaseSettings):
    GEMINI_API_KEY: str
    class Config:
        env_file = ".env"

def verify_quota():
    try:
        settings = Settings()
        # 2. Initialize the Gemini Client
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # 3. Use 'gemini-2.0-flash-lite' for the test
        # Lite has a significantly higher free tier (1,500 RPD) vs standard Flash (20 RPD)
        print("A.V.I.S Intelligence Node: Sending low-priority heartbeat (ping)...")
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite", 
            contents="ping"
        )

        # 4. Final Verification
        print(f"\n[SUCCESS]: Heartbeat received -> {response.text}")
        print("Your API Key is VALID and you HAVE available quota.")

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            print("\n[KEY VALID but QUOTA EXHAUSTED]:")
            print("Your API key is working perfectly, but you have hit Google's rate limits.")
            print("Action: Wait for the quota reset or switch to 'gemini-2.0-flash-lite'.")
        elif "401" in error_msg or "403" in error_msg:
            print("\n[INVALID API KEY]:")
            print("The handshake failed because the API key is incorrect or restricted.")
            print("Action: Check your .env file and ensure the key matches Google AI Studio.")
        else:
            print(f"\n[CRITICAL ERROR]: {error_msg}")

if __name__ == "__main__":
    verify_quota()