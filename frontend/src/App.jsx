import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthPage from "./components/Pages/AuthPage";
import LandingPage from "./components/Pages/LandingPage";
import AboutPage from "./components/Pages/AboutPage";
import ProfilePage from "./components/Pages/ProfilePage";
import CompetitionPage from "./components/Pages/CompetitionPage";
import Footer from "./components/MainComponents/Footer";
import Navbar from "./components/MainComponents/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { RoomProvider } from "./context/RoomContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <BrowserRouter>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <div className="min-h-screen flex flex-col bg-slate-50">
            <AppContent />
          </div>
        </BrowserRouter>
      </RoomProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  
  return (
    <>
      {user && <Navbar user={user} />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/compete" element={
            <ProtectedRoute>
              <CompetitionPage />
            </ProtectedRoute>
          } />
          <Route path="/home" element={<Navigate to="/compete" replace />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {user && <Footer />}
    </>
  );
}
