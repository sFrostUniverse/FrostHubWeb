window.addEventListener("DOMContentLoaded", () => {
  const groupId = localStorage.getItem("groupId");
  const notesList = document.getElementById("notesList");
  const addForm = document.getElementById("addNoteForm");
  const breadcrumbs = document.getElementById("breadcrumbs");

  let currentParentId = null; // track folder navigation
  let navStack = []; // for breadcrumbs

  if (!groupId) {
    notesList.innerText = "No group found. Please join a group first.";
    return;
  }

  // ✅ Load root notes on page load
  loadNotes(groupId, currentParentId);

  // ✅ Handle add note form
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Not logged in!");

    const title = document.getElementById("noteTitle").value;
    const type = document.getElementById("noteType").value;
    const url = document.getElementById("noteUrl").value;

    try {
      const res = await fetch(`${API_BASE}/notes/${groupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          type,
          url: type === "folder" ? null : url,
          parentId: currentParentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to add note");
      await res.json();

      addForm.reset();
      loadNotes(groupId, currentParentId); // refresh list
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to add note.");
    }
  });

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
        .map(
          (n) => `
        <div class="note-card" data-id="${n._id}">
          <h3>
            ${n.type === "folder" ? "📁" : "📄"} ${n.title}
          </h3>
          ${
            n.type !== "folder" && n.url
              ? `<a href="${n.url}" target="_blank">Open File</a>`
              : ""
          }
          ${
            n.type === "folder"
              ? `<button class="open-btn" data-id="${n._id}" data-title="${n.title}">Open</button>`
              : ""
          }
        </div>
      `
        )
        .join("");

      // ✅ Attach listeners for folder open
      document.querySelectorAll(".open-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentParentId = btn.dataset.id;
          navStack.push({ id: currentParentId, title: btn.dataset.title });
          updateBreadcrumbs();
          loadNotes(groupId, currentParentId);
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

    breadcrumbs.innerHTML = `Root → ` + navStack
      .map(
        (n, idx) =>
          `<span class="crumb" data-index="${idx}">${n.title}</span>`
      )
      .join(" → ");

    // ✅ Click breadcrumb to go back
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
