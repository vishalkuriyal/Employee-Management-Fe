import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axios";

interface TodayAttendanceSimple {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
}

interface AbsentRecord {
  date: string;
  status: string;
}

interface LeaveRecord {
  _id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

const EmployeeDashboardOverview = () => {
  const { user } = useAuth();
  const userId = user?._id || "";
  const [today, setToday] = useState<TodayAttendanceSimple | null>(null);
  const [absentDays, setAbsentDays] = useState<AbsentRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchToday = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/attendance/today/${userId}`);
      if (res.data.success) {
        setToday(res.data.data);
      }
    } catch (err) {
      setToday({
        hasCheckedIn: false,
        hasCheckedOut: false,
        checkInTime: null,
        checkOutTime: null,
      });
    }
  };

  const fetchAbsentDays = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/attendance/employee/${userId}`, {
        params: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      });
      if (res.data.success && res.data.attendance) {
        const absent = res.data.attendance.filter(
          (rec: any) => rec.status === "absent"
        );
        setAbsentDays(absent);
      }
    } catch (err) {
      setAbsentDays([]);
    }
  };

  const fetchLeaves = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/leaves/employee/${userId}`);
      if (res.data.success && res.data.leaves) {
        setLeaves(res.data.leaves);
      }
    } catch (err) {
      setLeaves([]);
    }
  };

  useEffect(() => {
    fetchToday();
    fetchAbsentDays();
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCheckIn = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.post(`/api/attendance/check-in`, { userId });
      if (res.data.success) {
        await fetchToday();
      } else {
        alert(res.data.error || "Check-in failed");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.post(`/api/attendance/check-out`, { userId });
      if (res.data.success) {
        await fetchToday();
      } else {
        alert(res.data.error || "Check-out failed");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-600",
          badge: "bg-yellow-100",
        };
      case "approved":
      case "accepted":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-600",
          badge: "bg-green-100",
        };
      case "rejected":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-600",
          badge: "bg-red-100",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-600",
          badge: "bg-gray-100",
        };
    }
  };

  return (
    <div className="py-28 px-16">
      <div className="grid grid-cols-3 gap-10 items-center justify-center">
        <div className="rounded-2xl overflow-hidden">
          <div className="py-8 flex justify-center bg-primary">
            <p className="source-sans-3-regular text-white">Mark Attendance</p>
          </div>
          <div className="bg-white h-[400px] flex flex-col items-center justify-center gap-6">
            <div className="source-sans-3-bold text-3xl">
              Today's Attendance
            </div>
            {!today || !today.hasCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {loading ? "Checking In..." : "Check In"}
                </div>
              </button>
            ) : !today.hasCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  {loading ? "Checking Out..." : "Check Out"}
                </div>
              </button>
            ) : (
              <div className="text-center">
                <p className="font-semibold source-sans-3-semibold text-green-600">
                  Today's attendance completed
                </p>
                <p className="text-sm text-gray-600">
                  Checked in:{" "}
                  {today.checkInTime
                    ? new Date(today.checkInTime).toLocaleTimeString()
                    : "--"}
                </p>
                <p className="text-sm text-gray-600">
                  Checked out:{" "}
                  {today.checkOutTime
                    ? new Date(today.checkOutTime).toLocaleTimeString()
                    : "--"}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden">
          <div className="py-8 flex justify-center bg-primary">
            <p className="source-sans-3-regular text-white">Leaves Taken</p>
          </div>
          <div className="bg-white h-[400px] overflow-y-auto p-6">
            {leaves.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 source-sans-3-medium">
                  No leaves applied
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="source-sans-3-semibold text-lg mb-4">
                  Applied: {leaves.length}
                </p>
                {leaves.map((leave) => {
                  const colors = getStatusColor(leave.status);
                  return (
                    <div
                      key={leave._id}
                      className={`flex flex-col gap-2 p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="source-sans-3-semibold text-sm">
                            {leave.leaveType}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(leave.startDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}{" "}
                            -{" "}
                            {new Date(leave.endDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold ${colors.text} ${colors.badge} px-2 py-1 rounded whitespace-nowrap`}
                        >
                          {leave.status.charAt(0).toUpperCase() +
                            leave.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden">
          <div className="py-8 flex justify-center bg-primary">
            <p className="source-sans-3-regular text-white">Absent days</p>
          </div>
          <div className="bg-white h-[400px] overflow-y-auto p-6">
            {absentDays.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 source-sans-3-medium">
                  No absent days this month
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="source-sans-3-semibold text-lg mb-4">
                  Absent: {absentDays.length} days
                </p>
                {absentDays.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <span className="source-sans-3-medium">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                      Absent
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardOverview;
