import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/employeeDashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";

const EmployeeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  return (
    <div className="flex flex-col sm:flex-row bg-background relative">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="sm:flex-1/2">
        <Navbar toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
