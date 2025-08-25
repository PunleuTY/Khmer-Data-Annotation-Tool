import { LuShapes } from "react-icons/lu";
import { FiUpload } from "react-icons/fi";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { TbTextScan2 } from "react-icons/tb";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { PiExportBold } from "react-icons/pi";
import Footer from '../components/Footer';
// import { NavLink,Navigate } from "react-router-dom";

const SidebarItem = () => {
  return (
<div className=" text-[#12284c] rounded-lg p-6 text-center mt-6 shadow-md bg-white transform">
      <h2 className="text-3xl font-bold mb-2">Ready to Validate Your Data?</h2>
      <p className="mb-6 text-1xl">
        Upload your datasets Khmer or English and get detailed validation results in seconds!
      </p>
      <a href="/annotate">
      <button className="bg-[#ff3f34] text-white font-semibold px-15 py-2 rounded shadow hover:bg-white hover:text-[#ff3f34] transition">
        Start Validate Now
      </button>
      </a>

    </div>
  );
};

const featuresData = [
  {
    icon: FiUpload,
    title: "Upload Dataset",
    description: "Easily upload your dataset in multiple formats.",
    tag: "Dataset",
  },
  {
    icon: BsBoundingBoxCircles,
    title: "Bounding Box Annotation",
    description: "Annotate objects with accurate bounding boxes.",
    tag: "Annotation",
  },
  {
    icon: LuShapes,
    title: "Polygon Annotation",
    description: "Create polygon shapes for more precise annotations.",
    tag: "Annotation",
  },
  {
    icon: TbTextScan2,
    title: "OCR",
    description: "Extract text from images using OCR technology.",
    tag: "OCR",
  },
  {
    icon: HiOutlineClipboardCheck,
    title: "Validation",
    description: "Check and validate dataset quality easily.",
    tag: "Quality",
  },
  {
    icon: PiExportBold,
    title: "Export",
    description: "Export processed data in multiple output formats.",
    tag: "Output",
  },
];
const Features = () => {
  return (
    <div className="min-h-full bg-gray-50">
    <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <h1 className="text-5xl font-cadt text-[#ff3f34] mb-2 text-center">
        Powerful Features
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Everything you need to validate, clean, and improve your EN and KH datasets.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featuresData.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 flex space-x-4 hover:shadow-lg transition"
          >
            <div className="text-3xl text-gray-500 border-r p-6  flex border-blue-200">
              <f.icon />
            </div>
            <div>
              <h2 className="font-semibold text-gray-600 text-lg">{f.title}</h2>
              <span className="inline-block px-2 py-0.5 mt-1 text-xs bg-blue-100 text-blue-600 rounded">
                {f.tag}
              </span>
              <p className="text-sm text-gray-600 mt-2">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
      <SidebarItem />
    </main>
    <Footer />
    </div>
  );
};

export default Features;

