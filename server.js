import express from "express"
import dotenv from "dotenv"
import mysql from "mysql2"
import bodyparser from "body-parser"
import multer from "multer"
import { fileURLToPath } from "url";
import path, { parse } from "path";
import { dirname } from "path";
import { cpSync, stat } from "fs"
import { execFile } from "child_process";
import { stderr, stdout } from "process"
import { use } from "react"
import session from "express-session";
import { time } from "console"
import fs from "fs";
const PORT = 1900;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname)));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
}));

dotenv.config();
console.log(process.env.MYSQL_HOST + " " + process.env.MYSQL_)
const pool = mysql.createPool({
  host : process.env.MYSQL_HOST,
  database : process.env.MYSQL_DATABASE,
  password : process.env.MYSQL_PASSWORD,
  port : process.env.MYSQL_PORT,
  user : process.env.MYSQL_USER,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if(err)
  {
    console.error("Database Failed to connect due to : ", err.message);
  }
  else
  {
    console.log("Database connected");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/home.html"));
})

// let user;
app.post("/login", (req, res) => {
  const user_id = req.body.user_id;
  const password = req.body.password;
  if(!user_id || !password)
  {
    return res.status(400).json({message: "Please enter some detials" });
  }
  const query = "SELECT * FROM users where user_id = ? and password = ? LIMIT 1 ";
  pool.execute(query, [user_id, password], (err, results) => {
    if(err)
    {
      console.error("Error in Login: ", err);
      return res.status(500).json({message: "Internal Servver Error" });
    }

    if(results.length>0)
    {
      console.log("Login Done as : " , user_id);
      req.session.user = user_id;
      res.redirect(`/frontend/main.html?user_id=${user_id}`);
    }
    else
    {
      return res.status(401).json({message: "Invalid User Id or Password"});
    }
  })
});
// console.log("This is user who loged is : ", user);
let newuserData = {};
app.post("/new_user", (req, res) => {
  const { name, email, id, course, year, sem, password, phone } = req.body;
  console.log(name, email, password , course, year, sem, phone, id);

  if (!name || !email || !password || !course || !year || !sem || !phone || !id) {
    return res.status(400).json({ message: "Failed" });
  }
  execFile("python", ["backend/send_email.py", email], (error, stdout, stderr) => {
    if (error) return res.status(500).json({ message: "Python error" });

    const out = JSON.parse(stdout);
    const pythonOtp = out.otp;
    console.log("OTP: in user " , pythonOtp);
    newuserData = {name, course, year, sem, email, id, password, phone, pythonOtp};
    console.log(pythonOtp);
    res.sendFile(path.join(__dirname, "/frontend/verify.html"));
  });
});

app.post("/verify_otp", (req, res) => {
  const otpp = req.body.otp;
  let otp = parseInt(otpp);
  console.log("OTP from html: ", otp);
  // console.log("In user : " ,newuserData.pythonOtp);
  if(!newuserData || !otp)
  {
    res.status(322).json({message: "Failed in Verrify taking output"});
  }

  if (otp != newuserData.pythonOtp) 
  {
    return res.status(400).json({ message: "OTP does not match" });
  }

  const query1 = "SELECT count(*) as totals FROM users WHERE course = ? and year = ? and sem = ?;";
  pool.execute(query1, [newuserData.course, newuserData.year, newuserData.sem], (err,results) => {
    if(err)
    {
      console.log("Error occured in addign new user: ", err);
      return res.status(500).json({message: "Database Failed"});
    }
    const total = results[0].totals;
    if(total==0)
    {
      return res.sendFile(path.join(__dirname, "/frontend/add_table.html"));
    }
    else
    {
      return res.redirect("/adding");
    }
  })
});
app.get("/adding", (req,res)=>{
  console.log("In adding");
  const query = "INSERT INTO USERS (user_id , course, year, sem, password, full_name, email, phone) values ( ? , ?, ?, ?, ?, ?, ? ,?);";
  pool.execute(query, [newuserData.id, newuserData.course, newuserData.year, newuserData.sem , newuserData.password, newuserData.name, newuserData.email, newuserData.phone], (err, results) => {
    if (err) {
      console.log("Error occurred in adding new user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.affectedRows > 0) {
      res.sendFile(path.join(__dirname, "/frontend/new_done.html"));
    } else {
      return res.status(400).json({ message: "Failed to insert user" });
    }
  });
})

const subjects = {
  "ITSM-L": "sub_bcaIII_214_L",
  "CN-L": "sub_bcaIII_213_L",
  "I.A" : "sub_bcaIII_211",
  CRT : "sub_bcaIII_217",
  DM : "sub_bcaIII_212",
  ITSM: "sub_bcaIII_214",
  CN : "sub_bcaIII_213"
};

app.post("/show", (req, res) => {
  const { attendanceData, user, date_day } = req.body;
  console.log(attendanceData, user, date_day)
  if (!attendanceData || !user || !date_day) {
    return res.status(400).json({ message: "Missing attendance data, user, or date" });
  }
  console.log("📌 Attendance of User:", user);
  console.log("📌 Attendance Data from Client:", attendanceData);
  console.log("Attendecne at [0]", attendanceData[0]);
  let class1 = "-";
  let class2 = "-";
  let class3 = "-";
  let class4 = "-";
  let class5 = "-";
  let class6 = "-";
  let class7 = "-";
  let present =0;
  let absent = 0;
  let cancel = 0;
  let to_push_data = [];
  for (let i = 0; i < attendanceData.length; i++) {
    let item = attendanceData[i];
    let table = 0, present_day = 0, absent_day = 0, cancel_day = 0;
    if (item.toLowerCase().includes("recess")) continue;

    let codeMatch = item.match(/\{(.*?)\}/);
    let code = codeMatch ? codeMatch[1] : null;

    let parts = item.split("-");
    let status = parts[1];     
    if(status == "L}")
    {
      console.log("In else")
      status = parts[2];
    }
    let lastword = parts[2];    

    console.log("Status:", status, "Code:", "'", code, "'", "Class:", lastword);
    if(code === "ITSM")
    {
      table = "sub_bcaIII_214"
    }
    else if(code === "ITSM-L")
    {
      table = "sub_bcaIII_214_L"
    }
    else if(code === "CN")
    {
      table = "sub_bcaIII_213"
    }
    else if(code === "CN-L")
    {
      table = "sub_bcaIII_213_L"
    }
    else if(code === "I.A")
    {
      table = "sub_bcaIII_211"
    }
    else if(code === "CRT")
    {
      table = "sub_bcaIII_217"
    }
    else if( code === "DM")
    {
      table = "sub_bcaIII_212"
    }
    else
    {
      table = "null"
    }
    if(status === 'P')
    {
      present_day=1;
    }
    if(status === 'C')
    {
      cancel_day = 1;
    }
    if(status === 'A')
    {
      absent_day = 1;
    }
    to_push_data.push({table: table, status: status});
    console.log(present_day, cancel_day, absent_day);
    if (table !== "null") {
  console.log("Present:", present_day, "Absent:", absent_day, "Cancel:", cancel_day, "Table:", table , "User : ",user);

  const todo = `
    INSERT INTO ${table}
    (student_id, class_date, total_class, present, absent, cancelled)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      total_class = VALUES(total_class),
      present = VALUES(present),
      absent = VALUES(absent),
      cancelled = VALUES(cancelled)
  `;

  pool.execute(
    todo,
    [user, date_day, 1-cancel_day, present_day, absent_day, cancel_day],
    (err, results) => {
      if (err) {
        console.error("❌ MySQL failed for table:", table, "Error:", err.sqlMessage);
      } else {
        console.log("✅ Data saved for table:", table);
      }
    }
  );
}

    if(status==='P')
    {
      present++;
    }
    else if( status==='A')
    {
      absent++;
    }
    else if(status==='C')
    {
      cancel++;
    }
    if(lastword==="class1")
    { 
      class1 = code + " " + status;
    }
    if(lastword==="class2")
    { 
      class2 = code + " " + status;
    }
    if(lastword==="class3")
    { 
      class3 = code + " " + status;
    }
    if(lastword==="class4")
    { 
      class4 = code + " " + status;
    }
    if(lastword==="class5")
    { 
      class5 = code + " " + status;
    }
    if(lastword==="class6")
    { 
      class6 = code + " " + status;
    }
    if(lastword==="class7")
    { 
      class7 = code + " " + status;
    }
  }
  console.log("Data after push: ", to_push_data);
  console.log("Class 1 : ", class1);
  console.log("Class 2 : ", class2);
  console.log("Class 3 : ", class3);
  console.log("Class 4 : ", class4);
  console.log("Class 5 : ", class5);
  console.log("Class 6 : ", class6);
  console.log("Class 7 : ", class7);
  let total = present + absent + cancel;
  console.log("Present: ", present);
  console.log("Absent: ", absent);
  console.log("Cancel: ", cancel);
  console.log("Total: ", total);
  let total_conduct = present + absent;
  let percent = total_conduct > 0 ? ((present / total_conduct) * 100).toFixed(2) : "0";
  
  const query = `
  INSERT INTO attendence_in_dates 
    (student_id, date_day, class1, class2, class3, class4, class5, class6, class7, total_class, present, missed, cancelled, percent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    class1 = VALUES(class1),
    class2 = VALUES(class2),
    class3 = VALUES(class3),
    class4 = VALUES(class4),
    class5 = VALUES(class5),
    class6 = VALUES(class6),
    class7 = VALUES(class7),
    total_class = VALUES(total_class),
    present = VALUES(present),
    missed = VALUES(missed),
    cancelled = VALUES(cancelled),
    percent = VALUES(percent)
  `;
  pool.execute(query, [user, date_day, class1, class2, class3, class4, class5, class6, class7, total, present, absent, cancel, percent], (err, results) => {
    if(err) {
        console.error("MySQL Insert Error: ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }

    console.log("Attendance saved for user:", user);
    return res.json({ message: "Attendance saved successfully" });
  });
});


app.post("/total", (req, res) => {
    res.redirect(`/frontend/total.html?user_id=${req.session.user}`);

});
app.get("/api/attendance", (req, res) => {
  let result = {};
  let queries = Object.entries(subjects).map(([key, table]) => {
    console.log(table);
    return new Promise((resolve, reject) => {
      pool.query(   // 👈 db.query ❌  → pool.query ✅
        `SELECT 
          SUM(total_class) AS total,
          SUM(present) AS present,
          SUM(absent) AS absent,
          SUM(cancelled) AS cancelled,
          ROUND((SUM(present) / SUM(total_class)) * 100, 2) AS percent
          FROM ${table};
`,
        (err, rows) => {
          if (err) reject(err);
          else {
            const total = rows[0].total || 0;
            const present = rows[0].present || 0;
            const absent = rows[0].absent || 0;
            const percent = rows[0].percent || 0.0;
            console.log("total: ", total, "present: ", present, "absent: ", absent, "percent: ", percent)
            result[key] = { total, present, absent, percent };
            resolve();
          }
        }
      );
    });
  });
  Promise.all(queries)
    .then(() => res.json(result))
    .catch(err => {
      console.error("Error in /api/attendance:", err);
      res.status(500).json({ error: err.message });
    });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started at http://localhost:${PORT}`);
});