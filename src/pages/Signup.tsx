import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./signup.css"; // ✅ dedicated CSS

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const signupData = { name, email, phone, city, password };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      if (res.ok) {
        alert("Signup successful!");
      } else {
        alert("Signup failed.");
      }
    } catch (err) {
      console.error("Error signing up:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="form-page">
        <h2 className="form-title">Signup</h2>
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>

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
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-row">
            <label className="form-label">City</label>
            <input
              className="form-input"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
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

          <div className="form-row">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
            />
          </div>

          <button type="submit" className="submit-btn">Signup</button>
        </form>
      </div>
      <Footer />
    </>
  );
}