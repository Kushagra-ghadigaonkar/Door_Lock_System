import { useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
export default function TestPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const {url}=useAuth();

  const addTestLog = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${url}/api/test-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setMessage(
          `✅ Test log added: ${result.data.emp_name} - ${result.data.attempt}`
        );
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addCustomLog = async (empName, cardId, attempt) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${url}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emp_name: empName,
          card_id: cardId,
          attempt: attempt,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ Custom log added: ${empName} - ${attempt}`);
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden mt-6">
      <div className="px-6 py-5 border-b border-slate-200 bg-linear-to-r from-slate-50 to-white">
        <h3 className="text-lg font-bold text-slate-900">Test Panel</h3>
        <p className="text-sm text-slate-600 mt-1">
          Add test data to Firebase (for development)
        </p>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={addTestLog}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "⏳ Adding..." : "🎲 Add Random Test Log"}
          </button>

          <button
            onClick={() => addCustomLog("Security Guard", "CARD999", "success")}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            ✅ Add Success Log
          </button>

          <button
            onClick={() => addCustomLog("Unknown User", "INVALID", "failed")}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            ❌ Add Failed Log
          </button>
        </div>

        {message && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-700">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
