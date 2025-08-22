import Footer from '../components/Footer';
import MissionVision from '../components/MissionVision';
import AdvisorCard from '../components/AdvisorCard';
import MemberCard from '../components/MemberCard';
import Punleu from '../assets/profiles/PunleuTY.jpg';
import Sievlinh from '../assets/profiles/SievlinhKHEAN.png';
import Jessica from '../assets/profiles/JessicaKIM.jpg';
import Mengeang from '../assets/profiles/MengeangENG.jpg';
import Lyheng from '../assets/profiles/LyhengTouch.png';
import Yanghai from '../assets/profiles/YanghaiPOV.jpg';
import Sitharath from '../assets/profiles/SitharathSREY.jpg';
import Seila from '../assets/profiles/SeilaMANH.jpg';
import Soklong from '../assets/profiles/SoklongHIM.jpg';
import Hongly from '../assets/profiles/HonglyVA.jpg';
import Kimlang from '../assets/profiles/KimlangSO.png';
const About = () => {
  // Define mission and vision here
  const mission = "Enable students and researchers to build high-quality Khmer OCR datasets efficiently through intuitive annotation, and easy validation.";
  const vision = "Become a trusted foundation for Khmer language digitization efforts by providing accessible tools and best practices for data annotation.";

  // Advisors data
  const advisors = [
    {
      image: Hongly, // Replace with actual image link
      name: 'Dr. Hongly VA',
      title: 'Boost annotation speed to 50x',
      description: 'Expert in AI and machine learning and coding.',
      additionalInfo: 'PhD in Computer Science.',
    },
    {
      image: Soklong, // Replace with actual image link
      name: 'Mr. Soklong HIM',
      title: 'Lecturer and Researcher',
      description: 'Lecturer and researcher in deep learning.',
      additionalInfo: '',
    },
  ];

  const mentor = [
    {
      image: Kimlang,
      name: 'Ms. Kimlang SO',
      title: 'Senior AI Specialist',
      description: 'Guides the team with AI expertise and research insight.',
      additionalInfo: '3+ years in the field.',
    },
  ];
  const members = [
    {
      image: Punleu,
      name: 'Punleu TY',
      title: 'Data Engineer',
      description: 'Guides the team with AI expertise and research insight.',
      contact: 'punleu.ty@student.cadt.edu.kh',
    },
    {
      image: Sitharath,
      name: 'Sitharath SREY',
      title: 'Data Engineer',
      description: 'Guides the team with AI expertise and research insight.',
      contact: 'sitharath.srey@student.cadt.edu.kh',
    },
    {
      image: Mengeang,
      name: 'Mengeang ENG',
      title: 'Data Engineer',
      description: 'Guides the team with AI expertise and research insight.',
      contact: 'mengeang.eng@student.cadt.edu.kh',
    },
    {
      image: Sievlinh,
      name: 'Sievlinh KHEAN',
      title: 'Frontend Dev',
      description: 'Guides the team with AI expertise and research insight.',
      contact: 'sievlinh.khean@student.cadt.edu.kh',
    },
    {
      image: Jessica,
      name: 'Jessica KIM',
      title: 'Frontend Dev',
      description: 'Guides the team with AI expertise and research insight.',
      contact: 'jessica.kim@student.cadt.edu.kh',
    },
    {
      image: Seila,
      name: 'Seila MANH',
      title: 'Backend Dev',
      description: 'Guides the team with AI expertise and research insight.',
      contact: 'seila.manh@student.cadt.edu.kh',
    },
    {
      image: Yanghai,
      name: 'Yanghai POV',
      title: 'Backend Dev',
      description: 'Guides the team with AI expertise and research insight.',
      contact: 'yanghai.pov@student.cadt.edu.kh',
    },
    {
      image: Lyheng,
      name: 'Lyheng Touch',
      title: 'Backend Dev',
      description: 'Guides the team with AI expertise and research insight.',
      contact: 'lyheng.touch@student.cadt.edu.kh',
    },
  ];

  return (
    <>
    <div className="min-h-full bg-white p-6">
      <h1 className=" text-5xl text-[#ff3f34] font-cadt flex justify-center">About Page</h1>
      <h4 className="text-xl py-4  text-[#12284c] flex justify-center">We aim to accelerate Khmer OCR dataset creation with a simple, practical web tool for annotation and validation.</h4>
      {/* Mission and Vision Section */}
      <div className="flex-grow">
        <MissionVision mission={mission} vision={vision} />
      </div>


      {/* Advisors Section */}
      <div className="mt-12">
        {/* Team Section */}
        <div className="bg-[#ff3f34] text-white py-4 text-center rounded-md">
          <h2 className="text-4xl font-bold mb-2">Meet Our Team</h2>
          <h4 className="text-xl">Advisors, mentors, and members collaborating on this project</h4>
        </div>
        <h2 className="text-3xl font-bold mt-4">Advisors</h2>
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 w-full">
          {advisors.map((advisor, index) => (
            <AdvisorCard
              key={index}
              image={advisor.image}
              name={advisor.name}
              title={advisor.title}
              description={advisor.description}
              additionalInfo={advisor.additionalInfo}
            />
          ))}
        </div>
      </div>
      <h2 className="text-3xl font-bold">Mentor</h2>
      {/* Mentor Section */}
      <div className="flex justify-start gap-8 mt-4 ">
        {mentor.map((mentor, index) => (
          <AdvisorCard
            key={index}
            image={mentor.image}
            name={mentor.name}
            title={mentor.title}
            description={mentor.description}
            additionalInfo={mentor.additionalInfo}
          />
        ))}
      </div>
      <h2 className="text-3xl font-bold">Team Members</h2>
      {/* Member Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 w-full ">
        {members.map((member, index) => (
          <MemberCard
            key={index}
            image={member.image}
            name={member.name}
            title={member.title}
            description={member.description}
            contact={member.contact}
          />
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default About;
