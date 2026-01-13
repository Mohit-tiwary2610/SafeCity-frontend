import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <a className="logo" href="/">SafeCity</a>

      <div className="navbar-links">
        <a className="nav-link" href="/">Home</a>
        <a className="nav-link" href="/report">Report</a>
        <a className="nav-link" href="/map">Map</a>
        <a className="nav-link" href="/dashboard">Dashboard</a>

        <div className="auth-links">
          <a className="auth-link" href="/login">Login</a>
          <a className="auth-link" href="/signup">Signup</a>
        </div>
      </div>
    </nav>
  );
}