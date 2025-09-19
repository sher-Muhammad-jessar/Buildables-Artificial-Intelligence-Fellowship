const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export async function healthCheck() {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload_file`, {
    method: "POST",
    body: formData,
  });

  return res.json();
}

export async function chat(message) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  return res.json();
}
