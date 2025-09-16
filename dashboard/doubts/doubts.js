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

  // Add Doubt form submit
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

      // Close overlay
      addOverlay.classList.remove("show");
    } catch (err) {
      console.error("Error asking doubt:", err);
      alert("Failed to submit doubt.");
    }
  });

  // FAB toggle
  if (fab && addOverlay) {
    const overlayClose = addOverlay.querySelector(".close");
    
    fab.addEventListener("click", (e) => {
      e.stopPropagation();
      addOverlay.classList.toggle("show");
    });

    overlayClose.addEventListener("click", () => {
      addOverlay.classList.remove("show");
    });

    // prevent accidental close when clicking inside overlay
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

  // Drag & Drop
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

// Load doubts
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
        const doubt = doubts.find((x) => x._id === doubtId);
        showDoubtDetails(doubt);
      });
    });
  } catch (err) {
    console.error("Error loading doubts:", err);
    doubtsList.innerText = "Failed to load doubts.";
  }
}

// Doubt details modal
function showDoubtDetails(doubt) {
  const modal = document.getElementById("doubtDetailModal");
  const content = document.getElementById("doubtDetailContent");

  content.innerHTML = `
    <h2>${doubt.title}</h2>
    <p>${doubt.description}</p>
    ${
      doubt.imageUrl
        ? `<img src="${doubt.imageUrl}" alt="Doubt image" style="max-width:100%; margin-top:10px;">`
        : ""
    }
    <small>By ${doubt.userId?.username || "Unknown"} on ${new Date(
    doubt.createdAt
  ).toLocaleString()}</small>
    <p>Status: ${doubt.answered 
      ? '<span class="status-badge status-answered">Answered</span>' 
      : '<span class="status-badge status-pending">Not Answered</span>'}
    </p>
  `;

  modal.classList.add("show");

  // Escape key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.remove("show");
  });
}

// Close doubt detail modal
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("close") || e.target.classList.contains("modal")) {
    e.target.closest(".modal").classList.remove("show");
  }
});
