import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { fetchDepartments } from "../../utils/EmployeeHelpers";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type DepartmentType = {
  _id: string;
  sno?: string;
  dep_name: string;
  description: string;
  action?: React.ReactNode;
};

type ShiftType = {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  isCrossMidnight: boolean;
};

type FormDataType = {
  // Personal Information
  name: string;
  email: string;
  password: string;
  employeeId: string;
  dob: string;
  doj: string;
  gender: "Male" | "Female" | "Others" | "";

  // Work Information
  department: string;
  shiftId: string; // ⭐ NEW: Shift assignment
  phoneNumber: string;
  salary: number;
  role: "admin" | "employee" | "";

  // File Upload
  image: File | null;

  // Banking Information
  bankBranch: string;
  bankIfsc: string;
  accountNumber: string;
};

const AddEmployee = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [shifts, setShifts] = useState<ShiftType[]>([]); // ⭐ NEW: Shifts state
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    dob: "",
    doj: "",
    gender: "",
    department: "",
    shiftId: "", // ⭐ NEW: Shift field
    phoneNumber: "",
    salary: 0,
    role: "",
    image: null,
    bankBranch: "",
    bankIfsc: "",
    accountNumber: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const departmentsData = await fetchDepartments();
        setDepartments(departmentsData);

        // ⭐ NEW: Fetch shifts
        const shiftsResponse = await axios.get(
          'http://localhost:8000/api/shifts',
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (shiftsResponse.data.success) {
          setShifts(shiftsResponse.data.shifts);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load departments or shifts");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle file input separately
    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const files = fileInput.files;
      
      if (files && files.length > 0) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: files[0]
        }));
      }
    } else {
      // Type assertion to ensure TypeScript knows this is a valid key
      const fieldName = name as keyof FormDataType;
      
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: type === "number" ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ⭐ NEW: Validate shift is selected
    if (!formData.shiftId) {
      alert("Please select a shift for the employee");
      return;
    }

    // Create a new FormData object
    const formDataObj = new FormData();
    
    // Add text fields to FormData
    formDataObj.append("name", formData.name);
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);
    formDataObj.append("employeeId", formData.employeeId);
    formDataObj.append("dob", formData.dob);
    formDataObj.append("doj", formData.doj);
    formDataObj.append("gender", formData.gender);
    formDataObj.append("department", formData.department);
    formDataObj.append("shiftId", formData.shiftId); // ⭐ NEW: Add shift to form data
    formDataObj.append("phoneNumber", formData.phoneNumber);
    formDataObj.append("salary", formData.salary.toString());
    formDataObj.append("role", formData.role);
    formDataObj.append("bankBranch", formData.bankBranch);
    formDataObj.append("bankIfsc", formData.bankIfsc);
    formDataObj.append("accountNumber", formData.accountNumber);
    
    // Add the file separately if it exists
    if (formData.image) {
      formDataObj.append("image", formData.image);
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/employees/add', 
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        navigate('/admin-dashboard/employees');
      }
    } catch (error) {
      if (axios.isAxiosError(error) &&
          error.response &&
          error.response.data &&
          !error.response.data.success) {
        alert(error.response.data.error);
      } else {
        console.error("Upload error:", error);
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="px-14 bg-background">
      <div className="max-w-4xl mx-auto mt-10 bg-white px-14 py-16">
        <h3 className="source-sans-3-semibold text-2xl text-center mb-8">
          Add Employee
        </h3>
        <form className="" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-10 mb-4 overflow-y-scroll max-h-[500px]">
            <div className="flex flex-col">
              <label htmlFor="name" className="source-sans-3-medium">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter Employee Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="border-b border-black/30 px-4 py-2 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="source-sans-3-medium">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                required
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="source-sans-3-medium text-lg" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Enter Your Password"
                className="border-b px-4 py-2 outline-none border-black/30"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="source-sans-3-medium">Employee ID</label>
              <input
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Employee ID"
                required
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="source-sans-3-medium">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                placeholder="Date of Birth"
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="source-sans-3-medium">Date of Joining</label>
              <input
                type="date"
                name="doj"
                value={formData.doj}
                onChange={handleChange}
                placeholder="Date of Birth"
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="source-sans-3-medium">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="source-sans-3-medium">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              >
                <option value="">Select Department</option>
                {departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.dep_name}
                  </option>
                ))}
              </select>
            </div>
            {/* ⭐ NEW: Shift Selection */}
            <div className="flex flex-col">
              <label className="source-sans-3-medium">
                Shift <span className="text-red-500">*</span>
              </label>
              <select
                name="shiftId"
                value={formData.shiftId}
                onChange={handleChange}
                required
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              >
                <option value="">Select Shift</option>
                {shifts.map((shift) => (
                  <option key={shift._id} value={shift._id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                    {shift.isCrossMidnight && " (Crosses Midnight)"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="phoneNumber" className="source-sans-3-medium">
                Contact Number
              </label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="source-sans-3-medium">Salary</label>
              <input
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter Salary"
                required
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="source-sans-3-medium">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="source-sans-3-medium">Upload Image</label>
              <input
                name="image"
                type="file"
                onChange={handleChange}
                placeholder="Upload Image"
                accept="image/*"
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="bankBranch" className="source-sans-3-medium">
                Bank name
              </label>
              <input
                name="bankBranch"
                value={formData.bankBranch}
                onChange={handleChange}
                placeholder="Enter Bank Branch"
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="bankIfsc" className="source-sans-3-medium">
                Bank IFSC Code
              </label>
              <input
                name="bankIfsc"
                value={formData.bankIfsc}
                onChange={handleChange}
                placeholder="Enter Bank IFSC Code"
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="accountNumber" className="source-sans-3-medium">
                Account Number
              </label>
              <input
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter Account Number"
                className="px-4 py-2 border-b border-black/30 w-full outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 border w-full mt-4 bg-secondary text-white cursor-pointer hover:bg-secondary/90 transition-colors"
          >
            Add Employee
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;