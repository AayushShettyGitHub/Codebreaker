export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900">CodeBreaker</h3>
            <p className="text-sm text-slate-600 mt-1">Competitive coding platform for real-time problem solving.</p>
          </div>

          <div className="flex items-center gap-8 text-sm text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">GitHub</a>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-6 pt-6">
          <p className="text-sm text-slate-600">© {currentYear} CodeBreaker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
