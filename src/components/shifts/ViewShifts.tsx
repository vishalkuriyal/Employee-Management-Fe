import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type ShiftType = {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  isCrossMidnight: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

const ViewShifts = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8001/api/shifts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setShifts(response.data.shifts);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || "Failed to fetch shifts");
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shiftId: string) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8001/api/shifts/${shiftId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Shift deleted successfully!");
        fetchShifts(); // Refresh the list
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.error || "Failed to delete shift");
      } else {
        alert("An unexpected error occurred");
      }
      console.error("Error deleting shift:", error);
    }
  };

  const handleEdit = (shiftId: string) => {
    navigate(`/admin-dashboard/shifts/edit/${shiftId}`);
  };

  const handleAddShift = () => {
    navigate("/admin-dashboard/shifts/add");
  };

  // Format time to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading shifts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error: {error}</p>
        <button
          onClick={fetchShifts}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Shift Management
            </h2>
            <p className="text-gray-600 mt-1">Total Shifts: {shifts.length}</p>
          </div>
          <button
            onClick={handleAddShift}
            className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium"
          >
            + Add New Shift
          </button>
        </div>

        {/* Shifts Grid */}
        {shifts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Shifts Found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first shift schedule
            </p>
            <button
              onClick={handleAddShift}
              className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
            >
              Create Shift
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shifts.map((shift) => (
              <div
                key={shift._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                {/* Shift Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {shift.name}
                    </h3>
                    {shift.isCrossMidnight && (
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Crosses Midnight
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Time Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Start Time</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatTime(shift.startTime)}
                      </p>
                    </div>
                    <div className="text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">End Time</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatTime(shift.endTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {shift.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{shift.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(shift._id)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(shift._id)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
                  Created: {new Date(shift.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewShifts;
