function parseTimeRange(timeStr) {
  const [start, end] = timeStr.split("-");
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return {
    start: new Date(`${today}T${start}:00`),
    end: new Date(`${today}T${end}:00`)
  };
}

async function loadClassStatus() {
  const groupId = localStorage.getItem("groupId");
  if (!groupId) return;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  try {
    const timetable = await apiFetch(`/groups/${groupId}/timetable?day=${today.toLowerCase()}`);

    if (!timetable || timetable.length === 0) {
      document.getElementById("ongoing").innerText = "No classes scheduled today";
      document.getElementById("upcoming").innerText = "";
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

    document.getElementById("ongoing").innerText =
      ongoing
        ? `Ongoing: ${ongoing.subject} (${ongoing.time}) in ${ongoing.teacher}`
        : "No ongoing class";

    document.getElementById("upcoming").innerText =
      upcoming
        ? `Upcoming: ${upcoming.subject} at ${upcoming.time.split("-")[0]} in ${upcoming.teacher}`
        : "No more classes today";

  } catch (err) {
    console.error("ClassStatus error:", err);
    document.getElementById("ongoing").innerText = "Failed to load class status";
    document.getElementById("upcoming").innerText = "";
  }
}
