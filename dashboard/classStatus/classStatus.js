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

    if (!timetable || timetable.length === 0) {
      setStatus("ongoing", "None", "status-none");
      setStatus("upcoming", "None", "status-none");
      return;
    }

    const now = new Date();
    let ongoing = null;
    let upcoming = null;

    for (let cls of timetable) {
      const { start, end } = parseTimeRange(cls.time);

      if (now >= start && now < end) {
        ongoing = cls;
      } else if (now < start && !upcoming) {
        upcoming = cls;
      }
    }

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

  } catch (err) {
    console.error("ClassStatus error:", err);
    setStatus("ongoing", "Error", "status-none");
    setStatus("upcoming", "-", "status-none");
  }
}

// Run on load + auto refresh every minute
document.addEventListener("DOMContentLoaded", () => {
  loadClassStatus();
});
