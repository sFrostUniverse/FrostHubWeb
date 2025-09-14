window.addEventListener("DOMContentLoaded", () => {
  const groupId = localStorage.getItem("groupId");
  const timetableContainer = document.getElementById("timetableContainer");
  const addForm = document.getElementById("addTimetableForm");

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

  // ✅ Load timetable for all days
  loadWeeklyTimetable(groupId);

  // ✅ Handle add timetable form
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Not logged in!");

    const entry = {
      day: document.getElementById("day").value,
      subject: document.getElementById("subject").value,
      teacher: document.getElementById("teacher").value,
      time: document.getElementById("time").value,
    };

    try {
      const res = await fetch(
        `${API_BASE}/timetable/groups/${groupId}/timetable`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(entry),
        }
      );

      if (!res.ok) throw new Error("Failed to add timetable entry");
      await res.json();

      addForm.reset();
      loadWeeklyTimetable(groupId); // refresh list
    } catch (err) {
      console.error("Error adding timetable entry:", err);
      alert("Failed to add entry.");
    }
  });

  // 🔹 Fetch and render timetable for all days
  async function loadWeeklyTimetable(groupId) {
    timetableContainer.innerHTML = "";

    for (const day of days) {
      try {
        const entries = await apiFetch(`/groups/${groupId}/timetable?day=${day}`);

        const daySection = document.createElement("div");
        daySection.classList.add("day-section");

        if (!entries || entries.length === 0) {
          daySection.innerHTML = `<h3>${capitalize(day)}</h3><p>No classes.</p>`;
        } else {
          const list = entries
            .map(
              (e) => `
            <div class="timetable-entry">
              <strong>${e.time}</strong> - ${e.subject} 
              <em>(${e.teacher})</em>
            </div>
          `
            )
            .join("");

          daySection.innerHTML = `<h3>${capitalize(day)}</h3>${list}`;
        }

        timetableContainer.appendChild(daySection);
      } catch (err) {
        console.error(`Error loading ${day} timetable:`, err);
      }
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
