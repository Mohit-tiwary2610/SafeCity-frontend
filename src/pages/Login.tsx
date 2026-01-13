import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./login.css"; // ✅ dedicated CSS

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginData = { email, password };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (res.ok) {
        alert("Login successful!");
      } else {
        alert("Login failed.");
      }
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="form-page">
        <h2 className="form-title">Login</h2>
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-row">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="submit-btn">Login</button>
        </form>
      </div>
      <Footer />
    </>
  );
}