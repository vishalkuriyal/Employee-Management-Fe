import { useAuth } from "../../context/AuthContext";
import { RiLogoutCircleRFill } from "react-icons/ri";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

type Props = {
  toggleSidebar: () => void;
};

const Navbar = ({ toggleSidebar }: Props) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };
  return (
    <div className="h-fit px-14 bg-background">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#E0E0E0] py-6 ">
        <button
          className="sm:hidden w-fit p-5 text-white bg-black"
          onClick={toggleSidebar}
        >
          x
        </button>
        <p className="source-sans-3-semibold text-secondary">
          Welcome {user?.name}
        </p>
        <div className="flex sm:items-center gap-10">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex gap-2 items-center bg-secondary px-6 py-2 cursor-pointer w-fit disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <AiOutlineLoading3Quarters className="text-white animate-spin" />
                <span className="text-white source-sans-3-medium">
                  Logging out...
                </span>
              </>
            ) : (
              <>
                <RiLogoutCircleRFill className="text-white" />
                <span className="text-white source-sans-3-medium">Logout</span>
              </>
            )}
          </button>
          <div className="flex gap-4 items-center">
            <div className="source-sans-3-regular">
              <p className="uppercase text-sm">{user?.name}</p>
              <p className="uppercase text-sm">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
