import { useState } from "react";
import Signup from "../AuthComponents/Signup";
import Login from "../AuthComponents/Login";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div style={{ padding: 20 }}>
      <h2>{showLogin ? "Login" : "Signup"}</h2>

      {showLogin ? <Login /> : <Signup onSignup={() => setShowLogin(true)} />}

      <button
        onClick={() => setShowLogin(!showLogin)}
        style={{ marginTop: 10 }}
      >
        {showLogin ? "Create Account" : "Already have an account?"}
      </button>
    </div>
  );
}
