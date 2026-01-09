import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/employeeDashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";

const EmployeeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((s) => !s);

  return (
    <div className="flex bg-background">
      {isSidebarOpen && <Sidebar />}
      <div className="flex-1/2">
        <Navbar toggleSidebar={toggleSidebar} />
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
