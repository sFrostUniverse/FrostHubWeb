function parseTimeRange(timeStr) {
  const [start, end] = timeStr.split("-");
  const today = new Date().toISOString().split("T")[0];
  return {
    start: new Date(`${today}T${start}:00`),
    end: new Date(`${today}T${end}:00`)
  };
}

async function loadTodayClasses() {
  const groupId = localStorage.getItem("groupId");
  if (!groupId) return;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  try {
    const timetable = await apiFetch(`/groups/${groupId}/timetable?day=${today.toLowerCase()}`);
    const now = new Date();

    const remaining = timetable.filter(cls => parseTimeRange(cls.time).start > now);
    const classesList = document.getElementById("classesList");

    if (!remaining || remaining.length === 0) {
      classesList.innerText = "No classes left today!";
      return;
    }

    classesList.innerHTML = `
      <p>${remaining.length} classes left today:</p>
      <ul>
        ${remaining
          .map(cls => `<li>${cls.subject} at ${cls.time.split("-")[0]} in ${cls.teacher}</li>`)
          .join("")}
      </ul>
    `;
  } catch (err) {
    console.error("TodayClasses error:", err);
    document.getElementById("classesList").innerText = "Failed to load today’s classes";
  }
}
