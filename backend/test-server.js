const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Server is working!" });
});

// Sample logs endpoint
app.get("/api/logs", (req, res) => {
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

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

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

app.listen(5000, () => {
  console.log("Test server running on http://localhost:5000");
});
