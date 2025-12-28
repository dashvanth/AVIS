import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def test_handshake():
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    try:
        print("A.V.I.S Intelligence Node: Testing OpenAI Handshake...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=5
        )
        print(f"[SUCCESS]: Received -> {response.choices[0].message.content}")
    except Exception as e:
        print(f"[CRITICAL ERROR]: {str(e)}")

if __name__ == "__main__":
    test_handshake()