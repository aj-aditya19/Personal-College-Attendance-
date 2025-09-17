// total.js (Frontend)

async function loadAttendance() {
  let total_absent = 0, total_classes = 0, total_present = 0, total_percent = 0;
  try {
    const res = await fetch("http://localhost:1900/api/attendance"); // API call
    const data = await res.json();
    console.log("Attendance Data:", data);

    // Loop through tables
    Object.keys(data).forEach(tableName => {
      const row = document.getElementById(tableName);
      if (row) {
        row.querySelector(".total").innerText = data[tableName].total;
        total_classes += Number(data[tableName].total);

        row.querySelector(".present").innerText = data[tableName].present;
        total_present += Number(data[tableName].present);

        row.querySelector(".absent").innerText = data[tableName].absent;
        total_absent += Number(data[tableName].absent);
        
        row.querySelector(".percent").innerText = data[tableName].percent + "%";
        console.log(total_classes, total_present , total_absent)
      }
    });
    const total_show = document.querySelector("#total");
    total_show.querySelector(".total_class").innerText = total_classes;
    total_show.querySelector(".total_present").innerText = total_present;
    total_show.querySelector(".total_absent").innerText = total_absent;
    total_percent = (total_present*100)/total_classes;
    total_percent = parseFloat(total_percent.toFixed(2));
    total_show.querySelector(".total_percent").innerText = total_percent + "%";
  } catch (err) {
    console.error("Error fetching attendance:", err);
  }
}

// Run when page loads
document.addEventListener("DOMContentLoaded", loadAttendance);
