function parseTimeRange(timeStr) {
  const [start, end] = timeStr.split("-");
  return {
    start: new Date(`1970-01-01T${start}`),
    end: new Date(`1970-01-01T${end}`)
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

    if (remaining.length === 0) {
      classesList.innerText = "No classes left today!";
      return;
    }

    classesList.innerHTML = `
      <p>${remaining.length} classes left today:</p>
      <ul>
        ${remaining
          .map(
            cls =>
              `<li>${cls.subject} at ${cls.time.split("-")[0]} in ${cls.teacher}</li>`
          )
          .join("")}
      </ul>
    `;
  } catch (err) {
    console.error("TodayClasses error:", err);
  }
}
