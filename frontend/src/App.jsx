import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/Pages/AuthPage";
import HomePage from "./components/Pages/Homepage";
import { AuthProvider } from "./context/AuthContext";
import { RoomProvider } from "./context/RoomContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    
    <AuthProvider>
      <RoomProvider>
        <BrowserRouter>
        

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
        </BrowserRouter>
      </RoomProvider>
    </AuthProvider>
  );
}
