// import { time } from "console";
// import express from "express";
// import { readFile } from "fs/promises";
// import path from "path";
// import { fileURLToPath } from "url";

// const app = express();
// const PORT = 5000;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// console.log(__dirname);
// // Route to serve timetable
// app.get("/api/timetable", async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, "..", "database", "timetable", "bca_2_3.json");
//     console.log("----------------------------\n"+filePath);

//     const data = await readFile(filePath, "utf-8");
//     const timetable = JSON.parse(data); //converts to object

//     // res.json(JSON.parse(data));
//     const day = timetable["monday"];
//     console.log(day);

//     const filterdata = day.filter(item=> item.sub_code === "2908098");
//     console.log("Filter Data:", JSON.stringify(filterdata, null, 2));
//     const filterdatafa = day.map(item=> item.sub_code);
//     console.log("Filter Data FA:", JSON.stringify(filterdatafa, null, 2));
//     res.json(subCodes);
//   } catch (error) {
//     res.status(500).json({ error: "Error reading timetable" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



// import dotenv from "dotenv"
// import mysql from "mysql2"
// dotenv.config();

function formatDate(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}

async function loadTimetable() {
  const res = await fetch("../database/timetable/bca_2_3.json");
  const timetable = await res.json();
  const user_id = document.querySelector("#user-display").innerHTML;
  console.log(user_id);
  const today = new Date();
  let dayName = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  document.getElementById("date-container").innerText =
    today.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const todaySchedule = timetable[dayName];
  const tbody = document.getElementById("attendance-body");
  tbody.innerHTML = "";

  const attendanceArray = todaySchedule.map(item => item.subject || null);

  let data;
  todaySchedule.forEach((item, index) => {
    if (item.subject && item.subject!=="Recess") {
      const row = `
        <tr>
          <td class="border border-gray-300 px-4 py-2">${item.subject}</td>
          <td class="border border-gray-300 px-4 py-2 text-center">
            <input type="checkbox" class="attendance" data-index="${index}" value="A">
          </td>
          <td class="border border-gray-300 px-4 py-2 text-center">
            <input type="checkbox" class="attendance" data-index="${index}" value="P">
          </td>
          <td class="border border-gray-300 px-4 py-2 text-center">
            <input type="checkbox" class="attendance" data-index="${index}" value="C">
          </td>
        </tr>
      `;
      
      tbody.innerHTML += row;
    }
  });
  let date_day = document.querySelector("#date-container").innerHTML;
  console.log(date_day);
  document.querySelectorAll(".attendance").forEach(cb => {
    cb.addEventListener("change", function () {
      const i = parseInt(this.dataset.index);
      if (this.checked) {
        document.querySelectorAll(`.attendance[data-index='${i}']`).forEach(other => {
          if (other !== this) other.checked = false;
        });
        attendanceArray[i] = `${todaySchedule[i].subject}-${this.value}-${todaySchedule[i].class}`;
        console.log("In once " , attendanceArray[i]);
      } else {
        attendanceArray[i] = null;
      }
      console.log("Current selection: \n", attendanceArray.filter(x => x).join("\n"));
    });
  });

  document.getElementById("attendance-form").addEventListener("submit", async function (e) 
  {
    e.preventDefault();

    const finalResult = attendanceArray.filter(x => x);
    console.log("Final Attendance on Submit (Client):", finalResult);
    console.log("User inn main.js", user_id);

    try 
    {
      const res = await fetch("/show", 
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceData: finalResult, user: user_id, date_day: date_day })
      });
    
      const data = await res.json();
      console.log("Response from server:", data);

      if (res.ok && data.message) 
      {
        window.location.href = "/frontend/attend_done.html";
      } 
      else 
        {
        alert("Error saving attendance: " + (data.message || "Unknown   error occurred"));
      } 
    }
    catch (err) 
    {
      console.error("Error submitting attendance:", err);
      alert("Failed to submit attendance");
    }
  });
}

loadTimetable();

