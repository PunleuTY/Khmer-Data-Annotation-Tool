import { NavLink, useNavigate } from "react-router-dom";
import { RiErrorWarningLine } from "react-icons/ri";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaSortAmountUp, FaHome } from "react-icons/fa";
import { MdOutlineUploadFile } from "react-icons/md";
import Logo from "../assets/profiles/Logo.png";
import NewLogoWhite from "../assets/NewLogoWhite.png";
import { TbLogout2 } from "react-icons/tb";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const navigationItems = [
    { name: "My Project", path: "/project", icon: FaSortAmountUp },
    { name: "Home", path: "/", icon: FaHome },
    { name: "Feature", path: "/feature", icon: FaWandMagicSparkles },
    { name: "Annotate", path: "/annotate", icon: MdOutlineUploadFile },
    { name: "About", path: "/about", icon: RiErrorWarningLine },
  ];

  return (
    <div className="flex flex-col h-screen w-16 md:w-56 transition-all duration-300 bg-[#FF3F34]">
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-center">
        <img
          src={NewLogoWhite}
          alt="Logo"
          className="object-contain w-8 md:w-20"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start px-4 py-3 rounded-xl mx-2 transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#FF3F34]"
                    : "text-white hover:bg-opacity-10 hover:text-black"
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="hidden md:inline ml-6 font-bold text-sm">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
