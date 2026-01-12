export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-slate-700/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⚡</span>
              <h3 className="font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CodeBreaker</h3>
            </div>
            <p className="text-sm text-slate-400">Competitive coding platform for real-time problem solving.</p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Features</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-cyan-400 transition-colors">Real-time Competitions</li>
              <li className="hover:text-cyan-400 transition-colors">Multiple Languages</li>
              <li className="hover:text-cyan-400 transition-colors">Instant Feedback</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-cyan-400 transition-colors">Documentation</li>
              <li className="hover:text-cyan-400 transition-colors">FAQ</li>
              <li className="hover:text-cyan-400 transition-colors">Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Status</h4>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-500">© {currentYear} CodeBreaker. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">Terms</a>
              <a href="#" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
