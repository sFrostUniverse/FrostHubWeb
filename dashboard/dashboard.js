window.addEventListener("DOMContentLoaded", () => {
  // Welcome message
  const username = localStorage.getItem("username") || "Guest";
  const welcomeEl = document.getElementById("welcomeMsg");
  if (welcomeEl) {
    welcomeEl.innerHTML = `<i class="fa-solid fa-hand-sparkles"></i> Welcome ${username}`;
  }

  // Call widget loaders
  loadClassStatus();
  loadTodayClasses();

  // Auto-refresh every 1 min
  setInterval(() => {
    loadClassStatus();
    loadTodayClasses();
  }, 60000);

  // Logout button
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "/FrostHubWeb/login/login.html";
    });
  }

// Sidebar toggle logic: collapsed -> show HAMBURGER (lines), expanded -> show X (active)
const layout = document.querySelector(".layout");
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebarToggle");

function setSidebarState(collapsed, save = true) {
  if (!layout || !sidebar || !toggleBtn) return;

  if (collapsed) {
    layout.classList.add("collapsed");
    sidebar.classList.add("collapsed");
    toggleBtn.classList.remove("active"); // show hamburger (3 lines)
  } else {
    layout.classList.remove("collapsed");
    sidebar.classList.remove("collapsed");
    toggleBtn.classList.add("active"); // show X (cross)
  }

  if (save) localStorage.setItem("sidebar-collapsed", collapsed ? "true" : "false");
}

// Restore state on load (collapsed = true means retracted -> show lines)
const saved = localStorage.getItem("sidebar-collapsed");
if (saved === "true") {
  setSidebarState(true, false);
} else {
  setSidebarState(false, false);
}

// Toggle action
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const isCollapsed = sidebar.classList.contains("collapsed");
    setSidebarState(!isCollapsed, true);
  });
}

});
