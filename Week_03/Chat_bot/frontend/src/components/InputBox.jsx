import React, { useRef } from "react";

export default function InputBox({ onSend }) {
  const ref = useRef();
  const send = () => {
    const v = ref.current.value;
    if (!v.trim()) return;
    onSend(v);
    ref.current.value = "";
  };

  return (
    <div className="input-box">
      <input ref={ref} placeholder="Ask question..." onKeyDown={(e) => e.key === "Enter" && send()} />
      <button onClick={send}>Send</button>
    </div>
  );
}
