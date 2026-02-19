// const express = require("express");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // dummy users (replace with database later)
// const users = [
//     { username: "admin", password: "1234" },
//     { username: "user", password: "abcd" },
// ];

// // login route
// app.post("/api/login", (req, res) => {
//     const { username, password } = req.body;

//     const user = users.find(
//         (u) => u.username === username && u.password === password
//     );

//     if (!user) {
//         return res.json({ success: false, message: "Invalid credentials" });
//     }

//     return res.json({ success: true, message: "Login successful" });
// });
// app.get("/api/logs", (req, res) => {
//     res.json({
//         success: true,
//         data: [
//             {
//                 id: 1,
//                 emp_name: "John Doe",
//                 entry_time: new Date(),
//                 attempt: "success",
//             },
//         ],
//     });
// });

// app.listen(5000, () => console.log("Server running on port 5000"));
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------
//  LOGIN API (Admin Portal)
// ----------------------
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    // Hardcoded credentials
    if (username === "admin" && password === "admin123") {
        return res.json({
            success: true,
            message: "Login successful",
        });
    }

    return res.json({
        success: false,
        message: "Invalid username or password",
    });
});

// ----------------------
//  ACCESS LOGS API
// ----------------------
app.get("/api/logs", (req, res) => {
    // Sample logs (You can connect DB later)
    const logs = [
        {
            id: 1,
            emp_name: "John Doe",
            entry_time: "2026-02-19T10:15:00Z",
            attempt: "success",
        },
        {
            id: 2,
            emp_name: "Jane Smith",
            entry_time: "2026-02-19T09:50:00Z",
            attempt: "failed",
        },
        {
            id: 3,
            emp_name: "Alex Johnson",
            entry_time: "2026-02-19T09:30:00Z",
            attempt: "success",
        },
    ];

    res.json({
        success: true,
        data: logs,
    });
});

// ----------------------
//  START SERVER
// ----------------------
app.listen(5000, () => {
    console.log("Node.js Server running on http://localhost:5000");
});
