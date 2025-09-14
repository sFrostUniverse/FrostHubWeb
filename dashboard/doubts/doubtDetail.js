window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const doubtId = params.get("id");
  const userId = localStorage.getItem("userId");

  if (!doubtId) {
    alert("No doubt selected");
    window.location.href = "doubts.html";
    return;
  }

  const titleEl = document.getElementById("doubtTitle");
  const descEl = document.getElementById("doubtDescription");
  const metaEl = document.getElementById("doubtMeta");
  const statusEl = document.getElementById("doubtStatus");
  const answersList = document.getElementById("answersList");
  const answerForm = document.getElementById("answerForm");
  const deleteDoubtBtn = document.getElementById("deleteDoubtBtn");

  async function loadDoubt() {
    try {
      const doubt = await apiFetch(`/doubts/${doubtId}`);

      titleEl.innerText = doubt.title;
      descEl.innerText = doubt.description;
      metaEl.innerText = `By ${doubt.userId?.username || "Unknown"} on ${new Date(
        doubt.createdAt
      ).toLocaleString()}`;
      statusEl.innerText = doubt.answered ? "✅ Answered" : "❓ Not Answered";

      // Show delete button only if this user is the doubt owner
      if (doubt.userId?._id === userId) {
        deleteDoubtBtn.style.display = "inline-block";
      }

      if (!doubt.answers || doubt.answers.length === 0) {
        answersList.innerText = "No answers yet.";
      } else {
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

        // Attach delete answer handlers
        document.querySelectorAll(".delete-answer-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            if (!confirm("Delete this answer?")) return;
            const token = localStorage.getItem("token");
            try {
              const res = await fetch(`${API_BASE}/doubts/answers/${btn.dataset.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) throw new Error("Failed to delete answer");
              await loadDoubt(); // refresh list
            } catch (err) {
              console.error("Error deleting answer:", err);
              alert("Failed to delete answer.");
            }
          });
        });
      }
    } catch (err) {
      console.error("Error loading doubt:", err);
      titleEl.innerText = "Failed to load doubt.";
    }
  }

  // Delete doubt handler
  deleteDoubtBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete this doubt?")) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/doubts/${doubtId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete doubt");
      alert("Doubt deleted!");
      window.location.href = "doubts.html";
    } catch (err) {
      console.error("Error deleting doubt:", err);
      alert("Failed to delete doubt.");
    }
  });

  // Submit answer handler
  answerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authenticated. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("text", document.getElementById("answerText").value);
    const imageFile = document.getElementById("answerImage").files[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch(`${API_BASE}/doubts/${doubtId}/add-answer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit answer");
      await res.json();

      document.getElementById("answerText").value = "";
      document.getElementById("answerImage").value = "";
      await loadDoubt();
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("Failed to submit answer");
    }
  });

  await loadDoubt();
});
