import Footer from "../components/Footer";
import { NavLink, useNavigate } from "react-router-dom";
const project = () => {
  return (
    <div className="min-h-full bg-gray-50 m-6">
      <h1 className=" text-5xl text-[#ff3f34] font-cadt ">Project Page</h1>
      <NavLink
        key="annotate"
        to="/annotate"
        className={({ isActive }) =>
          `flex items-center space-x-6 px-6 py-4 transition-all rounded-3xl border-4 m-6 duration-200 font-cadt ${
            isActive
              ? "bg-opacity-25 bg-[#ff3f34] shadow-lg "
              : "text-[#12284c] hover:bg-opacity-10 hover:text-[#ff3f34] hover:bg-opacity-10"
          }`
        }
      >
        Click here Go to Annotation Page
      </NavLink>



      <Footer />
    </div>
  );
};

export default project;
