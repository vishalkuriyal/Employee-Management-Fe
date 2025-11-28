// ===== SIMPLIFIED FRONTEND FIX: DashboardOverview.tsx =====
import React, { useState, useEffect } from "react";
import { UserCheck, Phone, Mail, Building, RefreshCw } from "lucide-react";
import employee from "../../assets/employees.svg";
import working from "../../assets/working.svg";

// Keep your existing type definitions...
interface LeaveDetails {
  leaveType: "casual" | "sick";
  fromDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: "morning" | "afternoon";
  reason: string;
  appliedDate: string;
}

interface EmployeeOnLeave {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  image?: string;
  department: string;
  phoneNumber?: string;
  leaveDetails: LeaveDetails;
}

interface LeaveBreakdown {
  casual: number;
  sick: number;
}

interface DashboardSummary {
  totalEmployees: number;
  employeesWorkingToday: number;
  employeesOnLeaveToday: number;
  leaveBreakdown: LeaveBreakdown;
}

interface DashboardData {
  summary: DashboardSummary;
  employeesOnLeave: EmployeeOnLeave[];
  date: string;
}

interface ApiResponse {
  success: boolean;
  data: DashboardData;
  error?: string;
}

const DashboardOverview: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Simplified utility function to get auth headers
  const getAuthHeaders = (): HeadersInit => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    console.log("Token found:", token ? "Yes" : "No");

    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      console.log(
        "Fetching dashboard data from:",
        "/api/dashboard/employee-detail"
      );

      const response = await fetch(
        "http://localhost:8001/api/dashboard/employee-detail",
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;

        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const textResponse = await response.text();
            if (textResponse.includes("<!DOCTYPE")) {
              errorMessage =
                "Server returned HTML error page. Check if API endpoint exists.";
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }

        // Handle specific status codes
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
          // Clear tokens
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
        } else if (response.status === 404) {
          errorMessage =
            "Dashboard API endpoint not found. Check server routes.";
        }

        throw new Error(errorMessage);
      }

      // Parse JSON response
      const data: ApiResponse = await response.json();
      console.log("API Response received:", data);

      if (data.success && data.data) {
        setDashboardData(data.data);
        console.log("Dashboard data loaded successfully");
      } else {
        throw new Error(data.error || "API returned unsuccessful response");
      }
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (fromDate: string, endDate: string): string => {
    const from = new Date(fromDate);
    const to = new Date(endDate);

    if (from.toDateString() === to.toDateString()) {
      return formatDate(fromDate);
    }

    return `${formatDate(fromDate)} - ${formatDate(endDate)}`;
  };

  const getLeaveTypeColor = (type: "casual" | "sick"): string => {
    switch (type) {
      case "casual":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "sick":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvatarInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatLeaveDisplay = (leaveDetails: LeaveDetails): string => {
    if (leaveDetails.isHalfDay) {
      return `Half Day (${leaveDetails.halfDayPeriod})`;
    }
    return leaveDetails.totalDays === 1
      ? "1 day"
      : `${leaveDetails.totalDays} days`;
  };

  if (loading) {
    return (
      <div className="px-14 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-[#606060] source-sans-3-semibold">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-14 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
            <h4 className="source-sans-3-semibold mb-2">Dashboard Error</h4>
            <p className="source-sans-3-regular text-sm mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 source-sans-3-semibold transition-colors"
              >
                Try Again
              </button>
              {error.includes("Authentication") && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 source-sans-3-semibold transition-colors"
                >
                  Refresh Page
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="px-14 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#606060] source-sans-3-semibold">
            No dashboard data available
          </p>
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 source-sans-3-semibold transition-colors"
          >
            Reload Data
          </button>
        </div>
      </div>
    );
  }

  const { summary, employeesOnLeave } = dashboardData;

  console.log("summary", summary);

  return (
    <div className="px-14 bg-background">
      {/* Header with Date Selector */}
      <div className="flex justify-between items-center mt-6 mb-6">
        <div>
          <h1 className="text-2xl source-sans-3-bold text-gray-900">
            Employee Dashboard
          </h1>
          <p className="text-[#606060] source-sans-3-regular mt-1">
            Real-time overview • Updated: {formatDate(new Date().toISOString())}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split("T")[0]}
            className="px-3 py-2 border border-[#E1E1E1] rounded focus:ring-2 focus:ring-primary focus:border-transparent source-sans-3-regular opacity-50 cursor-not-allowed"
            disabled
            title="Date filtering - Coming soon"
          />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-[#E1E1E1] rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Refresh dashboard data"
          >
            <RefreshCw
              className={`h-4 w-4 text-[#606060] ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex mt-10 gap-7">
        <div className="w-[35%]">
          {/* Total Employees Card */}
          <div className="py-16 px-10 flex justify-between items-center border border-[#E1E1E1] bg-white mb-4">
            <div className="text-[#606060] source-sans-3-semibold">
              Total <br /> Employee
            </div>
            <div className="source-sans-3-bold text-5xl text-primary">
              {summary.totalEmployees.toString().padStart(2, "0")}
            </div>
            <img className="" src={employee} alt="Total Employees" />
          </div>

          {/* Working Employees Card */}
          <div className="py-16 px-10 flex justify-between items-center border border-[#E1E1E1] bg-white mb-4">
            <div className="text-[#606060] source-sans-3-semibold">
              Working
              <br /> Employee
            </div>
            <div className="source-sans-3-bold text-5xl text-primary">
              {summary.employeesWorkingToday.toString().padStart(2, "0")}
            </div>
            <img className="" src={working} alt="Working Employees" />
          </div>

          {/* Leave Summary Card */}
          <div className="py-6 px-6 border border-[#E1E1E1] bg-white">
            <h4 className="source-sans-3-semibold text-[#606060] mb-4">
              Leave Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="source-sans-3-regular text-sm text-[#606060]">
                  On Leave Today
                </span>
                <span className="source-sans-3-bold text-lg text-orange-600">
                  {summary.employeesOnLeaveToday}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="source-sans-3-regular text-sm text-blue-600">
                  Casual Leave
                </span>
                <span className="source-sans-3-semibold text-blue-600">
                  {summary.leaveBreakdown.casual}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="source-sans-3-regular text-sm text-red-600">
                  Sick Leave
                </span>
                <span className="source-sans-3-semibold text-red-600">
                  {summary.leaveBreakdown.sick}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[60%] flex flex-col justify-end">
          <div className="flex justify-between items-center mb-4">
            <h3 className="source-sans-3-semibold text-gray-900">
              Who is on leave today?
            </h3>
            {employeesOnLeave.length > 0 && (
              <span className="text-sm text-[#606060] source-sans-3-regular">
                {employeesOnLeave.length} employee
                {employeesOnLeave.length !== 1 ? "s" : ""} on leave
              </span>
            )}
          </div>

          {employeesOnLeave.length === 0 ? (
            <div className="w-full bg-white border border-[#E1E1E1] rounded-xl p-12 text-center">
              <UserCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h4 className="source-sans-3-semibold text-lg text-gray-900 mb-2">
                All Hands on Deck!
              </h4>
              <p className="text-[#606060] source-sans-3-regular">
                No employees are on leave today. Everyone is working.
              </p>
            </div>
          ) : (
            <div className="w-full bg-white border border-[#E1E1E1] rounded-xl overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="table-auto w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="border-b border-[#E1E1E1]">
                      <th className="text-left py-4 px-5 source-sans-3-semibold text-[#606060]">
                        Employee
                      </th>
                      <th className="text-left py-4 px-5 source-sans-3-semibold text-[#606060]">
                        Leave Type
                      </th>
                      <th className="text-left py-4 px-5 source-sans-3-semibold text-[#606060]">
                        Duration
                      </th>
                      <th className="text-left py-4 px-5 source-sans-3-semibold text-[#606060]">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeesOnLeave.map((employee: EmployeeOnLeave) => (
                      <tr
                        key={employee._id}
                        className="border-b border-[#E1E1E1] hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {employee.image ? (
                                <img
                                  src={`/uploads/${employee.image}`}
                                  alt={employee.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              ) : null}
                              <div
                                className={`h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center source-sans-3-semibold text-sm ${
                                  employee.image ? "hidden" : ""
                                }`}
                              >
                                {getAvatarInitials(employee.name)}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="source-sans-3-semibold text-gray-900 truncate">
                                {employee.name}
                              </p>
                              <p className="source-sans-3-regular text-sm text-[#606060] truncate">
                                {employee.employeeId} • {employee.department}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs source-sans-3-semibold border ${getLeaveTypeColor(
                              employee.leaveDetails.leaveType
                            )}`}
                          >
                            {employee.leaveDetails.leaveType
                              .charAt(0)
                              .toUpperCase() +
                              employee.leaveDetails.leaveType.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="source-sans-3-regular text-gray-900">
                            {formatLeaveDisplay(employee.leaveDetails)}
                          </div>
                          <div className="source-sans-3-regular text-xs text-[#606060] mt-1">
                            {formatDateRange(
                              employee.leaveDetails.fromDate,
                              employee.leaveDetails.endDate
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="max-w-xs">
                            <p
                              className="source-sans-3-regular text-sm text-gray-900 truncate"
                              title={employee.leaveDetails.reason}
                            >
                              {employee.leaveDetails.reason}
                            </p>
                            <p className="source-sans-3-regular text-xs text-[#606060] mt-1">
                              Applied:{" "}
                              {formatDate(employee.leaveDetails.appliedDate)}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Employee Contact Details */}
              {employeesOnLeave.length > 0 && (
                <div className="border-t border-[#E1E1E1] bg-gray-50 p-4">
                  <details className="group">
                    <summary className="cursor-pointer source-sans-3-semibold text-[#606060] hover:text-primary transition-colors">
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Information
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                          {employeesOnLeave.length}
                        </span>
                      </span>
                    </summary>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employeesOnLeave.map((employee: EmployeeOnLeave) => (
                        <div
                          key={`contact-${employee._id}`}
                          className="bg-white p-4 rounded-lg border border-[#E1E1E1]"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {employee.image ? (
                                <img
                                  src={`/uploads/${employee.image}`}
                                  alt={employee.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center source-sans-3-semibold text-xs">
                                  {getAvatarInitials(employee.name)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="source-sans-3-semibold text-sm text-gray-900">
                                {employee.name}
                              </p>
                              <div className="mt-1 space-y-1">
                                <p className="flex items-center text-xs text-[#606060] source-sans-3-regular">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {employee.email}
                                </p>
                                {employee.phoneNumber && (
                                  <p className="flex items-center text-xs text-[#606060] source-sans-3-regular">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {employee.phoneNumber}
                                  </p>
                                )}
                                <p className="flex items-center text-xs text-[#606060] source-sans-3-regular">
                                  <Building className="h-3 w-3 mr-1" />
                                  {employee.department}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
