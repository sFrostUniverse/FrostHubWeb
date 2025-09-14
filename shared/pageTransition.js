// /shared/pageTransition.js
window.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".page-wrapper");
  if (!wrapper) return;

  // Fade in the wrapper
  wrapper.classList.add("fade-in");

  // Intercept sidebar/internal links for smooth fade-out
  document.querySelectorAll(".sidebar a, a[data-transition]").forEach(link => {
    const href = link.getAttribute("href");
    if (href && !href.startsWith("#") && !href.startsWith("http")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        // Trigger fade-out
        wrapper.classList.remove("fade-in");

        // After fade-out ends, navigate
        setTimeout(() => {
          window.location.href = href;
        }, 400); // match CSS transition: 0.4s in dashboard.css
      });
    }
  });
});
