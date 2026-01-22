export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About CodeBreaker</h1>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 mb-6">
            CodeBreaker is dedicated to empowering programmers worldwide through real-time competitive coding challenges. We believe in making competitive programming accessible, engaging, and rewarding.
          </p>
          <p className="text-lg text-gray-600">
            Our platform combines cutting-edge technology with educational excellence to create an environment where developers can test their skills, learn from peers, and grow together as a community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {[
            { title: "Community First", desc: "Built by programmers, for programmers. Our community is at the heart of everything we do." },
            { title: "Real-Time Sync", desc: "Seamless synchronization ensures every competitor sees the same challenges at the same time." },
            { title: "Fair Competition", desc: "Transparent scoring, instant feedback, and equal opportunity for all participants." },
            { title: "Continuous Growth", desc: "From beginners to experts, our problems scale with your skill level." },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
              <p>Spring Boot, WebSocket (STOMP), PostgreSQL</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
              <p>React, Vite, TailwindCSS, Real-time Updates</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
