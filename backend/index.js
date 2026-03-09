require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios"); // ✅ Added (was missing)

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

const url = "https://door-lock-system-backend.onrender.com";
const interval = 300000;

function reloadWebsite() {
  axios
    .get(url)
    .then(() => console.log("Website pinged to prevent sleep"))
    .catch((err) => console.log("Auto-ping error:", err.message));
}
setInterval(reloadWebsite, interval);

const app = express();
app.use(cors());
app.use(express.json());

/* =========================================================
   LOGIN API
========================================================= */
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

/* =========================================================
   ACCESS LOGS API (READ)
========================================================= */
app.get("/api/logs", async (req, res) => {
  try {
    if (realtimeDb) {
      // ❌ OLD (reading from access_logs)
      // const logsRef = realtimeDb.ref("access_logs");

      // ✅ NEW (reading from rfid_logs)
      const logsRef = realtimeDb.ref("rfid_logs");

      const snapshot = await logsRef
        .orderByChild("timestamp") // more reliable
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
    console.error("Error fetching logs:", error);
  }

  // Fallback sample
  const logs = [
    {
      id: 1,
      emp_name: "John Doe",
      entry_time: new Date().toISOString(),
      attempt: "success",
      timestamp: Date.now(),
    },
  ];

  res.json({
    success: true,
    data: logs,
  });
});

/* =========================================================
   ADD ACCESS LOG API (IoT Device)
========================================================= */
app.post("/api/logs", async (req, res) => {
  try {
    const { emp_name, card_id, status, attempt } = req.body;

    if (!emp_name) {
      return res.status(400).json({
        success: false,
        message: "Employee name is required",
      });
    }

    // ❌ OLD STRUCTURE (commented)
    /*
    const logEntry = {
      emp_name,
      card_id: card_id || null,
      entry_time: new Date().toISOString(),
      attempt, 
      timestamp: Date.now(),
    };
    */

    // ✅ NEW STANDARDIZED STRUCTURE
    const normalizedAttempt =
      status?.toLowerCase() === "denied"
        ? "failed"
        : status?.toLowerCase() === "granted"
        ? "success"
        : attempt?.toLowerCase() || "failed";

    const logEntry = {
      emp_name,
      card_id: card_id || null,
      entry_time: new Date().toISOString(), // ISO format
      attempt: normalizedAttempt, // only "success" or "failed"
      timestamp: Date.now(), // numeric timestamp
    };

    if (realtimeDb) {
      const logsRef = realtimeDb.ref("rfid_logs"); // keeping rfid_logs
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

/* =========================================================
   TEST ENDPOINT
========================================================= */
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

    const randomLog =
      sampleLogs[Math.floor(Math.random() * sampleLogs.length)];

    const logEntry = {
      ...randomLog,
      entry_time: new Date().toISOString(),
      timestamp: Date.now(),
    };

    if (realtimeDb) {
      // ❌ OLD
      // const logsRef = realtimeDb.ref("access_logs");

      // ✅ NEW
      const logsRef = realtimeDb.ref("rfid_logs");

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

    res.json({
      success: true,
      message: "Test log added successfully",
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

/* =========================================================
   START SERVER
========================================================= */
app.listen(5000, () => {
  console.log("Node.js Server running on http://localhost:5000");
});