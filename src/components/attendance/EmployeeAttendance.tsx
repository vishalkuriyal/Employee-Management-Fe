import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  TrendingUp,
  Download,
  Edit,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

interface AttendanceStatus {
  status: "present" | "absent" | "half-day" | "leave";
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  remarks?: string;
}

interface Employee {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  attendance: AttendanceStatus;
}

interface Statistics {
  totalEmployees: number;
  totalPresent: number;
  totalAbsent: number;
  totalHalfDay: number;
  totalLeave: number;
  totalLate?: number;
  averageWorkingHours: number;
}

// New types for today's attendance
interface EmployeeAttendanceDetail {
  _id: string;
  name: string;
  employeeId: string;
  department: string;
  checkIn?: Date | string;
  checkOut?: Date | string;
  workingHours?: number;
  status: string;
  remarks?: string;
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  late: number;
}

interface AttendanceDetails {
  present: EmployeeAttendanceDetail[];
  absent: EmployeeAttendanceDetail[];
  halfDay: EmployeeAttendanceDetail[];
  leave: EmployeeAttendanceDetail[];
  late: EmployeeAttendanceDetail[];
}

interface TodayAttendanceResponse {
  success: boolean;
  date: Date | string;
  summary: AttendanceSummary;
  details: AttendanceDetails;
}

const API_BASE_URL = "http://localhost:8000/api";

const EmployeeAttendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceData, setAttendanceData] = useState<Employee[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [todayAttendance, setTodayAttendance] =
    useState<AttendanceDetails | null>(null);
  const [todaySummary, setTodaySummary] = useState<AttendanceSummary | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [manualStatus, setManualStatus] =
    useState<AttendanceStatus["status"]>("present");
  const [remarks, setRemarks] = useState("");

  const departments = [
    { id: "all", name: "All Departments" },
    { id: "dept1", name: "Engineering" },
    { id: "dept2", name: "Sales" },
    { id: "dept3", name: "HR" },
    { id: "dept4", name: "Marketing" },
  ];

  useEffect(() => {
    fetchAttendanceData();
    fetchStatistics();
    // Check if today's date is selected
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate === today) {
      fetchTodayAttendance();
    }
  }, [selectedDate, selectedDepartment, selectedStatus, currentPage]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/all`, {
        params: {
          date: selectedDate,
          department: selectedDepartment,
          status: selectedStatus,
          page: currentPage,
          limit: 10,
        },
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setAttendanceData(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // Calculate start and end date based on selected date
      const date = new Date(selectedDate);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const response = await axios.get(
        `${API_BASE_URL}/attendance/statistics`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            department: selectedDepartment,
          },
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setStatistics(response.data.statistics || null);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setStatistics(null);
    }
  };

  console.log("Statistics:", statistics);

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get<TodayAttendanceResponse>(
        `${API_BASE_URL}/attendance/today-attendance`,
        {
          params: {
            department: selectedDepartment,
          },
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setTodayAttendance(response.data.details);
        setTodaySummary(response.data.summary);
      }
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      setTodayAttendance(null);
      setTodaySummary(null);
    }
  };

  console.log("Today Attendance:", todayAttendance);

  const handleMarkAttendance = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/attendance/mark`,
        {
          employeeId: selectedEmployee.employeeId,
          date: selectedDate,
          status: manualStatus,
          remarks: remarks,
          adminUserId: localStorage.getItem("userId"),
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Refresh data
        await fetchAttendanceData();
        await fetchStatistics();

        // Refresh today's attendance if viewing today
        const today = new Date().toISOString().split("T")[0];
        if (selectedDate === today) {
          await fetchTodayAttendance();
        }

        setShowMarkModal(false);
        setRemarks("");
        alert("Attendance marked successfully!");
      }
    } catch (error: any) {
      console.error("Error marking attendance:", error);
      alert(error.response?.data?.error || "Failed to mark attendance");
    }
  };

  const openMarkModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setManualStatus(employee.attendance.status);
    setRemarks(employee.attendance.remarks || "");
    setShowMarkModal(true);
  };

  const getStatusColor = (status: AttendanceStatus["status"]) => {
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

  const getStatusIcon = (status: AttendanceStatus["status"]) => {
    switch (status) {
      case "present":
        return <Check className="w-4 h-4" />;
      case "absent":
        return <X className="w-4 h-4" />;
      case "half-day":
        return (
          <div
            className="w-4 h-4 rounded-full border-2 border-current"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          ></div>
        );
      case "leave":
        return <Calendar className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredData = attendanceData.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const exportToCSV = () => {
    const headers = [
      "Employee Code",
      "Name",
      "Department",
      "Check-In",
      "Check-Out",
      "Working Hours",
      "Status",
      "Remarks",
    ];
    const csvData = filteredData.map((emp) => [
      emp.employeeCode,
      emp.name,
      emp.department,
      emp.attendance.checkIn || "-",
      emp.attendance.checkOut || "-",
      emp.attendance.workingHours || 0,
      emp.attendance.status,
      emp.attendance.remarks || "",
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
  };

  // Check if viewing today
  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Attendance Management
          </h1>
          <p className="text-gray-600">
            Monitor and manage employee attendance
          </p>
        </div>

        {/* Statistics Cards - Use today's summary if viewing today, otherwise use monthly stats */}
        {(isToday && todaySummary ? todaySummary : statistics) && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Total</p>
                <Users className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {isToday && todaySummary
                  ? todaySummary.total
                  : statistics?.totalEmployees}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Present</p>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {isToday && todaySummary
                  ? todaySummary.present
                  : statistics?.totalPresent}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Absent</p>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {isToday && todaySummary
                  ? todaySummary.absent
                  : statistics?.totalAbsent}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">
                  {isToday ? "Late" : "Avg Hours"}
                </p>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-indigo-600">
                {isToday && todaySummary
                  ? todaySummary.late
                  : `${statistics?.averageWorkingHours.toFixed(2)}h`}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Half-Day</p>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {isToday && todaySummary
                  ? todaySummary.halfDay
                  : statistics?.totalHalfDay}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Leave</p>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {isToday && todaySummary
                  ? todaySummary.leave
                  : statistics?.totalLeave}
              </p>
            </div>
          </div>
        )}

        {/* Rest of the component remains the same... */}
        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half-day">Half-Day</option>
                <option value="leave">Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actions
              </label>
              <button
                onClick={exportToCSV}
                disabled={filteredData.length === 0}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Employee
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Department
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Check-In
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Check-Out
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Hours
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((employee) => (
                    <tr
                      key={employee.employeeId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {employee.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {employee.employeeCode}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {employee.department}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {employee.attendance.checkIn || "--"}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {employee.attendance.checkOut || "--"}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {employee.attendance.workingHours
                          ? `${employee.attendance.workingHours}h`
                          : "--"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                            employee.attendance.status
                          )}`}
                        >
                          {getStatusIcon(employee.attendance.status)}
                          {employee.attendance.status.toUpperCase()}
                        </span>
                        {employee.attendance.remarks && (
                          <p className="text-xs text-gray-500 mt-1">
                            {employee.attendance.remarks}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openMarkModal(employee)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Mark
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredData.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredData.length} of {totalCount} employees
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Mark Attendance
            </h3>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Employee</p>
              <p className="text-lg font-semibold text-gray-800">
                {selectedEmployee.name}
              </p>
              <p className="text-sm text-gray-500">
                {selectedEmployee.employeeCode}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["present", "absent", "half-day", "leave"].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setManualStatus(status as AttendanceStatus["status"])
                    }
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      manualStatus === status
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (Optional)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any notes..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMarkModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Mark Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
