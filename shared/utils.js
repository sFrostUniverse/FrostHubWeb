// shared/utils.js
const API_BASE = "https://frostcore.onrender.com/api";

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };

  // Only add JSON header if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  console.log("➡️ API Request:", API_BASE + url, headers);

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  console.log("⬅️ API Response status:", res.status);

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}


// Make it available everywhere
window.apiFetch = apiFetch;
window.API_BASE = API_BASE;   // 👈 Add this line
