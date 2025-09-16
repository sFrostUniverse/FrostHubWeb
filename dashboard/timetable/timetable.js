window.addEventListener("DOMContentLoaded", () => {
  const groupId = localStorage.getItem("groupId");
  const timetableContainer = document.getElementById("timetableContainer");

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  if (!groupId) {
    timetableContainer.innerText = "No group found. Please join a group first.";
    return;
  }

  // ✅ Load timetable as a table
  loadWeeklyTimetable(groupId);

  async function loadWeeklyTimetable(groupId) {
    try {
      // Fetch ALL timetable entries
      const allEntries = await apiFetch(`/groups/${groupId}/timetable`);

      if (!allEntries || allEntries.length === 0) {
        timetableContainer.innerHTML = "<p>No timetable found.</p>";
        return;
      }

      // Group by day
      const byDay = {};
      days.forEach((d) => (byDay[d] = []));
      allEntries.forEach((e) => {
        if (byDay[e.day]) byDay[e.day].push(e);
      });

      // Collect unique time slots
      const allTimes = [
        ...new Set(allEntries.map((e) => e.time).sort()),
      ];

      // Build table
      let html = `
        <table class="timetable">
          <thead>
            <tr>
              <th>Time</th>
              ${days.map((d) => `<th>${capitalize(d)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
      `;

      allTimes.forEach((time) => {
        html += `<tr><td class="time-slot">${time}</td>`;
        days.forEach((day) => {
          const entry = byDay[day].find((e) => e.time === time);
          html += `<td>${entry ? `<strong>${entry.subject}</strong><br><em>${entry.teacher}</em>` : "-"}</td>`;
        });
        html += `</tr>`;
      });

      html += `</tbody></table>`;

      timetableContainer.innerHTML = html;
    } catch (err) {
      console.error("Error loading timetable:", err);
      timetableContainer.innerHTML = "<p>Failed to load timetable.</p>";
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
