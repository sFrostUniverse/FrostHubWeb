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

      notesList.classList.remove("fade-in"); // reset old state
      notesList.classList.add("fade-out", "loading");


      let url = `/notes/${groupId}`;
      if (parentId) url += `?parentId=${parentId}`;
      const data = await apiFetch(url);

      const notes = data?.notes || [];

      setTimeout(() => {
        // After small delay, replace content
        if (!notes.length) {
          notesList.innerHTML = "<p>No notes found.</p>";
        } else {
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
                    <span class="note-badge ${badgeClass}">${n.type}</span>
                  </div>
                  <small>${n.type === "folder" ? "Folder" : "File"}</small>
                </div>`;
            })
            .join("");
        }

        // Fade in
        notesList.classList.remove("fade-out", "loading");
        notesList.classList.add("fade-in");

        // Attach click events
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

      }, 200); // 🔹 small delay so fade-out runs
    } catch (err) {
      console.error("Error loading notes:", err);
      notesList.innerHTML = "<p>Failed to load notes.</p>";
      notesList.classList.remove("fade-out", "loading");
    }
  }


  // 🔹 Breadcrumbs
    function updateBreadcrumbs() {
    // Root only
    if (navStack.length === 0) {
      breadcrumbs.innerHTML = `Root`;
      return;
    }

    // Add back link
    breadcrumbs.innerHTML =
      `<span class="back-link">← Back</span>` +
      `Root → ` +
      navStack
        .map(
          (n, idx) =>
            `<span class="crumb" data-index="${idx}">${n.title}</span>`
        )
        .join(" → ");

    // Back button click
    const backBtn = breadcrumbs.querySelector(".back-link");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        navStack.pop(); // go one level back
        currentParentId = navStack.length > 0 ? navStack[navStack.length - 1].id : null;
        updateBreadcrumbs();
        loadNotes(groupId, currentParentId);
      });
    }

    // Crumb clicks
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
