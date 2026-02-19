require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Try to load Firebase config, but handle errors gracefully
let db, realtimeDb;
try {
  const firebaseConfig = require("./firebase-config");
  db = firebaseConfig.db;
  realtimeDb = firebaseConfig.realtimeDb;
  console.log("Firebase initialized successfully");
} catch (error) {
  console.log("Firebase not configured, using fallback data:", error.message);
}

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
app.get("/api/logs", async (req, res) => {
  try {
    // Only try Firebase if it's configured
    if (realtimeDb) {
      const logsRef = realtimeDb.ref("access_logs");
      const snapshot = await logsRef
        .orderByChild("entry_time")
        .limitToLast(50)
        .once("value");

      const logs = [];
      snapshot.forEach((childSnapshot) => {
        logs.unshift({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      return res.json({
        success: true,
        data: logs,
      });
    }
  } catch (error) {
    console.error("Error fetching logs from Firebase:", error);
  }

  // Fallback to sample data if Firebase is not configured or fails
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
//  ADD ACCESS LOG API (For IoT device)
// ----------------------
app.post("/api/logs", async (req, res) => {
  try {
    const { emp_name, card_id, attempt } = req.body;

    if (!emp_name || !attempt) {
      return res.status(400).json({
        success: false,
        message: "Employee name and attempt status are required",
      });
    }

    const logEntry = {
      emp_name,
      card_id: card_id || null,
      entry_time: new Date().toISOString(),
      attempt, // "success" or "failed"
      timestamp: Date.now(),
    };

    // Try to add to Firebase if configured
    if (realtimeDb) {
      const logsRef = realtimeDb.ref("access_logs");
      const newLogRef = await logsRef.push(logEntry);

      return res.json({
        success: true,
        message: "Access log recorded successfully",
        data: {
          id: newLogRef.key,
          ...logEntry,
        },
      });
    }

    // If Firebase not configured, just return success (for development)
    res.json({
      success: true,
      message: "Access log recorded successfully (Firebase not configured)",
      data: {
        id: Date.now().toString(),
        ...logEntry,
      },
    });
  } catch (error) {
    console.error("Error adding log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record access log: " + error.message,
    });
  }
});

// ----------------------
//  TEST ENDPOINT - Add sample data
// ----------------------
app.post("/api/test-log", async (req, res) => {
  try {
    const sampleLogs = [
      {
        emp_name: "John Doe",
        card_id: "CARD001",
        attempt: "success",
      },
      {
        emp_name: "Jane Smith",
        card_id: "CARD002",
        attempt: "failed",
      },
      {
        emp_name: "Alex Johnson",
        card_id: "CARD003",
        attempt: "success",
      },
    ];

    const randomLog = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];

    const logEntry = {
      ...randomLog,
      entry_time: new Date().toISOString(),
      timestamp: Date.now(),
    };

    // Try to add to Firebase if configured
    if (realtimeDb) {
      const logsRef = realtimeDb.ref("access_logs");
      const newLogRef = await logsRef.push(logEntry);

      return res.json({
        success: true,
        message: "Test log added successfully",
        data: {
          id: newLogRef.key,
          ...logEntry,
        },
      });
    }

    // If Firebase not configured, just return success
    res.json({
      success: true,
      message: "Test log added successfully (Firebase not configured)",
      data: {
        id: Date.now().toString(),
        ...logEntry,
      },
    });
  } catch (error) {
    console.error("Error adding test log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add test log: " + error.message,
    });
  }
});

// ----------------------
//  START SERVER
// ----------------------
app.listen(5000, () => {
  console.log("Node.js Server running on http://localhost:5000");
});
