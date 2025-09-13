window.addEventListener("DOMContentLoaded", () => {
  // Welcome message
  const username = localStorage.getItem("username") || "Guest";
  document.getElementById("welcomeMsg").innerText = `Welcome ${username}`;

  // Call widget loaders
  loadClassStatus();
  loadTodayClasses();

  // Auto-refresh every 1 min
  setInterval(() => {
    loadClassStatus();
    loadTodayClasses();
  }, 60000);

  // Logout button (optional if you add it in HTML)
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "/FrostHubWeb/login/login.html";
    });
  }
});
