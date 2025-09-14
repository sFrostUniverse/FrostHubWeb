// /shared/sidebar.js
window.addEventListener("DOMContentLoaded", () => {
  const layout = document.querySelector(".layout");
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (!layout || !sidebar || !toggleBtn) return;

  function setSidebarState(collapsed, save = true) {
    if (collapsed) {
      layout.classList.add("collapsed");
      sidebar.classList.add("collapsed");
      toggleBtn.classList.remove("active"); // show hamburger
    } else {
      layout.classList.remove("collapsed");
      sidebar.classList.remove("collapsed");
      toggleBtn.classList.add("active"); // show X
    }
    if (save) localStorage.setItem("sidebar-collapsed", collapsed ? "true" : "false");
  }

  // Restore saved state
  const saved = localStorage.getItem("sidebar-collapsed");
  if (saved === "true") {
    setSidebarState(true, false);
  } else {
    setSidebarState(false, false);
  }

  // Toggle on click
  toggleBtn.addEventListener("click", () => {
    const isCollapsed = sidebar.classList.contains("collapsed");
    setSidebarState(!isCollapsed, true);
  });
});
