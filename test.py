import os
from groq import Groq
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

def main():
    # Get API key from .env
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("API key not found. Make sure .env contains GROQ_API_KEY")

    # Initialize Groq client
    client = Groq(api_key=api_key)

    # Simple test request
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Hello Groq! Just testing my API key."}],
    )

    # Print response
    print("Groq API response:", response.choices[0].message.content)

if __name__ == "__main__":
    main()
