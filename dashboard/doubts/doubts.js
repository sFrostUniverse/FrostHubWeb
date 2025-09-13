window.addEventListener("DOMContentLoaded", async () => {
  const doubtsList = document.getElementById("doubtsList");
  const groupId = localStorage.getItem("groupId");

  if (!groupId) {
    doubtsList.innerText = "No group found. Please join a group first.";
    return;
  }

  try {
    // Fetch doubts from backend
    const doubts = await apiFetch(`/doubts/groups/${groupId}/doubts`);

    if (!doubts || doubts.length === 0) {
      doubtsList.innerText = "No doubts found.";
      return;
    }

    doubtsList.innerHTML = `
      <ul>
        ${doubts
          .map(
            d => `
              <li>
                <strong>${d.title}</strong> - ${d.description} <br>
                <em>By: ${d.userId?.username || "Unknown"}</em>
                ${d.answered ? "✅ Answered" : "❓ Not Answered"}
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  } catch (err) {
    console.error("Error loading doubts:", err);
    doubtsList.innerText = "Failed to load doubts.";
  }
});
