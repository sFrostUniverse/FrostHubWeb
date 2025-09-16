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
    const classesList = document.getElementById("classesList");

    if (!timetable || timetable.length === 0) {
      classesList.innerText = "No classes scheduled today!";
      return;
    }

    const now = new Date();
    classesList.innerHTML = ""; // clear old

    const ul = document.createElement("ul");
    timetable.forEach(cls => {
      const { start, end } = parseTimeRange(cls.time);

      let status = "Past";
      let badgeClass = "status-none";

      if (now >= start && now <= end) {
        status = "Ongoing";
        badgeClass = "status-ongoing";
      } else if (start > now) {
        status = "Upcoming";
        badgeClass = "status-upcoming";
      }

      const li = document.createElement("li");
      li.classList.add("class-item"); // matches CSS

      li.innerHTML = `
        <div class="class-info">
          <strong>${cls.subject}</strong>
          <small>${cls.teacher} • ${cls.time}</small>
        </div>
        <span class="status-badge ${badgeClass}">${status}</span>
      `;

      ul.appendChild(li);
    });

    classesList.appendChild(ul);

  } catch (err) {
    console.error("TodayClasses error:", err);
    document.getElementById("classesList").innerText = "Failed to load today’s classes";
  }
}

