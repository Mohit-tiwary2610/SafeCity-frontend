import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import "./Report.css"; // ✅ make sure this matches your CSS filename

const API = import.meta.env.VITE_API_URL;

interface Report {
  type: string;
  description: string;
  severity: number;
  status: string;
  f_lat: number | null;
  f_lng: number | null;
}

export default function Report() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/reports`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setReports(json);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="error">❌ Error: {error}</div>;
  if (!reports.length) return <div className="loading">Loading reports...</div>;

  return (
    <div className="report-container">
      <Navbar />
      <h2 className="report-title">📊 Incident Reports</h2>

      <table className="report-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => (
            <tr key={i}>
              <td className="report-type">{r.type}</td>
              <td>{r.description}</td>
              <td
                className={`report-severity ${
                  r.severity >= 4
                    ? "high"
                    : r.severity === 3
                    ? "medium"
                    : "low"
                }`}
              >
                {r.severity}
              </td>
              <td
                className={`report-status ${
                  r.status === "verified" ? "verified" : "pending"
                }`}
              >
                {r.status}
              </td>
              <td>
                {r.f_lat && r.f_lng ? `${r.f_lat}, ${r.f_lng}` : "No location"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}