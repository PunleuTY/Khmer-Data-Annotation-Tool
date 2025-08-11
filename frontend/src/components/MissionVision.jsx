// src/components/MissionVision.jsx
const MissionVision = ({ mission, vision }) => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">

      {/* Mission and Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Mission Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
          <h3 className="text-2xl font-semibold text-center mb-4">Our Mission</h3>
          <p className="text-gray-600 text-center">{mission}</p>
        </div>

        {/* Vision Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
          <h3 className="text-2xl font-semibold text-center mb-4">Our Vision</h3>
          <p className="text-gray-600 text-center">{vision}</p>
        </div>

      </div>
    </section>
  );
};

export default MissionVision;
