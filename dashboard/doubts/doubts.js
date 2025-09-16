window.addEventListener("DOMContentLoaded", () => {
  const groupId = localStorage.getItem("groupId");
  const doubtsList = document.getElementById("doubtsList");
  const askForm = document.getElementById("addDoubtForm");

  if (!groupId) {
    doubtsList.innerText = "No group found. Please join a group first.";
    return;
  }

  // Load doubts on page load
  loadDoubts(groupId);

  // Handle add doubt form
  askForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Not logged in!");

    const formData = new FormData();
    formData.append("title", document.getElementById("doubtTitle").value);
    formData.append("description", document.getElementById("doubtDescription").value);

    const file = document.getElementById("doubtImage").files[0];
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
      loadDoubts(groupId);

      // Close overlay after submit
      document.getElementById("addDoubtOverlay").classList.remove("show");
    } catch (err) {
      console.error("Error asking doubt:", err);
      alert("Failed to submit doubt.");
    }
  });

  // FAB overlay logic
  const fab = document.getElementById("fabAddDoubt");
  const addOverlay = document.getElementById("addDoubtOverlay");
  if (fab && addOverlay) {
    const overlayClose = addOverlay.querySelector(".close");

    fab.addEventListener("click", () => {
      addOverlay.classList.toggle("show");
    });

    overlayClose.addEventListener("click", () => {
      addOverlay.classList.remove("show");
    });

    // Close when clicking outside overlay
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
});

// Fetch and render doubts
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
        <h3>${d.title}</h3>
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
    <small>
      By ${doubt.userId?.username || "Unknown"} on 
      ${new Date(doubt.createdAt).toLocaleString()}
    </small>
    <p>Status: ${doubt.answered ? "✅ Answered" : "❓ Not Answered"}</p>
  `;

  modal.classList.add("show");
}

// Close doubt detail modal
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("close") || e.target.classList.contains("modal")) {
    e.target.closest(".modal").classList.remove("show");
  }
});
