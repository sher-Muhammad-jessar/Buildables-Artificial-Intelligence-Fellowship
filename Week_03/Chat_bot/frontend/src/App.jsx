import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./ChatWindow";

/**
 App layout: Header + Sidebar + ChatWindow
*/

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Append a message to the conversation
  const appendMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // Send a user message to backend
  const sendMessage = async (msg) => {
    if (!msg?.trim()) return;
    appendMessage({ role: "user", content: msg });
    // add a temporary thinking message
    const thinkingId = Date.now();
    appendMessage({ role: "assistant", content: "⏳ Thinking...", meta: { tempId: thinkingId } });
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();
      // remove the last temp thinking message and add real answer
      setMessages((prev) => {
        // drop the last temp "Thinking..." assistant message if present
        const trimmed = prev.filter((m, i) => !(m.role === "assistant" && m.content === "⏳ Thinking..."));
        return [...trimmed, { role: "assistant", content: data.answer || "Sorry, no answer returned." }];
      });
    } catch (err) {
      setMessages((prev) => {
        const trimmed = prev.filter((m) => !(m.role === "assistant" && m.content === "⏳ Thinking..."));
        return [...trimmed, { role: "assistant", content: "Error: failed to contact server." }];
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      <Header />
      <div className="main-layout">
        <Sidebar onQuickAsk={(q) => sendMessage(q)} />
        <ChatWindow messages={messages} onSend={sendMessage} loading={loading} />
      </div>
    </div>
  );
}
