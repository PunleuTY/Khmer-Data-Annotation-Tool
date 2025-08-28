import Footer from "../components/Footer";
import { FcApproval } from "react-icons/fc";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdOutlineArrowDropDown } from "react-icons/md";
import home from "../assets/home.png";
import homepage from "../assets/homepage.jpg";
import Nav2 from "../assets/Nav2.png";
import {
  FaUpload,
  FaDrawPolygon,
  FaSearch,
  FaCheck,
  FaFileExport,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";
import { TbTextScan2 } from "react-icons/tb";
import { NavLink, useNavigate } from "react-router-dom";

export let MyProjects = false;

const workflowSteps = [
  {
    title: "OCR gibberish",
    description:
      "Maybe the wrong language is set, or the OCR can’t read the text clearly.",
    icon: <TbTextScan2 className="text-white-500" />,
    color: "bg-orange-500",
  },
  {
    title: "Polygon won’t finish",
    description:
      "You didn’t complete the polygon properly,double-click to close.",
    icon: <FaDrawPolygon className="text-white-500" />,
    color: "bg-blue-500",
  },
  {
    title: "Overlaps causing duplicates",
    description: "Multiple overlapping regions on the same text line.",
    icon: <FaSearch className="text-white-500" />,
    color: "bg-green-500",
  },
  {
    title: "Low accuracy",
    description:
      "The annotation box is too big/loose, or the text is rotated/curved.",
    icon: <FaCheck className="text-white-500" />,
    color: "bg-yellow-500",
  },
];
const dataItems = [
  {
    number: "01",
    title: <span className="text-blue-400">Upload Images</span>,
    description: (
      <>
        <span className=" text-sky-600">Click</span> on select image button to
        drag & drop or import images for adding one or many files (JPG/PNG).
        <p>
          <span className="font-bold text-sky-600">Tip : </span>
          <span>
            {" "}
            Use high-quality, clear images to get better OCR results later.
          </span>
        </p>
      </>
    ),
    color: "bg-blue-400",
    icon: <FaUpload style={{ color: "#2798F5" }} />,
  },
  {
    number: "04",
    title: <span className="text-blue-400">Validate</span>,
    description: (
      <>
        Compare OCR output against the actual text (ground truth) you enter. The
        system calculates accuracy at the character or word level.
        <p>
          <span className="font-bold text-sky-600">Tip : </span>
          <span>
            {" "}
            Checks the quality of OCR and correct OCR mistakes immediately to
            improve dataset reliability.
          </span>
        </p>
      </>
    ),
    color: "bg-blue-500",
    icon: <FaSearch className="text-white-500" />,
  },
  {
    number: "02",
    title: <span className="text-blue-400">Annotation</span>,
    description: (
      <>
        Select the type of annotation you need:
        <ul className="list-disc ml-5 mt-2">
          <li>Box: A rectangular shape to mark the text area.</li>
          <li>
            Polygon: Custom shape that follows the exact outline of the text.
          </li>
        </ul>
        <p>
          <span className="font-bold text-sky-600">Tip : </span>
          <span>
            {" "}
            Use high-quality, clear images to get better OCR results later.
          </span>
        </p>
      </>
    ),
    color: "bg-sky-500",
    icon: <FaDrawPolygon style={{ color: "#2798E5" }} />,
  },
  {
    number: "05",
    title: <span className="text-sky-600">Edit Result</span>,
    description: (
      <>
        <span className="text-blue-500">Click</span> on JSON edit button to
        modify the OCR results or annotations,
        <span className="text-blue-500">Then,</span> apply changes.
        <p>
          <span className="font-bold text-sky-600">Tip : </span>
          <span>
            {" "}
            Use high-quality, clear images to get better OCR results later.
          </span>
        </p>
      </>
    ),
    color: "bg-sky-600",
    icon: <FaClipboardList />,
  },
  {
    number: "03",
    title: <span className="text-sky-600">Extract Text (OCR)</span>,
    description: (
      <>
        Run or Scan OCR engine to extract Khmer/English text.
        <p>
          <span className="font-bold text-sky-600">Tip : </span>
          <span>
            {" "}
            Transforms image-based text into machine-readable format and you can
            re-run OCR after refining annotations.
          </span>
        </p>
      </>
    ),
    color: "bg-sky-600",
    icon: <FaChartLine />,
  },
  {
    number: "06",
    title: <span style={{ color: "#2798B5" }}>Export</span>,
    description: (
      <>
        Export your annotated data in standard formats JSON/YOLO for use in
        machine learning models or other applications.
        <p>
          <span className="font-bold text-sky-600">Tip:</span>
          <span>
            {" "}
            Store your JSON files and keep a copy of the original images along
            with your annotations in safe storage.
          </span>
        </p>
      </>
    ),
    color: "bg-sky-700",
    icon: <FaFileExport style={{ color: "#2798B5" }} />,
  },
];
export const Home = () => {
  return (
    <div className="home-container">
      {/* Welcome Banner */}
      {/* <div className="flex justify-between items-center h-55 bg-blue-100 p-6 m-4 rounded-lg mt-8 mb-4">
        <div>
          <h1 className="text-4xl font-bold text-blue-500">
            WELCOME TO HOME PAGE
          </h1>
          <p className="text-blue-500 text-sm">
            Get started to annotate your Khmer text data with utmost precision.
          </p>
        </div>
        <div className="items-center ">
          <img
            src={Nav2}
            alt="Home"
            className="rounded-md max-h-90 object-contain items-center"
          />
        </div>
      </div> */}
      <div className="bg-white m-4 pt-12 rounded-lg">
        <h2 className="text-2xl font-bold ml-8 text-[#12284c] mb-2 text-start ">
          Welcome To
        </h2>
        <h2 className="text-5xl font-cadt ml-8 text-[#ff3f34] mb-4 text-start">
          Khmer Data
        </h2>
        <h2 className="text-5xl font-cadt ml-8 text-[#ff3f34] text-start">
          Annotation Tool
        </h2>
        {/* Tool Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-8">
          {/* Left Content */}
          <div>
            <p className="text-[#12284c] font-semibold max-w-2xl mb-">
              Upload images, annotate text regions, extract Khmer/English text
              with OCR, and validate against ground truth to build high-quality
              datasets.
            </p>

            <ul className="text-[#12284c] font-bold mt-10 space-y-2">
              <li className="flex items-center">
                <FcApproval className="mr-3" /> Bounding box and polygon
                annotations
              </li>
              <li className="flex items-center">
                <FcApproval className="mr-3" /> Khmer and English OCR extraction
              </li>
              <li className="flex items-center">
                <FcApproval className="mr-3" /> Validation with accuracy metrics
              </li>
            </ul>
            <div className="flex gap-4 mt-12">
              {/* Upload Button */}
              <NavLink
                onClick={() => {
                  MyProjects = false;
                }}
                to="/annotate"
                className="bg-[#12284c] text-white px-10 py-3 rounded-2xl flex items-center gap-2 font-cadt"
              >
                Start New Project <FaArrowRightLong />
              </NavLink>

              {/* Scroll Button */}
              <NavLink
                onClick={() => {
                  MyProjects = true;
                }}
                to="/annotate"
                className="bg-[#76bc21] text-white px-10 py-3 rounded-2xl flex items-center gap-2 font-cadt"
              >
                {/* {" "} */}
                My Project <MdOutlineArrowDropDown />
              </NavLink>
            </div>
          </div>
          {/* Right Image Panel */}
          <div className="flex justify-end items-center">
            <div className="bg-white">
              <img
                src={homepage}
                alt="Annotated Document"
                className="rounded-md max-h-100 object-contain"
              />
            </div>
          </div>
        </section>
      </div>
      {/* Instructions Section */}
      <section
        id="instructions"
        className="font-bold mt-20 text-gray-600  text-3xl text-center "
      >
        Annotation Workflow Instructions
      </section>
      <p className="text-gray-600 text-center mb-2 mt-5">
        Follow this detailed step-by-step annotation workflow how to annotate
        images, run OCR, validate, and export your results to more efficiently.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-lg p-6 mt-1 mb-2">
        {dataItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center mb-2 bg-white shadow-md rounded-lg p-3 hover:shadow-lg transition duration-300"
          >
            {/* Left Side - Number */}
            <div
              className={`flex-shrink-0 text-white px-4 py-3 rounded-full ${item.color} font-bold`}
            >
              {item.number}
            </div>

            {/* Middle - Text */}
            <div>
              <h3
                className={`font-bold ml-5 {item.color.replace("bg", "text")}`}
              >
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm max-w-md  ml-5">
                {item.description}
              </p>
            </div>

            {/* Right Side - Icon */}
            <div className="relative flex items-center justify-center w-13 h-13  ml-2 rounded-full bg-white border-4 border-gray-100 mx-1">
              <span className={`text-2xl  ${item.color.replace("bg", "text")}`}>
                {item.icon}
              </span>
            </div>
          </div>
        ))}
        {/* Troubleshooting section */}
      </div>
      <div className="bg-blue-50 p-6 m-4 rounded-lg mt-8 mb-4">
        <h2 className="font-bold text-2xl text-blue-400 text-center mb-8">
          Troubleshooting
        </h2>

        <div className="flex flex-row justify-between items-start space-x-6">
          {workflowSteps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center w-1/4"
            >
              {/* Dot with icon */}
              <span
                className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md text-white mb-4
            ${
              index % 2 === 0
                ? "bg-blue-400"
                : index % 2 === 1
                ? "bg-blue-400"
                : "bg-blue-300"
            }
          `}
              >
                {step.icon}
              </span>
              {/* Title */}
              <h3 className="text-lg   text-gray-500">{step.title}</h3>
              {/* Description */}
              <p className="text-gray-500 text-sm mt-2">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
