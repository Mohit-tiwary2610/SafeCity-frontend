import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";

// Leaflet marker icon fix for production (Vercel)
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API = import.meta.env.VITE_API_URL;

interface Report {
  _id: string;
  type: string;
  description: string;
  severity: string | number;
  lat: number;
  lng: number;
  consent_public_map: boolean;
  media_urls: string[];
  city?: string;
  area?: string;
  landmark?: string;
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filterType, setFilterType] = useState<string>("All");
  const [types, setTypes] = useState<string[]>([]);
  const [chartData, setChartData] = useState<{ type: string; count: number }[]>(
    []
  );
  const [severityData, setSeverityData] = useState<
    { label: string; count: number; color: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 6;

  const processData = (incidentList: Report[]) => {
    setReports(incidentList);

    const mappedTypes = incidentList.map((r) => r.type).filter(Boolean);
    const uniqueTypes = Array.from(new Set(mappedTypes));
    setTypes(uniqueTypes);

    const typeCounts: Record<string, number> = {};
    mappedTypes.forEach((t) => {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    setChartData(Object.entries(typeCounts).map(([type, count]) => ({ type, count })));

    const severityCounts: Record<string, number> = {};
    incidentList.forEach((r) => {
      const sev =
        typeof r.severity === "number"
          ? r.severity.toString()
          : r.severity.toLowerCase();
      severityCounts[sev] = (severityCounts[sev] || 0) + 1;
    });
    setSeverityData([
      { label: "Low", count: severityCounts["1"] || severityCounts["low"] || 0, color: "#4caf50" },
      { label: "Moderate", count: severityCounts["2"] || severityCounts["moderate"] || severityCounts["medium"] || 0, color: "#ffeb3b" },
      { label: "High", count: severityCounts["3"] || severityCounts["high"] || 0, color: "#fb8c00" },
      { label: "Critical", count: severityCounts["4"] || severityCounts["critical"] || 0, color: "#e53935" },
    ]);

    setLastUpdated(new Date().toLocaleString());
  };

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/incidents`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        const incidentList: Report[] = Array.isArray(data.incidents) ? data.incidents : [];
        processData(incidentList);
      } catch (err) {
        console.error("Error fetching incidents:", err);
        setError("Failed to load incident data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports =
    filterType === "All"
      ? reports
      : reports.filter((r) => r.type === filterType);

  const paginatedReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  const severityClass = (sev: number | string) => {
    if (typeof sev === "number") {
      switch (sev) {
        case 1: return "severity-card-low";
        case 2: return "severity-card-moderate";
        case 3: return "severity-card-high";
        case 4: return "severity-card-critical";
        default: return "";
      }
    }
    const s = String(sev).toLowerCase();
    if (s === "medium") return "severity-card-moderate";
    return `severity-card-${s}`;
  };

  const toCSV = (rows: Report[]): string => {
    const headers = ["_id","type","description","severity","lat","lng","consent_public_map","city","area","landmark"];
    const escape = (val: unknown) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (/[\",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    return [
      headers.join(","),
      ...rows.map((r) =>
        [r._id,r.type,r.description,r.severity,r.lat,r.lng,r.consent_public_map,r.city ?? "",r.area ?? "",r.landmark ?? ""]
          .map(escape)
          .join(",")
      ),
    ].join("\n");
  };

  const exportCSV = () => {
    const csv = toCSV(reports);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "incident_reports.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <h2>📊 Incident Dashboard</h2>

        {lastUpdated && <p className="last-updated">Last updated: {lastUpdated}</p>}

        <div className="actions-row">
          <button onClick={exportCSV} className="export-btn">Export to CSV</button>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p>Loading incident data...</p>
          </div>
        ) : error ? (
          <div className="error-state"><h4>{error}</h4></div>
        ) : (
          <>
            {/* Bar Chart */}
            <div className="chart-section">
              <h3>Incident Distribution by Type</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.type.toLowerCase() === "hazard" ? "orange" :
                            entry.type.toLowerCase() === "theft" ? "red" :
                            entry.type.toLowerCase() === "unsafe_area" ? "purple" :
                            entry.type.toLowerCase() === "emergency" ? "blue" :
                            entry.type.toLowerCase() === "harassment" ? "pink" : "cyan"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>No incident data available</p>
              )}
            </div>

            {/* Pie Chart */}
            <div className="chart-section">
              <h3>Severity Distribution</h3>
              {severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>No severity data available</p>
              )}
            </div>

            {/* Map */}
            <div className="chart-section">
              <h3>Incident Map</h3>
              <MapContainer
                center={[22.8, 86.2]}
                zoom={12}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {reports
                  .filter((r) => r.consent_public_map && Number.isFinite(r.lat) && Number.isFinite(r.lng))
                  .map((r) => (
                    <Marker key={r._id} position={[r.lat, r.lng]}>
                      <Popup>
                        <strong>{r.type}</strong><br />
                        {r.description}
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>

            {/* Filter */}
            <div className="filter-bar">
              <label htmlFor="type">Filter by type:</label>
              <select
                id="type"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All</option>
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Cards */}
            <div className="report-grid">
              {paginatedReports.map((r) => (
                <div key={r._id} className={`report-card ${severityClass(r.severity)}`}>
                  <div className="severity-badge">
                    Severity {String(r.severity).charAt(0).toUpperCase() + String(r.severity).slice(1)}
                  </div>
                  <h3>{r.type}</h3>
                  <p>{r.description}</p>
                  <p>
                    <strong>Location:</strong> {r.area || "Unknown"}, {r.city || "Unknown"}
                  </p>
                  <p>
                    <strong>Landmark:</strong> {r.landmark || "None"}
                  </p>
                </div>
              ))}
              {paginatedReports.length === 0 && (
                <div className="empty-state">
                  <h4>No incidents found</h4>
                  <p>Try selecting “All” or a different type.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}