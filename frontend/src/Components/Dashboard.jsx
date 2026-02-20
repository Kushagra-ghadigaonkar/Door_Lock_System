  import { useState, useEffect } from "react";
  import { useAuth } from "../Contexts/AuthContext";
  import { useFirebaseRealtime } from "../hooks/useFirebaseRealtime";
  import TestPanel from "./TestPanel";

  export default function Dashboard() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { logout } = useAuth();

    //filter
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [dateFilter, setDateFilter] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [employees, setEmployees] = useState([]);

    const applyFilters = () => {
      let filtered = logs;

      if (employeeFilter) {
        filtered = filtered.filter(log => log.emp_name === employeeFilter);
      }

      if (dateFilter) {
        filtered = filtered.filter(log => {
          const logDate = new Date(log.entry_time).toISOString().split("T")[0];
          return logDate === dateFilter;
        });
      }

      setFilteredLogs(filtered);
    };

    useEffect(() => {
      applyFilters();
    }, [logs, dateFilter, employeeFilter]);

    const clearFilters = () => {
      setDateFilter('');
      setEmployeeFilter('');
    };

    useEffect(() => {
      if (!logs || logs.length === 0) {
        setFilteredLogs([]);
        setEmployees([]);
        return;
      }

      // Create unique employee list
      const uniqueEmployees = [...new Set(logs.map(log => log.emp_name))];
      setEmployees(uniqueEmployees.sort());
    }, [logs]);
    //end


    // Firebase real-time data
    const {
      data: firebaseLogs,
      loading: firebaseLoading,
      error: firebaseError,
    } = useFirebaseRealtime("access_logs", 50);

    useEffect(() => {
      // Always use Firebase real-time data
      setLogs(firebaseLogs);
      setLoading(firebaseLoading);
    }, [firebaseLogs, firebaseLoading]);

    const handleRefresh = () => {
      // Firebase updates automatically, just show refresh animation
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1000);
    };

    const formatDateTime = (dateString) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    };

    const getStatusBadge = (status) => {
      const isSuccess = status.toLowerCase() === "success";
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isSuccess
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {isSuccess ? "✓" : "✕"} {status}
        </span>
      );
    };

    if (loading) {
      return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Loading dashboard...</p>
            <p className="text-sm text-slate-400 mt-2">
              Connecting to Firebase...
            </p>
          </div>
        </div>
      );
    }

    if (firebaseError) {
      return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-white text-center max-w-md">
            <div className="text-6xl mb-4">🔥❌</div>
            <h2 className="text-xl font-bold mb-2">Firebase Connection Error</h2>
            <p className="text-slate-400 mb-4">
              Unable to connect to Firebase. Please check your configuration.
            </p>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-300">
                Error: {firebaseError.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))]] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="relative">
          <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg text-white text-xl">
                    🔒
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      Door Lock System
                    </h1>
                    <p className="text-sm text-slate-400">
                      Access Control Dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                    <span className="text-green-400">🔥</span>
                    <span className="text-sm font-medium text-green-300">
                      Firebase Live
                    </span>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <span
                      className={refreshing ? "inline-block animate-spin" : ""}
                    >
                      🔄
                    </span>
                    Refresh
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
                  >
                    <span>➡</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-linear-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Access Logs
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Monitoring door access attempts
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">🔥</span>
                    <span className="text-sm font-medium text-green-700">
                      {logs.length} Live Entries
                    </span>
                  </div>
                </div>
                {/* FILTER SECTION */}
                {/* <div className="px-6 py-4 border-b border-slate-200 bg-slate-50"> */}
                <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 items-end">

                    {/* Employee Filter */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Filter by Employee
                      </label>
                      <select
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="">All Employees</option>
                        {employees.map((emp) => (
                          <option key={emp} value={emp}>
                            {emp}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Filter by Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    {/* Clear Filters */}
                    {(dateFilter || employeeFilter) && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
                      >
                        Clear Filters
                      </button>
                    )}

                  </div>
                
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Employee Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Entry Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Attempt
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl">🔒</div>
                            <p className="text-slate-500 font-medium">
                              No access logs found
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                        filteredLogs.map((log, index) => (
                        <tr
                          key={log.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-slate-900">
                              #{log.id}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-slate-900">
                              {log.emp_name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">
                              {formatDateTime(log.entry_time)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(log.attempt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <TestPanel />

            <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-white mb-1">
                Dashboard Info
              </h3>
              <p className="text-xs text-slate-400">
                This dashboard uses Firebase real-time database for live updates.
                {firebaseError &&
                  " (Firebase connection error - check configuration)"}
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }
