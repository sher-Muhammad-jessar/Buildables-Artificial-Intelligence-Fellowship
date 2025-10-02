from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from collections import deque
from gtts import gTTS
import tempfile
import os
import uuid
from dotenv import load_dotenv
from groq import Groq
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env file")

client = Groq(api_key=api_key)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Fix CORS

# Store last few messages for memory
chat_memory = deque(maxlen=5)

# System prompt to force English replies
system_prompt = {
    "role": "system",
    "content": "You are an AI assistant. Always reply in English. Do not use any other language."
}

@app.route("/api/voice", methods=["POST"])
def voice_chat():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        file = request.files["file"]
        print("🎤 Received audio file")

        # Save uploaded audio as .wav for Whisper
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:
            file.save(temp.name)
            print(f" Saved temp audio: {temp.name}")

            # Transcribe using Whisper
            with open(temp.name, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-large-v3"
                )

        user_text = getattr(transcript, "text", None)
        print(f" Transcript: {user_text}")

        if not user_text:
            return jsonify({"error": "STT failed, no transcript"}), 500

        chat_memory.append({"role": "user", "content": user_text})

        # LLM response (English only)
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[system_prompt] + list(chat_memory)
            )
            bot_reply = response.choices[0].message.content
            print(f" LLM reply (English): {bot_reply}")
        except Exception as e:
            print(f" LLM error: {e}")
            return jsonify({"error": f"LLM error: {str(e)}"}), 500

        chat_memory.append({"role": "assistant", "content": bot_reply})

        # TTS in English
        try:
            tts = gTTS(bot_reply, lang="en")
            os.makedirs("static", exist_ok=True)
            audio_filename = f"response_{uuid.uuid4().hex}.mp3"
            audio_path = os.path.join("static", audio_filename)
            tts.save(audio_path)
            print(f" TTS saved: {audio_filename}")
        except Exception as e:
            print(f" TTS error: {e}")
            return jsonify({"error": f"TTS error: {str(e)}"}), 500

        return jsonify({
            "text": bot_reply,
            "audioUrl": f"http://127.0.0.1:5000/audio/{audio_filename}"
        })

    except Exception as e:
        print(f" Server error: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route("/audio/<filename>")
def get_audio(filename):
    return send_from_directory("static", filename)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
