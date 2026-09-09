import { NavLink } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoSettings } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};

const Sidebar = ({ isOpen = false, onClose }: Props) => {
  const { user } = useAuth();
  const navigation = (
    <div>
      <NavLink
        to="/employee-dashboard"
        onClick={onClose}
        className={({ isActive }) =>
          `${
            isActive ? "bg-white !text-black" : "!text-white"
          } flex pl-10 py-4 rounded-l-full mt-5 hover:bg-white hover:!text-black`
        }
        end
      >
        <div className="flex gap-5 items-center">
          <MdDashboard className="" />{" "}
          <span className="source-sans-3-semibold ">Dashboard</span>
        </div>
      </NavLink>
      <NavLink
        to={`/employee-dashboard/profile/${user?._id}`}
        onClick={onClose}
        className={({ isActive }) =>
          `${
            isActive ? "bg-white !text-black" : "!text-white"
          } flex pl-10 py-4 rounded-l-full mt-5 hover:bg-white hover:!text-black`
        }
      >
        <div className="flex gap-5 items-center">
          <FaUsers className="" />{" "}
          <span className="source-sans-3-semibold ">My Profile</span>
        </div>
      </NavLink>
      <NavLink
        to="/employee-dashboard/leaves"
        onClick={onClose}
        className={({ isActive }) =>
          `${
            isActive ? "bg-white !text-black" : "!text-white"
          } flex pl-10 py-4 rounded-l-full mt-5 hover:bg-white hover:!text-black`
        }
      >
        <div className="flex gap-5 items-center">
          <IoCalendarNumberOutline className="" />{" "}
          <span className="source-sans-3-semibold ">Leaves</span>
        </div>
      </NavLink>
      <NavLink
        to="/employee-dashboard/attendance"
        onClick={onClose}
        className={({ isActive }) =>
          `${
            isActive ? "bg-white !text-black" : "!text-white"
          } flex pl-10 py-4 rounded-l-full mt-5 hover:bg-white hover:!text-black`
        }
      >
        <div className="flex gap-5 items-center">
          <SlCalender className="" />{" "}
          <span className="source-sans-3-semibold ">Attendence</span>
        </div>
      </NavLink>
      <NavLink
        to="/employee-dashboard/settings"
        onClick={onClose}
        className={({ isActive }) =>
          `${
            isActive ? "bg-white !text-black" : "!text-white"
          } flex pl-10 py-4 rounded-l-full mt-5 hover:bg-white hover:!text-black`
        }
      >
        <div className="flex gap-5 items-center">
          <IoSettings className="" />{" "}
          <span className="source-sans-3-semibold ">Settings</span>
        </div>
      </NavLink>
    </div>
  );

  return (
    <>
      <div
        className={`bg-secondary h-full absolute w-full md:hidden ${
          isOpen ? "z-50 block" : "hidden -z-20"
        }`}
      >
        <div className="p-4">
          <button className="text-white mb-4" onClick={onClose}>
            Close
          </button>
        </div>
        {navigation}
      </div>

      <div className="w-[350px] bg-secondary min-h-screen py-5 pl-[18px] hidden md:block">
        <h2 className="source-sans-3-bold text-white text-2xl pb-4 border-b mr-[18px] text-center">
          Employee Dashboard
        </h2>
        {navigation}
      </div>
    </>
  );
};

export default Sidebar;
