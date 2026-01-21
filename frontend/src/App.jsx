import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthPage from "./components/Pages/AuthPage";
import HomePage from "./components/Pages/Homepage";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import { RoomProvider } from "./context/RoomContext";
import ProtectedRoute from "./components/ProtectedRoute";
import KickModal from "./components/KickModal";

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
            theme="dark"
          />
          <KickModal />
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Navigate to="/auth" />} />
                <Route path="/auth" element={<AuthPage />} />
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
          </div>
        </BrowserRouter>
      </RoomProvider>
    </AuthProvider>
  );
}
