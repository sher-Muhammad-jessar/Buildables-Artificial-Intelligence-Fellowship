from groq import Groq
from dotenv import load_dotenv 
import os

load_dotenv()
Api_key = os.getenv("GROQ_API_KEY")
print("API Key loaded:", bool(Api_key))
# Initialize client
client = Groq(api_key=Api_key)

# Memory to store last 5 messages
conversation_memory = []

print("Chatbot started! Type 'quit' to exit.\n")

while True:
    user_input = input("You: ")
    if user_input.lower() == "quit":
        print("Chatbot: Goodbye!")
        break
    
    # Add user message to memory
    conversation_memory.append({"role": "user", "content": user_input})
    
    # Keep only last 5 messages
    if len(conversation_memory) > 5:
        conversation_memory = conversation_memory[-5:]
    
    # Send to Groq API
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=conversation_memory
    )
    
    reply = response.choices[0].message.content
    print("Chatbot:", reply)
    
    # Add chatbot reply to memory
    conversation_memory.append({"role": "assistant", "content": reply})
