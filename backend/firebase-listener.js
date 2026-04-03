// Firebase Realtime Database Listener for Email Notifications
// This monitors Firebase for new entries and sends email alerts

const { sendSecurityAlert } = require("./emailService");

let realtimeDb;
let lastProcessedKey = null;

try {
  const firebaseConfig = require("./firebase-config");
  realtimeDb = firebaseConfig.realtimeDb;
  console.log("✓ Firebase listener initialized");
} catch (error) {
  console.error("Firebase not configured:", error.message);
}

function startFirebaseListener() {
  if (!realtimeDb) {
    console.log("Firebase not available, listener not started");
    return;
  }

  const logsRef = realtimeDb.ref("rfid_logs");

  // Listen for new child additions
  logsRef.on("child_added", (snapshot) => {
    const key = snapshot.key;
    const logData = snapshot.val();

    // Skip if this is old data (on initial load)
    if (!lastProcessedKey) {
      lastProcessedKey = key;
      console.log("Firebase listener started, monitoring for new entries...");
      return;
    }

    // Process new entry
    console.log(`New log detected: ${key}`);

    // Check if it's a failed/denied attempt
    const attemptValue = logData.attempt || "";
    const statusValue = logData.status || "";

    // Check if attempt is a number (counter)
    const isAttemptNumber =
      typeof attemptValue === "number" || !isNaN(Number(attemptValue));

    // Use status if attempt is numeric
    const statusToCheck = isAttemptNumber
      ? statusValue
      : attemptValue || statusValue;
    const status = String(statusToCheck).toLowerCase();
    const isFailed = status === "failed" || status === "denied";

    // Send email for failed attempts
    if (isFailed || process.env.EMAIL_ALL_ATTEMPTS === "true") {
      console.log(
        `Sending email notification for ${logData.emp_name} (${status})`
      );

      sendSecurityAlert({
        emp_name: logData.emp_name,
        card_id: logData.card_id,
        attempt: isFailed ? "failed" : "success",
        entry_time: logData.entry_time || new Date().toISOString(),
      }).catch((err) => {
        console.log("Email notification failed:", err.message);
      });
    }

    lastProcessedKey = key;
  });

  console.log(
    "✓ Firebase listener active - monitoring for new access attempts"
  );
}

module.exports = { startFirebaseListener };
