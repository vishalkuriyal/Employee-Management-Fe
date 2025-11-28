import React, { useState, useEffect } from "react";
import { Clock, TrendingUp, LogIn, LogOut, History } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

interface AttendanceRecord {
  status: "present" | "absent" | "half-day" | "leave";
  workingHours: number;
  checkIn: string | null;
  checkOut: string | null;
  date: string;
}

interface TodayAttendance {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: "present" | "absent" | "half-day" | "leave";
}

interface AttendanceStatistics {
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  totalWorkingHours: number;
}

const API_BASE_URL = "http://localhost:8001/api";

const MarkAttendance: React.FC = () => {
  const [todayAttendance, setTodayAttendance] =
    useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(
    null
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const { user } = useAuth();
  const userId = user?._id || "";

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance and history on mount and when month/year changes
  useEffect(() => {
    if (userId) {
      fetchTodayAttendance();
      fetchAttendanceHistory();
    }
  }, [userId, selectedMonth, selectedYear]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/attendance/today/${userId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setTodayAttendance(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      // Set default state if not found
      setTodayAttendance({
        hasCheckedIn: false,
        hasCheckedOut: false,
        checkInTime: null,
        checkOutTime: null,
        checkIn: null,
        checkOut: null,
        workingHours: 0,
        status: "absent",
      });
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/attendance/employee/${userId}`,
        {
          params: {
            month: selectedMonth,
            year: selectedYear,
          },
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setAttendanceHistory(response.data.attendance || []);
        setStatistics(
          response.data.statistics || {
            present: 0,
            absent: 0,
            halfDay: 0,
            leave: 0,
            totalWorkingHours: 0,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      setAttendanceHistory([]);
      setStatistics({
        present: 0,
        absent: 0,
        halfDay: 0,
        leave: 0,
        totalWorkingHours: 0,
      });
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/attendance/check-in`,
        { userId },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Refresh today's attendance
        await fetchTodayAttendance();
      }
    } catch (error: any) {
      console.error("Check-in error:", error);
      const errorMessage = error.response?.data?.error || "Check-in failed";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/attendance/check-out`,
        { userId },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Refresh today's attendance and history
        await fetchTodayAttendance();
        await fetchAttendanceHistory();
      }
    } catch (error: any) {
      console.error("Check-out error:", error);
      const errorMessage = error.response?.data?.error || "Check-out failed";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string | null): string => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: AttendanceRecord["status"]): string => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-300";
      case "absent":
        return "bg-red-100 text-red-800 border-red-300";
      case "half-day":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "leave":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const calculateWorkingTime = (): string => {
    if (!todayAttendance?.checkInTime) return "0h 0m";
    const checkIn = new Date(todayAttendance.checkInTime).getTime();
    const now = Date.now();
    const diff = now - checkIn;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            My Attendance
          </h1>
          <p className="text-gray-600">
            Track your attendance and working hours
          </p>
        </div>

        {/* Today's Attendance Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Today's Attendance
                </h2>
                <p className="text-gray-500">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-indigo-600">
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          </div>

          {!todayAttendance?.hasCheckedIn ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6 text-lg">
                You haven't checked in today
              </p>
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-3 mx-auto disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <LogIn className="w-6 h-6" />
                {loading ? "Checking In..." : "Check In"}
              </button>
            </div>
          ) : !todayAttendance?.hasCheckedOut ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-2">
                    Check-In Time
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {formatTime(todayAttendance.checkInTime)}
                  </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    Working Time
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {calculateWorkingTime()}
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-2">
                    Status
                  </p>
                  <p className="text-2xl font-bold text-purple-700">Active</p>
                </div>
              </div>
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-6 h-6" />
                {loading ? "Checking Out..." : "Check Out"}
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-2">
                    Check-In
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatTime(todayAttendance.checkInTime)}
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <p className="text-sm text-red-600 font-medium mb-2">
                    Check-Out
                  </p>
                  <p className="text-2xl font-bold text-red-700">
                    {formatTime(todayAttendance.checkOutTime)}
                  </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    Total Hours
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {todayAttendance.workingHours.toFixed(2)}h
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-2">
                    Status
                  </p>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(
                      todayAttendance.status
                    )}`}
                  >
                    {todayAttendance.status?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                <p className="text-green-700 font-semibold">
                  ✓ You have successfully completed your attendance for today!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Present</p>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {statistics.present}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Absent</p>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {statistics.absent}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Half-Day</p>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {statistics.halfDay}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Leave</p>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {statistics.leave}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Total Hours</p>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {statistics.totalWorkingHours.toFixed(2)}h
              </p>
            </div>
          </div>
        )}

        {/* Attendance History */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <History className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Attendance History
              </h2>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(2025, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {attendanceHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No attendance records found for this month
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                      Check-In
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                      Check-Out
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                      Working Hours
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-gray-800">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatTime(record.checkIn)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatTime(record.checkOut)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {record.workingHours > 0
                          ? `${record.workingHours.toFixed(2)}h`
                          : "--"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
