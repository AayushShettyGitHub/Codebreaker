import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[#1e1215] border-t-red-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-[#6b6560] font-medium">Checking session...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/auth" replace />;

  return children;
}
