window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const doubtId = params.get("id");
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

  async function loadDoubt() {
    try {
      const doubt = await apiFetch(`/doubts/${doubtId}`);

      titleEl.innerText = doubt.title;
      descEl.innerText = doubt.description;
      metaEl.innerText = `By ${doubt.userId?.username || "Unknown"} on ${new Date(
        doubt.createdAt
      ).toLocaleString()}`;
      statusEl.innerText = doubt.answered ? "✅ Answered" : "❓ Not Answered";

      if (!doubt.answers || doubt.answers.length === 0) {
        answersList.innerText = "No answers yet.";
      } else {
        answersList.innerHTML = doubt.answers
          .map(
            (a) => `
            <div class="answer-card">
              <p>${a.text}</p>
              ${
                a.imageUrl
                  ? `<img src="${a.imageUrl}" alt="Answer image" style="max-width:200px;">`
                  : ""
              }
              <small>By ${a.createdBy?.username || "Unknown"} on ${new Date(
              a.createdAt
            ).toLocaleString()}</small>
            </div>
          `
          )
          .join("");
      }
    } catch (err) {
      console.error("Error loading doubt:", err);
      titleEl.innerText = "Failed to load doubt.";
    }
  }

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
