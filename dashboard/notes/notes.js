window.addEventListener("DOMContentLoaded", () => {
  const groupId = localStorage.getItem("groupId");
  const notesList = document.getElementById("notesList");
  const breadcrumbs = document.getElementById("breadcrumbs");

  let currentParentId = null;
  let navStack = [];

  if (!groupId) {
    notesList.innerText = "No group found. Please join a group first.";
    return;
  }

  // Load root notes on page load
  loadNotes(groupId, currentParentId);

  // 🔹 Fetch and render notes
  async function loadNotes(groupId, parentId = null) {
    try {
      let url = `/notes/${groupId}`;
      if (parentId) url += `?parentId=${parentId}`;
      const data = await apiFetch(url);

      const notes = data?.notes || [];
      if (!notes.length) {
        notesList.innerText = "No notes found.";
        return;
      }

      notesList.innerHTML = notes
        .map((n) => {
          const badgeClass =
            n.type === "folder"
              ? "badge-folder"
              : n.type === "pdf"
              ? "badge-pdf"
              : n.type === "ppt"
              ? "badge-ppt"
              : "badge-link";

          return `
          <div class="note-item" data-id="${n._id}" data-type="${n.type}" data-title="${n.title}" data-url="${n.url || ""}">
            <div class="note-header">
              <h3>${n.title}</h3>
              <span class="note-badge ${badgeClass}">
                ${n.type}
              </span>
            </div>
            <small>${n.type === "folder" ? "Folder" : "File"}</small>
          </div>`;
        })
        .join("");

      // ✅ Click handling
      document.querySelectorAll(".note-item").forEach((item) => {
        item.addEventListener("click", () => {
          const type = item.dataset.type;
          const id = item.dataset.id;
          const title = item.dataset.title;
          const url = item.dataset.url;

          if (type === "folder") {
            currentParentId = id;
            navStack.push({ id, title });
            updateBreadcrumbs();
            loadNotes(groupId, currentParentId);
          } else if (url) {
            window.open(url, "_blank");
          }
        });
      });
    } catch (err) {
      console.error("Error loading notes:", err);
      notesList.innerText = "Failed to load notes.";
    }
  }

  // 🔹 Breadcrumbs
  function updateBreadcrumbs() {
    if (navStack.length === 0) {
      breadcrumbs.innerHTML = `Root`;
      return;
    }

    breadcrumbs.innerHTML =
      `Root → ` +
      navStack
        .map(
          (n, idx) =>
            `<span class="crumb" data-index="${idx}">${n.title}</span>`
        )
        .join(" → ");

    document.querySelectorAll(".crumb").forEach((crumb) => {
      crumb.addEventListener("click", () => {
        const idx = parseInt(crumb.dataset.index);
        navStack = navStack.slice(0, idx + 1);
        currentParentId = navStack[idx].id;
        updateBreadcrumbs();
        loadNotes(groupId, currentParentId);
      });
    });
  }
});
