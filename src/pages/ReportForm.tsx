import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ReportForm.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const API = import.meta.env.VITE_API_URL;

export default function ReportForm() {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(1);
  const [f_lat, setLat] = useState("");
  const [f_lng, setLng] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Auto-fill lat/lng when city/area changes
  const fetchCoordinates = async (location: string) => {
    if (!location) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setLat(data[0].lat);
        setLng(data[0].lon);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const body = {
      type,
      description,
      severity, // make sure this matches backend expectation
      lat: parseFloat(f_lat),   // ✅ use lat
      lng: parseFloat(f_lng),   // ✅ use lng
      city,
      area,
      landmark,
    };

    const res = await fetch(`${API}/incidents`, {   // ✅ correct endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to submit report");
    }

    const json = await res.json();
    console.log("Submitted:", json);

    setMessage({ text: "✅ Report submitted successfully!", type: "success" });

    // reset form
    setType("");
    setDescription("");
    setSeverity(1);
    setLat("");
    setLng("");
    setCity("");
    setArea("");
    setLandmark("");
  } catch (err: any) {
    setMessage({ text: `❌ ${err.message}`, type: "error" });
  }
};

  return (
    <>
      <Navbar />
      <div className="report-form">
        <h3>📍 Submit an Area Report</h3>

        {message && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Type (e.g. hazard, theft)" value={type} onChange={(e) => setType(e.target.value)} required />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <select value={severity} onChange={(e) => setSeverity(Number(e.target.value))}>
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
            <option value={4}>Critical</option>
          </select>

          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              fetchCoordinates(e.target.value + " " + area);
            }}
            required
          />
          <input
            type="text"
            placeholder="Area / Neighborhood"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              fetchCoordinates(city + " " + e.target.value);
            }}
            required
          />
          <input type="text" placeholder="Nearby Landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} />

          <input type="text" placeholder="Latitude" value={f_lat} readOnly />
          <input type="text" placeholder="Longitude" value={f_lng} readOnly />

          <button type="submit">Submit Report</button>
        </form>

        
        
      </div>
      <Footer />
    </>
  );
}