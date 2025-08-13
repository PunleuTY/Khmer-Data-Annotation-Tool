import { NavLink, useNavigate } from "react-router-dom";
// icons
import { RiErrorWarningLine } from "react-icons/ri";
import { TbReport } from "react-icons/tb";
import { FaSortAmountUp } from "react-icons/fa";
import { MdOutlineUploadFile } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
const Sidebar = () => {
  const navigate = useNavigate();


  
  const navigationItems = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Annotate", path: "/upload", icon: MdOutlineUploadFile },
    { name: "Result", path: "/result", icon: FaSortAmountUp },
    { name: "Report", path: "/report", icon: TbReport },
    { name: "About", path: "/about", icon: RiErrorWarningLine },
  ];

  return (
    <div className="w-64 bg-[#0099FFB3] text-white flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 bg-white bg-opacity-20 rounded-br-3xl mb-6">
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
                    ? "bg-[#DFEFFA] bg-opacity-25 text-[#0099FFB3] shadow-lg"
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

    </div>
  );
};

export default Sidebar;
