import Footer from '../components/Footer';
import MissionVision from '../components/MissionVision';

const About = () => {
  // Define mission and vision here
  const mission = "Enable students and researchers to build high-quality Khmer OCR datasets efficiently through intuitive annotation, and easy validation.";
  const vision = "Become a trusted foundation for Khmer language digitization efforts by providing accessible tools and best practices for data annotation.";

  return (
    <div className="min-h-full bg-gray-50 m-6">
      <h1 className="text-3xl font-bold">About Page</h1>
      <h4 className="text-sm py-4">We aim to accelerate Khmer OCR dataset creation with a simple, practical web tool for annotation and validation.</h4>

      {/* Mission and Vision Section */}
      <div className="flex-grow">
        <MissionVision mission={mission} vision={vision} />
      </div>

      {/* Team Section */}
      <h2 className="text-xl font-bold mt-8">Our Team</h2>
      <h4 className="text-sm py-4">Advisors, mentors, and members collaborating on this project.</h4>

      {/* Different team roles */}
      <h2 className="text-xl font-bold">Advisors</h2>
      <h2 className="text-xl font-bold">Mentor</h2>
      <h2 className="text-xl font-bold">Members</h2>

      <Footer />
    </div>
  );
};

export default About;
