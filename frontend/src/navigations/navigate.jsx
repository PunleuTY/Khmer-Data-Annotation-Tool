import { NavLink, useNavigate } from "react-router-dom";
import { RiErrorWarningLine } from "react-icons/ri";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaSortAmountUp } from "react-icons/fa";
import { MdOutlineUploadFile } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import Logo from "../assets/profiles/Logo.png";
const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");

  };

  const navigationItems = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Feature", path: "/feature", icon: FaWandMagicSparkles },
    { name: "Annotate", path: "/annotate", icon: MdOutlineUploadFile },
    { name: "About", path: "/about", icon: RiErrorWarningLine },
  ];
  return (
    <div className="w-56 text-white flex flex-col h-screen">
      {/* Logo Section */}
      {/* <div className="p-6 bg-[#ff3f34] bg-opacity-20  mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">BL</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Bread Lady</h1>
            <p className="text-blue-100 text-sm">Data Tool</p>
          </div>
        </div>
      </div> */}

      {/* Logo Section */}
      <div className="p-6 bg-white bg-opacity-20 mb-6 flex items-center justify-center">
        <img
          src= {Logo}
          alt="Logo"
          className="object-contain"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-6 px-6 py-4 transition-all duration-200 font-cadt ${isActive
                  ? "bg-opacity-25 bg-[#ff3f34] shadow-lg "
                  : "text-[#12284c] hover:bg-opacity-10 hover:text-[#ff3f34] hover:bg-opacity-10"
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-black border-opacity-30">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-white hover:bg-opacity-10 hover:text-blue-500 rounded-lg"
        >
          <TbLogout2 className="w-6 h-6" />
          <span className="font-medium text-[#12284c] font-cadt">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;