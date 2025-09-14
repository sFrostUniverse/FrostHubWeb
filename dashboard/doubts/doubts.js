window.addEventListener("DOMContentLoaded", async () => {
  const doubtsList = document.getElementById("doubtsList");
  const groupId = localStorage.getItem("groupId");

  if (!groupId) {
    doubtsList.innerText = "No group found. Please join a group first.";
    return;
  }

  try {
    const doubts = await apiFetch(`/doubts/groups/${groupId}/doubts`);
    console.log("Fetched doubts:", doubts);

    if (!doubts || doubts.length === 0) {
      doubtsList.innerText = "No doubts found.";
      return;
    }

    doubtsList.innerHTML = doubts
      .map(d => {
        const answersHtml =
          d.answers.length > 0
            ? `<ul>${d.answers
                .map(
                  a =>
                    `<li>${a.text} <em>- by ${a.createdBy?.username || "Unknown"}</em></li>`
                )
                .join("")}</ul>`
            : "<p>No answers yet</p>";

        return `
          <div class="doubt-card">
            <h3>${d.title}</h3>
            <p>${d.description}</p>
            <small>By ${d.userId?.username || "Unknown"} on ${new Date(
          d.createdAt
        ).toLocaleString()}</small>
            <p>Status: ${d.answered ? "✅ Answered" : "❓ Not Answered"}</p>
            ${answersHtml}
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading doubts:", err);
    doubtsList.innerText = "Failed to load doubts.";
  }
});
