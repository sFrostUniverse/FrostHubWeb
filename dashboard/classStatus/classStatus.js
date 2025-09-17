function parseTimeRange(timeStr) {
  const [start, end] = timeStr.split("-");
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return {
    start: new Date(`${today}T${start}:00`),
    end: new Date(`${today}T${end}:00`)
  };
}

// Helper: update the badge inside ongoing/upcoming row
function setStatus(id, text, type) {
  const row = document.getElementById(id);
  if (!row) return;

  const badge = row.querySelector(".status-badge");
  if (!badge) return;

  badge.textContent = text;
  badge.className = `status-badge ${type}`;
}

async function loadClassStatus() {
  const groupId = localStorage.getItem("groupId");
  if (!groupId) return;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  try {
    const timetable = await apiFetch(`/groups/${groupId}/timetable?day=${today.toLowerCase()}`);

    const classesList = document.getElementById("classesList");
    if (!timetable || timetable.length === 0) {
      setStatus("ongoing", "None", "status-none");
      setStatus("upcoming", "None", "status-none");
      if (classesList) classesList.innerText = "No classes scheduled today!";
      return;
    }

    const now = new Date();
    let ongoing = null;
    let upcoming = null;

    // Find ongoing & next upcoming
    for (let cls of timetable) {
      const { start, end } = parseTimeRange(cls.time);
      if (now >= start && now < end) {
        ongoing = cls;
      } else if (now < start && !upcoming) {
        upcoming = cls;
      }
    }

    // Update status badges
    if (ongoing) {
      const [startTime] = ongoing.time.split("-");
      setStatus("ongoing", `${ongoing.subject} (${startTime})`, "status-ongoing");
    } else {
      setStatus("ongoing", "None", "status-none");
    }

    if (upcoming) {
      const [startTime] = upcoming.time.split("-");
      setStatus("upcoming", `${upcoming.subject} at ${startTime}`, "status-upcoming");
    } else {
      setStatus("upcoming", "None", "status-none");
    }

    // Render today’s classes list (excluding ongoing one)
    if (classesList) {
      classesList.innerHTML = "";
      timetable.forEach(cls => {
        const { start, end } = parseTimeRange(cls.time);
        let status = "Past";
        let badgeClass = "status-past";

        if (now >= start && now <= end) {
          status = "Ongoing";
          badgeClass = "status-ongoing";
        } else if (start > now) {
          status = "Upcoming";
          badgeClass = "status-upcoming";
        }

        // Skip ongoing class in the list (already shown above)
        if (status === "Ongoing") return;

        const div = document.createElement("div");
        div.classList.add("class-item");
        div.innerHTML = `
          <div class="class-info">
            <strong>${cls.subject}</strong>
            <small>${cls.teacher} • ${cls.time}</small>
          </div>
          <span class="status-badge ${badgeClass}">${status}</span>
        `;
        classesList.appendChild(div);
      });
    }

  } catch (err) {
    console.error("ClassStatus error:", err);
    setStatus("ongoing", "Error", "status-none");
    setStatus("upcoming", "-", "status-none");
    const classesList = document.getElementById("classesList");
    if (classesList) classesList.innerText = "Failed to load today’s classes";
  }
}

// Run on load + auto refresh every minute
document.addEventListener("DOMContentLoaded", () => {
  loadClassStatus();
  setInterval(loadClassStatus, 60000);
});
