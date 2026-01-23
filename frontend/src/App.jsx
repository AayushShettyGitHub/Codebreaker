import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthPage from "./components/Pages/AuthPage";
import HomePage from "./components/Pages/Homepage";
import LandingPage from "./components/Pages/LandingPage";
import AboutPage from "./components/Pages/AboutPage";
import ProfilePage from "./components/Pages/ProfilePage";
import LeaderboardPage from "./components/Pages/LeaderboardPage";
import CompetitionPage from "./components/Pages/CompetitionPage";
import Footer from "./components/Footer";
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
          <div className="min-h-screen flex flex-col bg-white">
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
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          } />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </>
  );
}
