"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

// Fix missing default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getLat(s) {
  return s.LAT ?? s.lat ?? s.latitude ?? s.Lat ?? null;
}

function getLng(s) {
  return s.LON ?? s.lng ?? s.lon ?? s.longitude ?? s.Lng ?? null;
}

function getName(s) {
  return s.SCHNAME ?? s.EstablishmentName ?? s.school_name ?? s.SchoolName ?? "School";
}

function getTown(s) {
  return s.TOWN ?? s.Town ?? s.town ?? null;
}

export default function SchoolsMap({ schools }) {
  const schoolsWithCoords = useMemo(
    () => 
      (schools || []).filter((s) => {
        const lat = getLat(s);
        const lng = getLng(s);
        return (
          lat != null && 
          lng != null && 
          !Number.isNaN(Number(lat)) && 
          !Number.isNaN(Number(lng))
        );
  }),
  [schools]
);

  // Pick a sensible center: first school with coords, otherwise London
  const center =
    schoolsWithCoords.length > 0
      ? [Number(getLat(schoolsWithCoords[0])), Number(getLng(schoolsWithCoords[0]))]
      : [51.5072, -0.1276];

  const containerKey = `${center[0]}-${center[1]}-${schoolsWithCoords.length}`;

  return (
    <div key={containerKey} style={{ height: 420, width: "100%" }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {schoolsWithCoords.map((s) => {
          const lat = Number(getLat(s));
          const lng = Number(getLng(s));

          return (
            <Marker key={s.URN || `${lat}-${lng}`} position={[lat, lng]}>
              <Popup>
                <div style={{ fontWeight: 600 }}>{getName(s)}</div>
                <div>{getTown(s)}</div>
                <Link
                    /* href sends you to individual school page when clicked */
                    href={`/schools/${s.URN}`}
                    className="block rounded-lg focus:scale-[1.03] hover:scale-[1.01] transition"
                >
                  Go to page
                </Link>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
