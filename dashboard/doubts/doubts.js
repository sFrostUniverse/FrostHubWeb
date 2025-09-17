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

  // ---- Drag & Drop (Add Doubt) ----
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
        showFilePreview(fileInput.files[0], filePreview);
      }
    });
    fileInput.addEventListener("change", () => {
      if (fileInput.files[0]) showFilePreview(fileInput.files[0], filePreview);
    });
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
          const doubtId = item.dataset.id;
          toggleDoubtDetails(doubtId, item);
        });
      });

  } catch (err) {
    console.error("Error loading doubts:", err);
    doubtsList.innerText = "Failed to load doubts.";
  }
}

// ================== Shared File Preview ==================
function showFilePreview(file, targetEl) {
  const sizeKB = (file.size / 1024).toFixed(1);
  targetEl.innerHTML = `
    <p style="animation: fadeIn 0.3s;">
      <i class="fa-solid fa-file"></i> ${file.name} <small>(${sizeKB} KB)</small>
    </p>
  `;
}
// ================== Inline Doubt Details ==================
async function toggleDoubtDetails(doubtId, itemEl) {
  const userId = localStorage.getItem("userId");

  // Check if already rendered
  let detailsEl = itemEl.querySelector(".doubt-details");
  // Close any other open details
  document.querySelectorAll(".doubt-details").forEach(el => {
    if (el !== detailsEl) el.remove();
  });

  if (detailsEl) {
      detailsEl.classList.toggle("show");
      return;
    }


  // Create container
  detailsEl = document.createElement("div");
  detailsEl.className = "doubt-details";
  detailsEl.innerHTML = "<p>Loading...</p>";
  itemEl.appendChild(detailsEl);

  try {
    const doubt = await apiFetch(`/doubts/${doubtId}`);

    detailsEl.innerHTML = `
      <p>${doubt.description}</p>
      ${doubt.imageUrl ? `<img src="${doubt.imageUrl}" alt="Doubt image" style="max-width:100%;margin-top:10px;">` : ""}
      <small>By ${doubt.userId?.username || "Unknown"} • ${new Date(doubt.createdAt).toLocaleString()}</small>
      <p>Status: ${doubt.answered 
        ? '<span class="status-badge status-answered">Answered</span>' 
        : '<span class="status-badge status-pending">Not Answered</span>'}</p>

      <h3>Answers</h3>
      <div class="answers-list">${doubt.answers?.length ? "" : "No answers yet."}</div>

      <form class="answer-form" enctype="multipart/form-data">
        <textarea placeholder="Your answer..." required></textarea>
        <input type="file" accept="image/*" class="answer-image" style="margin-top:0.5rem;">
        <button type="submit"><i class="fa-solid fa-paper-plane"></i> Submit Answer</button>
      </form>

      ${doubt.userId?._id === userId 
        ? `<button class="delete-doubt-btn">Delete Doubt</button>` 
        : ""}
      
      <button class="go-back-btn"><i class="fa-solid fa-arrow-left"></i> Go Back</button>

    `;

    // Render answers
    const answersList = detailsEl.querySelector(".answers-list");
    if (doubt.answers?.length) {
      answersList.innerHTML = doubt.answers.map(a => `
        <div class="answer-card">
          <p>${a.text}</p>
          ${a.imageUrl ? `<img src="${a.imageUrl}" alt="Answer image">` : ""}
          <small>By ${a.createdBy?.username || "Unknown"} • ${new Date(a.createdAt).toLocaleString()}</small>
        </div>
      `).join("");
    }

    // Submit new answer
    const answerForm = detailsEl.querySelector(".answer-form");
    const answerImage = detailsEl.querySelector(".answer-image");
    answerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      if (!token) return alert("Not authenticated.");

      const formData = new FormData();
      formData.append("text", answerForm.querySelector("textarea").value);
      if (answerImage.files[0]) formData.append("image", answerImage.files[0]);

      try {
        const res = await fetch(`${API_BASE}/doubts/${doubtId}/add-answer`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to submit answer");

        // ✅ fetch updated answers only
        const updated = await apiFetch(`/doubts/${doubtId}`);

        answersList.innerHTML = updated.answers.map(a => `
          <div class="answer-card">
            <p>${a.text}</p>
            ${a.imageUrl ? `<img src="${a.imageUrl}" alt="Answer image">` : ""}
            <small>By ${a.createdBy?.username || "Unknown"} • ${new Date(a.createdAt).toLocaleString()}</small>
          </div>
        `).join("");

        answerForm.reset(); // clear the form
        answerImage.value = ""; // clear image input too

        } 
        catch (err) {
          console.error("Error submitting answer:", err);
          alert("Failed to submit answer.");
        }

    });

    // Delete doubt
    const deleteBtn = detailsEl.querySelector(".delete-doubt-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Delete this doubt?")) return;
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`${API_BASE}/doubts/${doubtId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to delete doubt");
          alert("Doubt deleted!");
          itemEl.remove();
        } catch (err) {
          console.error("Error deleting doubt:", err);
          alert("Failed to delete doubt.");
        }
      });
    }
    // Go back button
    const backBtn = detailsEl.querySelector(".go-back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        detailsEl.remove();
      });
    }

    


  } catch (err) {
    console.error("Error loading doubt:", err);
    detailsEl.innerHTML = "<p>Failed to load details.</p>";
  }
}

