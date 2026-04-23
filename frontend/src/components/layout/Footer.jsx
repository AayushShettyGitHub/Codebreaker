export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#09090b] border-t border-[#1c1c22] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white text-xs">
                CB
              </div>
              <span className="text-base font-bold text-[#e4e4e7]">
                Code<span className="text-indigo-400">Breaker</span>
              </span>
            </div>
            <p className="text-sm text-[#71717a] leading-relaxed">
              Real-time competitive coding platform for problem solving and skill benchmarking.
            </p>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#71717a] hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#71717a] hover:text-indigo-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-4">
              Connect
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#71717a] hover:text-indigo-400 transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#71717a] hover:text-indigo-400 transition-colors">
                  Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-4">
              Status
            </h4>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm text-[#a1a1aa] font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#1c1c22] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#3f3f46]">
            © {currentYear} CodeBreaker. All rights reserved.
          </p>
          <p className="text-xs text-[#3f3f46]">
            Built for developers, by developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
