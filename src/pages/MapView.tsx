import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

const API = import.meta.env.VITE_API_URL;

interface Report {
  id: number;
  type: string;
  description: string;
  severity: number;
  f_lat: string | number;
  f_lng: string | number;
  city: string;
  area: string;
  landmark: string;
}

// Normalize and validate a single report’s coordinates
function normalizeCoords(r: Report): (Report & { f_lat: number; f_lng: number }) | null {
  const lat = typeof r.f_lat === "number" ? r.f_lat : parseFloat(r.f_lat);
  const lng = typeof r.f_lng === "number" ? r.f_lng : parseFloat(r.f_lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null; // invalid
  if (lat < -90 || lat > 90) return null;                  // out of bounds
  if (lng < -180 || lng > 180) return null;

  return { ...r, f_lat: lat, f_lng: lng };
}

export default function MapView() {
  const [reports, setReports] = useState<Array<Report & { f_lat: number; f_lng: number }>>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API}/reports`);
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data: Report[] = await res.json();

        // Normalize and keep only valid coordinates
        const valid = data
          .map(normalizeCoords)
          .filter((r): r is Report & { f_lat: number; f_lng: number } => r !== null);

        setReports(valid);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  return (
    <>
      <Navbar />
      <div className="map-page">
        <h2>📍 City Incident Map</h2>

        <div className="map-wrapper">
          <MapContainer
            center={[22.7683838, 86.2558816]} // Jamshedpur default
            zoom={13}
            className="map-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Default marker so the map is never empty */}
            <Marker position={[22.7683838, 86.2558816]}>
              <Popup>Default Center: Ram Mandir</Popup>
            </Marker>

            {/* Dynamic markers */}
            {reports.map((report) => (
              <Marker key={report.id} position={[report.f_lat, report.f_lng]}>
                <Popup>
                  <strong>{report.type}</strong> (Severity: {report.severity})<br />
                  {report.description}<br />
                  {report.area}, {report.city}<br />
                  {report.landmark}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
      <Footer />
    </>
  );
}