import { useState, useRef, useEffect } from "react";
import { Mic, Loader2 } from "lucide-react";
import { sendAudio } from "./api"; // keep your api.js

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatEndRef = useRef(null);

  // Ref to manage current AI audio
  const currentAudioRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ChatBubble = ({ sender, text }) => (
    <div
      className={`p-3 rounded-2xl max-w-[75%] break-words ${
        sender === "user"
          ? "bg-gray-300 text-gray-900 self-end rounded-br-none shadow-sm"
          : "bg-blue-500 text-white self-start rounded-bl-none shadow-md"
      }`}
    >
      {text}
    </div>
  );

  // Stop AI audio if playing
  const stopAISpeech = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      // Stop AI speech automatically when recording starts
      stopAISpeech();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        if (!audioChunksRef.current.length) return;

        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        audioChunksRef.current = [];

        setMessages((prev) => [
          ...prev,
          { sender: "user", text: "🎤 Sent voice message..." },
        ]);

        try {
          const response = await sendAudio(audioBlob);
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: response?.text || "⚠️ No response from AI" },
          ]);

          if (response?.audioUrl) {
            // Stop previous AI audio if any
            stopAISpeech();

            const audio = new Audio(response.audioUrl);
            currentAudioRef.current = audio;
            audio.play().catch(console.error);
          }
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: `❌ Error: ${err.message}` },
          ]);
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("⚠️ Could not access microphone. Please allow mic permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-50 to-orange-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4 flex items-center gap-2">
        <Mic className="text-orange-500" /> AI Voice Chatbot
      </h1>

      {/* Chat Box */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-4 flex flex-col gap-3 overflow-y-auto h-[60vh] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} sender={msg.sender} text={msg.text} />
        ))}
        {isLoading && (
          <div className="flex justify-center items-center text-gray-500 text-sm">
            <Loader2 className="animate-spin mr-2" /> AI is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Controls */}
      <div className="mt-4 w-full max-w-md flex justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition transform hover:scale-105"
          >
            <Mic /> Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg animate-pulse transition transform hover:scale-105"
          >
            ⏹ Stop & Send
          </button>
        )}
        <button
          onClick={stopAISpeech}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg transition"
        >
          ⏹ Stop AI
        </button>
      </div>
    </div>
  );
}
