import os
from openai import OpenAI
from dotenv import load_dotenv

# Load env vars from .env file explicitly if needed, or rely on system env
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
print(f"Checking Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("ERROR: GROQ_API_KEY not found in environment.")
    exit(1)

client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
)

models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-8b-8192",
    "mixtral-8x7b-32768"
]

for model in models:
    try:
        print(f"Testing model: {model}...")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": "Ping"}
            ],
            max_tokens=5
        )
        print(f"SUCCESS: {model} works!")
        print(f"Response: {response.choices[0].message.content}")
        break  # Stop at first working model
    except Exception as e:
        print(f"FAILED {model}: {str(e)}")
