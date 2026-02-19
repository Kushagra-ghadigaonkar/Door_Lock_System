const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Auto Reload Setup (to prevent Render free tier sleeping)
const url = "https://door-lock-system-backend.onrender.com";
const interval = 300000;
function reloadWebsite() {
    axios.get(url)
        .then(() => console.log("Website pinged to prevent sleep"))
        .catch((err) => console.log(" Auto-ping error:", err.message));
}
setInterval(reloadWebsite, interval);

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
