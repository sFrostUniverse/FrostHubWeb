// ================== DOUBTS PAGE ==================
window.addEventListener("DOMContentLoaded", () => {
  const groupId = localStorage.getItem("groupId");
  const doubtsList = document.getElementById("doubtsList");
  const askForm = document.getElementById("addDoubtForm");
  const fab = document.getElementById("fabAddDoubt");
  const addOverlay = document.getElementById("addDoubtOverlay");
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("doubtImage");
  const filePreview = document.getElementById("filePreview");

  if (!groupId) {
    doubtsList.innerText = "No group found. Please join a group first.";
    return;
  }

  // Load doubts on page load
  loadDoubts(groupId);

  // ---- Add Doubt form submit ----
  askForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Not logged in!");

    const formData = new FormData();
    formData.append("title", document.getElementById("doubtTitle").value);
    formData.append("description", document.getElementById("doubtDescription").value);
    const file = fileInput.files[0];
    if (file) formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/doubts/groups/${groupId}/doubts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit doubt");
      await res.json();

      askForm.reset();
      filePreview.innerHTML = "";
      loadDoubts(groupId);

      addOverlay.classList.remove("show"); // close overlay
    } catch (err) {
      console.error("Error asking doubt:", err);
      alert("Failed to submit doubt.");
    }
  });

  // ---- FAB toggle ----
  if (fab && addOverlay) {
    const overlayClose = addOverlay.querySelector(".close");

    fab.addEventListener("click", (e) => {
      e.stopPropagation();
      addOverlay.classList.toggle("show");
    });

    overlayClose.addEventListener("click", () => {
      addOverlay.classList.remove("show");
    });

    addOverlay.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", (e) => {
      if (
        addOverlay.classList.contains("show") &&
        !addOverlay.contains(e.target) &&
        e.target !== fab
      ) {
        addOverlay.classList.remove("show");
      }
    });
  }

  // ---- Drag & Drop ----
  if (dropZone) {
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragging");
    });
    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragging");
    });
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragging");
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        showFilePreview(fileInput.files[0]);
      }
    });
    fileInput.addEventListener("change", () => {
      if (fileInput.files[0]) showFilePreview(fileInput.files[0]);
    });
  }

  function showFilePreview(file) {
    const sizeKB = (file.size / 1024).toFixed(1);
    filePreview.innerHTML = `
      <p style="animation: fadeIn 0.3s;">
        <i class="fa-solid fa-file"></i> ${file.name} <small>(${sizeKB} KB)</small>
      </p>
    `;
  }
});

// ================== Load Doubts ==================
async function loadDoubts(groupId) {
  const doubtsList = document.getElementById("doubtsList");
  try {
    const doubts = await apiFetch(`/doubts/groups/${groupId}/doubts`);
    if (!doubts || doubts.length === 0) {
      doubtsList.innerText = "No doubts found.";
      return;
    }

    doubtsList.innerHTML = doubts
      .map(
        (d) => `
        <div class="doubt-item" data-id="${d._id}">
          <div class="doubt-header">
            <h3>${d.title}</h3>
            <span class="status-badge ${
              d.answered ? "status-answered" : "status-pending"
            }">${d.answered ? "Answered" : "Not Answered"}</span>
          </div>
          <p>${d.description.length > 100 ? d.description.slice(0, 100) + "..." : d.description}</p>
          <small>
            By ${d.userId?.username || "Unknown"} • 
            ${new Date(d.createdAt).toLocaleString()}
          </small>
        </div>
      `
      )
      .join("");

    document.querySelectorAll(".doubt-item").forEach((item) => {
      item.addEventListener("click", () => {
        const doubtId = item.getAttribute("data-id");
        openDoubtModal(doubtId);
      });
    });
  } catch (err) {
    console.error("Error loading doubts:", err);
    doubtsList.innerText = "Failed to load doubts.";
  }
}

// ================== Doubt Modal ==================
async function openDoubtModal(doubtId) {
  const modal = document.getElementById("doubtDetailModal");
  const content = document.getElementById("doubtDetailContent");
  const userId = localStorage.getItem("userId");

  modal.classList.remove("hidden");
  content.innerHTML = "<p>Loading...</p>";

  try {
    const doubt = await apiFetch(`/doubts/${doubtId}`);

    content.innerHTML = `
      <h2>${doubt.title}</h2>
      <p>${doubt.description}</p>
      ${
        doubt.imageUrl
          ? `<img src="${doubt.imageUrl}" alt="Doubt image" style="max-width:100%;margin-top:10px;">`
          : ""
      }
      <small>By ${doubt.userId?.username || "Unknown"} on ${new Date(
      doubt.createdAt
    ).toLocaleString()}</small>
      <p>Status: ${
        doubt.answered
          ? '<span class="status-badge status-answered">Answered</span>'
          : '<span class="status-badge status-pending">Not Answered</span>'
      }</p>

      <h3>Answers</h3>
      <div id="answersList">${
        doubt.answers?.length ? "" : "No answers yet."
      }</div>

      <form id="answerForm" enctype="multipart/form-data">
        <textarea id="answerText" placeholder="Your answer..." required></textarea>
        <input type="file" id="answerImage" accept="image/*" />
        <button type="submit">Submit Answer</button>
      </form>

      <button id="deleteDoubtBtn" style="display:none;color:white;background:red;margin-top:10px;">
        Delete Doubt
      </button>
    `;

    // Show delete button if owner
    if (doubt.userId?._id === userId) {
      document.getElementById("deleteDoubtBtn").style.display = "inline-block";
    }

    // Render answers
    const answersList = document.getElementById("answersList");
    if (doubt.answers?.length) {
      answersList.innerHTML = doubt.answers
        .map(
          (a) => `
          <div class="answer-card" data-id="${a._id}">
            <p>${a.text}</p>
            ${
              a.imageUrl
                ? `<img src="${a.imageUrl}" alt="Answer image" style="max-width:200px;">`
                : ""
            }
            <small>By ${a.createdBy?.username || "Unknown"} on ${new Date(
            a.createdAt
          ).toLocaleString()}</small>
            ${
              a.createdBy?._id === userId || doubt.userId?._id === userId
                ? `<button class="delete-answer-btn" data-id="${a._id}" style="color:white;background:red;">Delete Answer</button>`
                : ""
            }
          </div>
        `
        )
        .join("");

      // Delete answer
      answersList.querySelectorAll(".delete-answer-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("Delete this answer?")) return;
          const token = localStorage.getItem("token");
          try {
            const res = await fetch(`${API_BASE}/doubts/answers/${btn.dataset.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete answer");
            openDoubtModal(doubtId); // reload modal
          } catch (err) {
            console.error("Error deleting answer:", err);
            alert("Failed to delete answer.");
          }
        });
      });
    }

    // Submit answer
    document.getElementById("answerForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not authenticated. Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("text", document.getElementById("answerText").value);
      const file = document.getElementById("answerImage").files[0];
      if (file) formData.append("image", file);

      try {
        const res = await fetch(`${API_BASE}/doubts/${doubtId}/add-answer`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to submit answer");
        openDoubtModal(doubtId); // reload modal
      } catch (err) {
        console.error("Error submitting answer:", err);
        alert("Failed to submit answer.");
      }
    });

    // Delete doubt
    document.getElementById("deleteDoubtBtn").addEventListener("click", async () => {
      if (!confirm("Are you sure you want to delete this doubt?")) return;
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE}/doubts/${doubtId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete doubt");
        alert("Doubt deleted!");
        modal.classList.add("hidden");
        loadDoubts(localStorage.getItem("groupId")); // refresh list
      } catch (err) {
        console.error("Error deleting doubt:", err);
        alert("Failed to delete doubt.");
      }
    });

  } catch (err) {
    console.error("Error loading doubt:", err);
    content.innerHTML = "<p>Failed to load doubt details.</p>";
  }
}

// Close modal
document.querySelector("#doubtDetailModal .close").addEventListener("click", () => {
  document.getElementById("doubtDetailModal").classList.add("hidden");
});
