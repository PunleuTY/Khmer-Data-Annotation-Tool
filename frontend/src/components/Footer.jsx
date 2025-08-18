// src/components/Footer.jsx
import { FaGithub, FaTelegramPlane, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#ff3f34] text-white py-8 px-4">
      <h1 className="flex justify-center text-5xl pb-16 font-cadt" >Stay Connect</h1>
      <div className="max-w-6xl mx-auto flex justify-around md:grid-cols-3 gap-8 text-center md:text-left text-sm">
        
        {/* Left: Team Collaborate */}
        <div>
          <h4 className="font-semibold mb-2">Team Collaborate</h4>
          <ul className="space-y-1">
            <li><a href="#">GitHub</a></li>
            <li><a href="#">Discord</a></li>
            <li><a href="#">Click Up</a></li>
            <li><a href="#">Telegram</a></li>
            <li><a href="#">Google Meet</a></li>
          </ul>
        </div>

        {/* Center: Contact */}
        <div>
          <h4 className="font-semibold mb-2">CONTACT</h4>
          <div className="flex justify-center md:justify-start space-x-4 mt-2">
            <a href="#"><FaGithub className="text-2xl hover:text-gray-600" /></a>
            <a href="#"><FaTelegramPlane className="text-2xl hover:text-blue-400" /></a>
            <a href="#"><FaFacebook className="text-2xl hover:text-blue-600" /></a>
          </div>
        </div>

        {/* Right: Useful Links */}
        <div>
          <h4 className="font-semibold mb-2">USEFULL LINKS</h4>
          <ul className="space-y-1">
            <li><a href="#">Home</a></li>
            <li><a href="#">Upload</a></li>
            <li><a href="#">Result</a></li>
            <li><a href="#">Report</a></li>
            <li><a href="#">About Us</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="text-center text-sm font-bold mt-12">
        ©2025 Khmer Data Validation Tool
      </div>
    </footer>
  );
};

export default Footer;
