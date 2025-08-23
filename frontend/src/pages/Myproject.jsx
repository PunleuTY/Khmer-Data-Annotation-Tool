import Footer from "../components/Footer";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectContext } from "./Annotate";

export let CurrentProjectContext = 0;
const project = () => {
  return (
    <div className="min-h-full bg-gray-50 m-6">
      <h1 className=" text-5xl text-[#ff3f34] font-cadt ">Project Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-20">
        <NavLink
          to={`/annotate`}
          key={project.id}
          className="flex items-center justify-center flex-col bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <img
            src="data:image/png;base64,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" // Placeholder image
            alt={project.name}
            className="w-38 h-38 object-cover rounded p-10"
            onClick={() => {
              CurrentProjectContext = "default";
            }}
        />
          <h2 className="text-2xl font-bold mb-4">Create Project</h2>
        </NavLink>
        {ProjectContext.map((project) => (
          <NavLink
            to={`/annotate`}
            key={project.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => {
              CurrentProjectContext = project.id;
            }}
          >
            <img
              src="https://i.pinimg.com/736x/20/8e/c6/208ec63c8e2a16e00af077c2facb5707.jpg"
              alt={project.name}
              className="w-full h-38 object-cover mb-4 rounded"
            />
            <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
            <p className="text-gray-700 mb-4">
              {project.description || "No description available."}
            </p>
          </NavLink>
        ))}
      </div>
      {/* <NavLink
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
      </NavLink> */}
      <Footer />
    </div>
  );
};

export default project;
