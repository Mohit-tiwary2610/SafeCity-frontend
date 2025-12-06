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
import "./Dashboard.css";

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

  // Process incident data into UI state
  const processData = (incidentList: Report[]) => {
    setReports(incidentList);

    // Unique types for dropdown
    const mappedTypes = incidentList.map((r) => r.type);
    const uniqueTypes = Array.from(new Set(mappedTypes));
    setTypes(uniqueTypes);

    // Bar chart data
    const typeCounts: Record<string, number> = {};
    mappedTypes.forEach((t) => {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    const chartArray = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }));
    setChartData(chartArray);

    // Pie chart data (severity distribution)
    const severityCounts: Record<string, number> = {};
    incidentList.forEach((r) => {
      const sev =
        typeof r.severity === "number"
          ? r.severity.toString()
          : r.severity.toLowerCase();
      severityCounts[sev] = (severityCounts[sev] || 0) + 1;
    });
    const severityArray = [
      {
        label: "Low",
        count: severityCounts["1"] || severityCounts["low"] || 0,
        color: "#4caf50",
      },
      {
        label: "Moderate",
        count:
          severityCounts["2"] ||
          severityCounts["moderate"] ||
          severityCounts["medium"] ||
          0,
        color: "#ffeb3b",
      },
      {
        label: "High",
        count: severityCounts["3"] || severityCounts["high"] || 0,
        color: "#fb8c00",
      },
      {
        label: "Critical",
        count: severityCounts["4"] || severityCounts["critical"] || 0,
        color: "#e53935",
      },
    ];
    setSeverityData(severityArray);
  };

  useEffect(() => {
    const fetchOnce = async (): Promise<Report[] | null> => {
      try {
        const url = `${API}/incidents`;
        console.log("Fetching:", url);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const incidentList: Report[] = Array.isArray(data.incidents)
          ? data.incidents
          : [];
        return incidentList;
      } catch (e) {
        console.warn("Fetch failed:", e);
        return null;
      }
    };

    const fetchReports = async () => {
      setLoading(true);
      setError("");

      // First attempt
      const first = await fetchOnce();
      if (first && first.length >= 0) {
        processData(first);
        setLoading(false);
        return;
      }

      // Retry once (Render cold start)
      console.log("Retrying fetch...");
      const second = await fetchOnce();
      if (second && second.length >= 0) {
        processData(second);
        setLoading(false);
        return;
      }

      setError("Failed to load incident data. Please try again later.");
      setLoading(false);
    };

    fetchReports();
  }, []);

  const filteredReports =
    filterType === "All"
      ? reports
      : reports.filter((r) => r.type === filterType);

  const severityClass = (sev: number | string) => {
    if (typeof sev === "number") {
      switch (sev) {
        case 1:
          return "severity-card-low";
        case 2:
          return "severity-card-moderate";
        case 3:
          return "severity-card-high";
        case 4:
          return "severity-card-critical";
        default:
          return "";
      }
    }
    const s = String(sev).toLowerCase();
    if (s === "medium") return "severity-card-moderate";
    return `severity-card-${s}`;
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <h2>📊 Incident Dashboard</h2>

        {loading ? (
          <p>Loading incident data...</p>
        ) : error ? (
          <div className="error-state">
            <h4>{error}</h4>
          </div>
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
                            entry.type.toLowerCase() === "hazard"
                              ? "orange"
                              : entry.type.toLowerCase() === "theft"
                              ? "red"
                              : entry.type.toLowerCase() === "unsafe area"
                              ? "purple"
                              : entry.type.toLowerCase() === "emergency"
                              ? "blue"
                              : entry.type.toLowerCase() === "harassment"
                              ? "pink"
                              : "cyan"
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
                      isAnimationActive={true}
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

            {/* Filter dropdown */}
            <div className="filter-bar">
              <label htmlFor="type">Filter by type:</label>
              <select
                id="type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Report cards */}
            <div className="report-grid">
              {filteredReports.map((r) => (
                <div
                  key={r._id}
                  className={`report-card ${severityClass(r.severity)}`}
                >
                  <div className="severity-badge">
                    Severity{" "}
                    {String(r.severity).charAt(0).toUpperCase() +
                      String(r.severity).slice(1)}
                  </div>
                  <h3>{r.type}</h3>
                  <p>{r.description}</p>
                  <p>
                    <strong>Location:</strong> {r.area || "Unknown"},{" "}
                    {r.city || "Unknown"}
                  </p>
                  <p>
                    <strong>Landmark:</strong> {r.landmark || "None"}
                  </p>
                </div>
              ))}
              {filteredReports.length === 0 && (
                <div className="empty-state">
                  <h4>No incidents found</h4>
                  <p>Try selecting “All” or a different type.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}