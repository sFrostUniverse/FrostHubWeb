// fab.js — controls FAB and modal dialog
document.addEventListener("DOMContentLoaded", () => {
  const fab = document.getElementById("fh-fab");
  const modal = document.getElementById("fh-modal");
  const cancel = document.getElementById("fh-cancel");
  const save = document.getElementById("fh-save");

  // open modal
  fab.addEventListener("click", () => {
    modal.classList.add("open");
  });

  // close modal
  cancel.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  // placeholder: save logic
  save.addEventListener("click", () => {
    alert("✅ Item added (connect this to your backend later)");
    modal.classList.remove("open");
  });

  // click outside closes
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("open");
  });
});
