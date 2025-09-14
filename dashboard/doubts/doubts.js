window.addEventListener("DOMContentLoaded", () => {
  const groupId = localStorage.getItem("groupId");
  const doubtsList = document.getElementById("doubtsList");
  const askForm = document.getElementById("askDoubtForm");

  if (!groupId) {
    doubtsList.innerText = "No group found. Please join a group first.";
    return;
  }

  // ✅ Load doubts on page load
  loadDoubts(groupId);

  // ✅ Handle ask doubt form
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
        headers: { Authorization: `Bearer ${token}` }, // ✅ Only auth header, let browser set Content-Type
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit doubt");
      await res.json();

      askForm.reset();
      loadDoubts(groupId); // refresh after submit
    } catch (err) {
      console.error("Error asking doubt:", err);
      alert("Failed to submit doubt.");
    }
  });
});

// 🔹 Fetch and render doubts
async function loadDoubts(groupId) {
  const doubtsList = document.getElementById("doubtsList");
  try {
    const doubts = await apiFetch(`/doubts/groups/${groupId}/doubts`);
    if (!doubts || doubts.length === 0) {
      doubtsList.innerText = "No doubts found.";
      return;
    }

    doubtsList.innerHTML = doubts.map(d => `
      <div class="doubt-card">
        <h3>${d.title}</h3>
        <p>${d.description}</p>
        ${d.imageUrl ? `<img src="${d.imageUrl}" alt="Doubt image" style="max-width:200px;">` : ""}
        <small>By ${d.userId?.username || "Unknown"} on ${new Date(d.createdAt).toLocaleString()}</small>
        <p>Status: ${d.answered ? "✅ Answered" : "❓ Not Answered"}</p>
        
        ${d.answers.length > 0 
          ? `<h4>Answers:</h4>
             <ul>
               ${d.answers.map(a => `
                 <li>
                   ${a.text}
                   ${a.imageUrl ? `<br><img src="${a.imageUrl}" style="max-width:150px;">` : ""}
                   <em>- by ${a.createdBy?.username || "Unknown"}</em>
                 </li>`).join("")}
             </ul>`
          : "<p>No answers yet.</p>"
        }
      </div>
    `).join("");
  } catch (err) {
    console.error("Error loading doubts:", err);
    doubtsList.innerText = "Failed to load doubts.";
  }
}
