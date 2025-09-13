const API_BASE = "https://frostcore.onrender.com/api";

// ---- GOOGLE LOGIN CALLBACK ----
async function handleGoogleResponse(response) {
  try {
    const googleToken = response.credential;
    const payload = JSON.parse(atob(googleToken.split('.')[1]));

    const uid = payload.sub;
    const name = payload.name;
    const email = payload.email;

    const res = await fetch(`${API_BASE}/auth/google-signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, name, email })
    });

    if (!res.ok) throw new Error("Google login failed");
    const data = await res.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username);
    localStorage.setItem("userId", data.user._id);

    await checkUserGroup();
  } catch (err) {
    alert("Login failed: " + err.message);
  }
}

// ---- CHECK USER GROUP ----
async function checkUserGroup() {
  const token = localStorage.getItem("token");
  if (!token) return window.location.href = "login.html"; // stays in /login/

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Auth failed");

    const user = await res.json();

    if (user.groupId) {
      localStorage.setItem("groupId", user.groupId);
      localStorage.setItem("role", user.role);
      window.location.href = "../dashboard/dashboard.html"; // ✅ correct path
    } else {
      window.location.href = "group.html"; // ✅ still in /login/
    }
  } catch (err) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}

// ---- CREATE GROUP ----
const createGroupForm = document.getElementById("createGroupForm");
if (createGroupForm) {
  createGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const groupName = document.getElementById("groupName").value;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ groupName })
      });

      if (!res.ok) throw new Error("Failed to create group");
      const data = await res.json();

      localStorage.setItem("groupId", data._id || data.groupId);
      window.location.href = "../dashboard/dashboard.html"; // ✅ correct path
    } catch (err) {
      alert(err.message);
    }
  });
}

// ---- JOIN GROUP ----
const joinGroupForm = document.getElementById("joinGroupForm");
if (joinGroupForm) {
  joinGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const groupCode = document.getElementById("groupCode").value;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/groups/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ groupCode })
      });

      if (!res.ok) throw new Error("Failed to join group");
      const data = await res.json();

      localStorage.setItem("groupId", data._id || data.groupId);
      window.location.href = "../dashboard/dashboard.html"; // ✅ correct path
    } catch (err) {
      alert(err.message);
    }
  });
}

// ---- DASHBOARD ----
const welcomeMsg = document.getElementById("welcomeMsg");
if (welcomeMsg) {
  const username = localStorage.getItem("username");
  const groupId = localStorage.getItem("groupId");
  const role = localStorage.getItem("role");
  welcomeMsg.innerText = `Welcome ${username}, Group: ${groupId} (Role: ${role})`;
}

// ---- LOGOUT ----
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login/login.html"; // ✅ back to login
  });
}
