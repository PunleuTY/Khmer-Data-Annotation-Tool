// src/components/Footer.jsx
import { FaGithub, FaTelegramPlane, FaFacebook } from "react-icons/fa";
import NewLogo from "../assets/NewLogo.png";

const Footer = () => {
  return (
    <footer className="bg-white text-[#12284C] pt-4">
      <h1
        className="flex justify-center text-5xl pb-12 font-cadt text-transparent"
        style={{
          WebkitTextStroke: "3px #FF3F34", // stroke width + color
        }}
      >
        Stay Connect
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left text-sm">
        {/* First Grid: Logo */}
        <div className="flex justify-center md:justify-start">
          <img
            src={NewLogo}
            alt="Annotated Document"
            className="w-28 md:w-32 object-contain"
          />
        </div>

        {/* Team Collaborate */}
        <div>
          <h4 className="font-bold mb-2">Team Collaborate</h4>
          <ul className="space-y-1">
            <li>
              <a href="#">GitHub</a>
            </li>
            <li>
              <a href="#">Discord</a>
            </li>
            <li>
              <a href="#">Click Up</a>
            </li>
            <li>
              <a href="#">Telegram</a>
            </li>
            <li>
              <a href="#">Google Meet</a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold mb-2">Get in touch</h4>
          <div className="flex justify-center md:justify-start space-x-4 mt-2">
            <a href="#">
              <FaGithub className="text-2xl hover:text-gray-600" />
            </a>
            <a href="#">
              <FaTelegramPlane className="text-2xl hover:text-blue-400" />
            </a>
            <a href="#">
              <FaFacebook className="text-2xl hover:text-blue-600" />
            </a>
          </div>
        </div>

        {/* Useful Links */}
        <div>
          <h4 className="font-bold mb-2">USEFULL LINKS</h4>
          <ul className="space-y-1">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Upload</a>
            </li>
            <li>
              <a href="#">Result</a>
            </li>
            <li>
              <a href="#">Report</a>
            </li>
            <li>
              <a href="#">About Us</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="text-center text-sm font-bold mt-8 p-2 text-white bg-[#12284C]">
        ©2025 Khmer Data Annotation Tool
      </div>
    </footer>
  );
};

export default Footer;
