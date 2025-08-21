import { NavLink, useNavigate } from "react-router-dom";
import { RiErrorWarningLine } from "react-icons/ri";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaSortAmountUp } from "react-icons/fa";
import { MdOutlineUploadFile } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import { TbReport } from "react-icons/tb";
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
    // { name: "Annotate", path: "/annotate", icon: MdOutlineUploadFile },
    { name: "Annotate", path: "/project", icon: MdOutlineUploadFile },
    { name: "About", path: "/about", icon: RiErrorWarningLine },
  ];
  return (
    <div className={"w-56 text-white flex flex-col h-screen"}>
      {/* Logo Section */}
      {/* <div className="p-6 bg-[#ff3f34] bg-opacity-20  mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-[#0099FFB3] rounded-full flex items-center justify-center">
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
      <nav className="flex-1 px-4 space-y-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-8 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#DFEFFA] bg-opacity-15 text-[#0099FFB3] shadow-lg"
                    : "text-blue-100 hover:bg-[#DFEFFA] hover:bg-opacity-10 hover:text-[#0099FFB3]"
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
      <div className="m-4 border-t border-black border-opacity-30">
        <div className="bg-red-300 flex justify-center rounded-3xl flex-col items-center p-2">
          <h1 className="font-bold text-white">Help Center</h1>
          <h2>Have a problem ?</h2>
          <h2>How can we help you ?</h2>
          <button className="bg-green-400">Message</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;