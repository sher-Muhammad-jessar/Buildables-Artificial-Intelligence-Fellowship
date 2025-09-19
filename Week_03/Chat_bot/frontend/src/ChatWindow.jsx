import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

/**
 ChatWindow shows messages and the input area
 props:
  - messages: [{role: "user"|"assistant", content: "..."}]
  - onSend: function(text)
  - loading: boolean
*/

export default function ChatWindow({ messages = [], onSend, loading }) {
  const inputRef = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    const val = inputRef.current.value;
    if (!val.trim()) return;
    onSend(val);
    inputRef.current.value = "";
  };

  return (
    <div className="chat-window">
      <div className="messages-panel">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message-bubble ${m.role === "user" ? "user" : "assistant"}`}
          >
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="input-panel">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask about algorithms, data structures, complexity, examples..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="text-input"
        />
        <button onClick={handleSend} className="send-btn" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
