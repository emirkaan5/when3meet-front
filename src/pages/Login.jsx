import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { loadGoogleIdentity } from "../lib/google";

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_OAUTH_CLIENT_ID"; // ← replace

export default function Login() {
  const navigate = useNavigate();
  const gBtnRef = useRef(null);

  useEffect(() => {
    // define inside effect to satisfy exhaustive-deps
    function handleCredentialResponse(response) {
      fetch("/api/auth/google-id-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential }),
      }).then(() => navigate("/home"));
    }

    loadGoogleIdentity().then(() => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: "popup",
      });
      if (gBtnRef.current) {
        window.google.accounts.id.renderButton(gBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 260,
        });
      }
    });
  }, [navigate]);

  function handleLogin() {
    const email = document.querySelector('input[type="text"]').value;
    const password = document.querySelector('input[type="password"]').value;
    if (email && password) navigate("/home");
    else alert("Please fill in both fields.");
  }

  return (
    <div className="page">
      {/* Flowers only on login page */}
      <div className="bottom-decor">
        <div className="flower-gradient"></div>
        <img src="/image.png" alt="Lavender Field" className="bottom-flowers" />
      </div>

      <div className="content">
        <header className="header">
          {/* Logo in same spot as original */}
          <img src="/logo.png" alt="When3Meet Logo" className="logo" />
          <h1>When3Meet</h1>
        </header>

        <h2>Log In</h2>
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Email" required />
          <input
            type="password"
            placeholder="Password"
            required
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button type="button" onClick={handleLogin}>
            Log In
          </button>
          <a href="#">Forgot password?</a>
          <p>
            Not a user? <a href="#">Register</a>
          </p>
          <hr className="separator" />
          <div ref={gBtnRef} className="g-btn" />
        </form>
      </div>
    </div>
  );
}
