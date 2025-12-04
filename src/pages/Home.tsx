import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <Navbar />

      <header className="hero">
        <h2>🛡️ Welcome to SafeCity</h2>
        <p>Track incidents, stay informed, and report your own.</p>
        <a href="/report">
          <button className="report-button">Submit Area Report</button>
        </a>
      </header>

      <section className="info-blocks">
        <div className="info-card">
          <h4>🚨 Real-Time Alerts</h4>
          <p>Stay updated with verified incidents in your area.</p>
        </div>
        <div className="info-card">
          <h4>📊 Community Insights</h4>
          <p>View trends and hotspots based on user reports.</p>
        </div>
        <div className="info-card">
          <h4>🛡️ Empower Safety</h4>
          <p>Your reports help build a safer city for everyone.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}