import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-300 font-medium">Checking session...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/auth" replace />;

  return children;
}
