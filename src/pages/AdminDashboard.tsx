import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/dashboard/AdminSidebar";
import Navbar from "../components/dashboard/Navbar";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row bg-background relative">
      <AdminSidebar
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

export default AdminDashboard;
