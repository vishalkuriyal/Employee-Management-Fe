import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../../config/api";

// Define the structure based on the actual API response
type UserType = {
  _id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type DepartmentType = {
  _id: string;
  dep_name: string;
  description: string;
};

type EmployeeDataType = {
  _id: string;
  employeeId: string;
  dob: string;
  gender: string;
  phoneNumber: string;
  salary: number;
  accountNumber: string;
  bankBranch: string;
  bankIfsc: string;
  department: DepartmentType;
  userId: UserType;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type LeaveBalanceType = {
  casual: {
    available: number;
    used: number;
    remaining: number;
    monthlyAllocation: number;
  };
  sick: {
    available: number;
    used: number;
    remaining: number;
    monthlyAllocation: number;
  };
  doj: string;
  currentYear: number;
};

type ApiResponse = {
  success: boolean;
  employee: EmployeeDataType;
};

type LeaveBalanceResponse = {
  success: boolean;
  leaveBalance: LeaveBalanceType;
};

const ViewEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState<EmployeeDataType | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalanceType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const response = await axios.get<ApiResponse>(
          `${API_URL}/api/employees/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          setEmployee(response.data.employee);

          // Fetch leave balance using the userId
          fetchLeaveBalance(response.data.employee.userId._id);
        }
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response &&
          !error.response.data.success
        ) {
          setError(error.response.data.error || "An error occurred");
          alert(error.response.data.error);
        } else {
          setError("Failed to fetch employee data");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchLeaveBalance = async (userId: string) => {
      setLeaveLoading(true);
      try {
        const response = await axios.get<LeaveBalanceResponse>(
          `${API_URL}/api/leave/balance/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          setLeaveBalance(response.data.leaveBalance);
        }
      } catch (error) {
        console.error("Failed to fetch leave balance:", error);
        // Don't set error state - just log it, as leave balance is optional info
      } finally {
        setLeaveLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  console.log("Employee Data:", employee);
  console.log("Leave Balance Data:", leaveBalance);

  if (loading) {
    return <div className="p-4 px-14">Loading employee data...</div>;
  }

  if (error) {
    return <div className="p-4 px-14 text-red-600">Error: {error}</div>;
  }

  if (!employee) {
    return <div className="p-4 px-14">No employee data found</div>;
  }

  return (
    <div className="p-4 px-14">
      <h1 className="text-3xl source-sans-3-bold mb-4">Employee Details</h1>

      <div className="bg-white shadow rounded p-6">
        <div className="flex items-center mb-6">
          {employee.userId.image && (
            <img
              src={`${API_URL}/${employee.userId.image}`}
              alt={employee.userId.name}
              className="w-24 h-24 rounded-full object-cover object-top mr-6"
            />
          )}
          <div>
            <h2 className="text-xl source-sans-3-bold">
              {employee.userId.name}
            </h2>
            <p className="text-gray-600">
              {employee.employeeId} • {employee.department.dep_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-lg mb-2">Personal Information</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Email:</span>{" "}
                {employee.userId.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {employee.phoneNumber}
              </p>
              <p>
                <span className="font-medium">Gender:</span> {employee.gender}
              </p>
              <p>
                <span className="font-medium">Date of Birth:</span>{" "}
                {new Date(employee.dob).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-2">Employment Details</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Department:</span>{" "}
                {employee.department.dep_name}
              </p>
              <p>
                <span className="font-medium">Role:</span>{" "}
                {employee.userId.role}
              </p>
              <p>
                <span className="font-medium">Salary:</span> ₹{" "}
                {employee.salary.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-medium text-lg mb-2">Banking Information</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Bank:</span> {employee.bankBranch}
              </p>
              <p>
                <span className="font-medium">IFSC Code:</span>{" "}
                {employee.bankIfsc}
              </p>
              <p>
                <span className="font-medium">Account Number:</span>{" "}
                {employee.accountNumber}
              </p>
            </div>
          </div>

          {/* Leave Balance Section */}
          <div className="md:col-span-2">
            <h3 className="font-medium text-lg mb-3">
              Leave Balance ({new Date().getFullYear()})
            </h3>

            {leaveLoading ? (
              <p className="text-gray-500 text-sm">Loading leave balance...</p>
            ) : leaveBalance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Casual Leave Card */}
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    Casual Leave
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Available:</span>
                      <span className="font-medium">
                        {leaveBalance.casual.available} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used:</span>
                      <span className="font-medium text-orange-600">
                        {leaveBalance.casual.used} days
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2">
                      <span className="text-gray-700 font-medium">
                        Remaining:
                      </span>
                      <span className="font-bold text-green-600">
                        {leaveBalance.casual.remaining} days
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Monthly allocation:{" "}
                      {leaveBalance.casual.monthlyAllocation} day(s)
                    </div>
                  </div>
                </div>

                {/* Sick Leave Card */}
                <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold text-green-800 mb-3">
                    Sick Leave
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Available:</span>
                      <span className="font-medium">
                        {leaveBalance.sick.available} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used:</span>
                      <span className="font-medium text-orange-600">
                        {leaveBalance.sick.used} days
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-2">
                      <span className="text-gray-700 font-medium">
                        Remaining:
                      </span>
                      <span className="font-bold text-green-600">
                        {leaveBalance.sick.remaining} days
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Monthly allocation: {leaveBalance.sick.monthlyAllocation}{" "}
                      day(s)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Leave balance information not available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
