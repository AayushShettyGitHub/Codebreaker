export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0f] border-t border-[#1e1215] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold text-white text-xs">
                CB
              </div>
              <span className="text-base font-bold text-[#e8e6e3]">
                Code<span className="text-red-500">Breaker</span>
              </span>
            </div>
            <p className="text-sm text-[#6b6560] leading-relaxed">
              Real-time competitive coding platform for problem solving and skill benchmarking.
            </p>
          </div>

          {}
          <div>
            <h4 className="text-xs font-semibold text-[#a8a29e] uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#6b6560] hover:text-red-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#6b6560] hover:text-red-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h4 className="text-xs font-semibold text-[#a8a29e] uppercase tracking-wider mb-4">
              Connect
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#6b6560] hover:text-red-400 transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#6b6560] hover:text-red-400 transition-colors">
                  Discord
                </a>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h4 className="text-xs font-semibold text-[#a8a29e] uppercase tracking-wider mb-4">
              Status
            </h4>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm text-[#a8a29e] font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>

        {}
        <div className="mt-10 pt-6 border-t border-[#1e1215] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#44403c]">
            © {currentYear} CodeBreaker. All rights reserved.
          </p>
          <p className="text-xs text-[#44403c]">
            Built for developers, by developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
