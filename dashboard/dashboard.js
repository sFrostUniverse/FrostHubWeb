window.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  document.getElementById("welcomeMsg").innerText = `Welcome ${username}`;

  // Call widget loaders
  loadClassStatus();
  loadTodayClasses();
});
