// total.js (Frontend)

async function loadAttendance() {
  try {
    const res = await fetch("http://localhost:1900/api/attendance"); // API call
    const data = await res.json();
    console.log("Attendance Data:", data);

    // Loop through tables
    Object.keys(data).forEach(tableName => {
      const row = document.getElementById(tableName);
      if (row) {
        row.querySelector(".total").innerText = data[tableName].total;
        row.querySelector(".present").innerText = data[tableName].present;
        row.querySelector(".absent").innerText = data[tableName].absent;
        row.querySelector(".percent").innerText = data[tableName].percent + "%";
      }
    });
  } catch (err) {
    console.error("Error fetching attendance:", err);
  }
}

// Run when page loads
document.addEventListener("DOMContentLoaded", loadAttendance);
