import axios from "axios";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ShiftType = {
  _id: string;
  name: string;
  displayName: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  minimumHours: number;
  isCrossMidnight: boolean;
  description: string;
  isActive: boolean;
};

type FormType = {
  name: string;
  displayName: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  minimumHours: number;
  isCrossMidnight: boolean;
  description: string;
  isActive: boolean;
};

const EditShift = () => {
  const [shift, setShift] = useState<FormType>({
    name: "",
    displayName: "",
    startTime: "",
    endTime: "",
    graceMinutes: 15,
    minimumHours: 8,
    isCrossMidnight: false,
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch shift data
  useEffect(() => {
    const fetchShift = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8001/api/shifts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          const shiftData = response.data.shift;
          setShift({
            name: shiftData.name || "",
            displayName: shiftData.displayName || "",
            startTime: shiftData.startTime || "",
            endTime: shiftData.endTime || "",
            graceMinutes: shiftData.graceMinutes || 15,
            minimumHours: shiftData.minimumHours || 8,
            isCrossMidnight: shiftData.isCrossMidnight || false,
            description: shiftData.description || "",
            isActive:
              shiftData.isActive !== undefined ? shiftData.isActive : true,
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data.error || "Failed to fetch shift data");
          alert(error.response.data.error);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, [id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setShift({ ...shift, [name]: checked });
    } else if (type === "number") {
      setShift({ ...shift, [name]: Number(value) });
    } else {
      setShift({ ...shift, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!shift.name || shift.name.trim() === "") {
      alert("Shift type is required");
      return;
    }

    if (!shift.displayName || shift.displayName.trim() === "") {
      alert("Shift name is required");
      return;
    }

    if (!shift.startTime || !shift.endTime) {
      alert("Start time and end time are required");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8001/api/shifts/${id}`,
        shift,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Shift updated successfully!");
        navigate("/admin-dashboard/shifts");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error details:", error.response?.data);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.details ||
          "Failed to update shift";
        alert(errorMessage);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading shift data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="px-14 bg-background">
      <div className="max-w-3xl mx-auto mt-10 bg-white px-14 py-16">
        <h3 className="source-sans-3-semibold text-2xl text-center mb-8">
          Edit Shift
        </h3>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Shift Type - DROPDOWN */}
          <div className="flex flex-col">
            <label htmlFor="name" className="source-sans-3-medium">
              Shift Type <span className="text-red-500">*</span>
            </label>
            <select
              name="name"
              value={shift.name}
              className="border border-black/30 px-4 py-2 w-full outline-none"
              onChange={handleChange}
              required
            >
              <option value="">Select Shift Type</option>
              <option value="Morning">Morning</option>
              <option value="Night">Night</option>
              <option value="General">General</option>
            </select>
            <span className="text-sm text-gray-500 mt-1">
              Choose the general shift category
            </span>
          </div>

          {/* Display Name - TEXT INPUT */}
          <div className="flex flex-col">
            <label htmlFor="displayName" className="source-sans-3-medium">
              Shift Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Morning Shift 1 (9AM-6PM), Night Shift A"
              name="displayName"
              value={shift.displayName}
              className="border border-black/30 px-4 py-2 w-full outline-none"
              onChange={handleChange}
              required
            />
            <span className="text-sm text-gray-500 mt-1">
              Custom name to identify this specific shift
            </span>
          </div>

          {/* Start Time */}
          <div className="flex flex-col">
            <label htmlFor="startTime" className="source-sans-3-medium">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="startTime"
              value={shift.startTime}
              className="border border-black/30 px-4 py-2 w-full outline-none"
              onChange={handleChange}
              required
            />
          </div>

          {/* End Time */}
          <div className="flex flex-col">
            <label htmlFor="endTime" className="source-sans-3-medium">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={shift.endTime}
              className="border border-black/30 px-4 py-2 w-full outline-none"
              onChange={handleChange}
              required
            />
          </div>

          {/* Crosses Midnight Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isCrossMidnight"
              id="isCrossMidnight"
              checked={shift.isCrossMidnight}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="isCrossMidnight"
              className="source-sans-3-medium cursor-pointer"
            >
              Shift crosses midnight
            </label>
            <span className="text-sm text-gray-500">
              (e.g., 22:00 to 06:00)
            </span>
          </div>

          {/* Grace Minutes */}
          <div className="flex flex-col">
            <label htmlFor="graceMinutes" className="source-sans-3-medium">
              Grace Period (minutes)
            </label>
            <input
              type="number"
              name="graceMinutes"
              value={shift.graceMinutes}
              min="0"
              max="60"
              className="border border-black/30 px-4 py-2 w-full outline-none"
              onChange={handleChange}
              placeholder="Default: 15 minutes"
            />
            <span className="text-sm text-gray-500 mt-1">
              Time allowed after shift start without marking as late
            </span>
          </div>

          {/* Minimum Hours */}
          <div className="flex flex-col">
            <label htmlFor="minimumHours" className="source-sans-3-medium">
              Minimum Working Hours
            </label>
            <input
              type="number"
              name="minimumHours"
              value={shift.minimumHours}
              min="1"
              max="24"
              step="0.5"
              className="border border-black/30 px-4 py-2 w-full outline-none"
              onChange={handleChange}
              placeholder="Default: 8 hours"
            />
            <span className="text-sm text-gray-500 mt-1">
              Minimum hours required to mark attendance as present
            </span>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={shift.isActive}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="isActive"
              className="source-sans-3-medium cursor-pointer"
            >
              Active Shift
            </label>
            <span className="text-sm text-gray-500">
              Inactive shifts won't be available for assignment
            </span>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label htmlFor="description" className="source-sans-3-medium">
              Description
            </label>
            <textarea
              name="description"
              value={shift.description}
              placeholder="Optional description for this shift"
              className="px-4 py-2 border border-black/30 w-full outline-none min-h-[100px]"
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard/shifts")}
              className="px-4 py-2 border w-full bg-gray-300 text-gray-800 cursor-pointer hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border w-full bg-secondary text-white cursor-pointer hover:bg-secondary/90 transition-colors"
            >
              Update Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShift;
