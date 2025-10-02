export async function sendAudio(audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "voice.wav"); // use .wav

  try {
    const res = await fetch("http://127.0.0.1:5000/api/voice", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errMsg = await res.text();
      throw new Error(`Backend error: ${errMsg}`);
    }

    return await res.json(); // { text, audioUrl }
  } catch (err) {
    console.error(" API error:", err);
    throw err;
  }
}
