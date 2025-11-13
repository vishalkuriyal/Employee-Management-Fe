import axios from "axios";
import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

type FormType = {
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  minimumHours: number;
  isCrossMidnight: boolean;
  description: string;
};

const AddShift = () => {
  const [shift, setShift] = useState<FormType>({
    name: "",
    startTime: "",
    endTime: "",
    graceMinutes: 15,
    minimumHours: 8,
    isCrossMidnight: false,
    description: "",
  });

  const navigate = useNavigate();

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
      alert("Shift name is required");
      return;
    }

    if (!shift.startTime || !shift.endTime) {
      alert("Start time and end time are required");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/shifts/add",
        shift,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Shift added successfully!");
        navigate("/admin-dashboard/shifts");
      }
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        !error.response.data.success
      ) {
        alert(error.response.data.error);
      } else {
        alert("Failed to add shift");
      }
    }
  };

  return (
    <div className="px-14 bg-background">
      <div className="max-w-3xl mx-auto mt-10 bg-white px-14 py-16">
        <h3 className="source-sans-3-semibold text-2xl text-center mb-8">
          Add Shift
        </h3>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Shift Name */}
          <div className="flex flex-col">
            <label htmlFor="name" className="source-sans-3-medium">
              Shift Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Morning Shift, Night Shift"
              name="name"
              value={shift.name}
              className="border border-black/30 px-4 py-2 w-full outline-none"
              onChange={handleChange}
              required
            />
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

          {/* Submit Button */}
          <button
            type="submit"
            className="px-4 py-2 border w-full mt-4 bg-secondary text-white cursor-pointer hover:bg-secondary/90 transition-colors"
          >
            Add Shift
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddShift;