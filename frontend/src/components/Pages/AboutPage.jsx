export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">About CodeBreaker</h1>
          <p className="text-xl text-slate-600">Real-time competitive programming platform</p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            We empower programmers to test their skills in real-time competitions. CodeBreaker brings competitive coding to life with instant synchronization, live rankings, and a global community of developers.
          </p>
        </div>

        {/* Core Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Real-Time", desc: "Instant synchronization for fair competition" },
            { title: "Live Rankings", desc: "See your position update live" },
            { title: "Community", desc: "Connect with programmers worldwide" },
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-4">●</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Built With</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Backend</h3>
              <div className="flex flex-wrap gap-2">
                {['Spring Boot', 'WebSocket', 'PostgreSQL'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-lg border border-blue-200">{tech}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Frontend</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'Vite', 'TailwindCSS'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-lg border border-blue-200">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
