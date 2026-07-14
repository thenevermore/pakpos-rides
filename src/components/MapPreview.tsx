'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [20, 20] });
    }
  }, [map, positions]);
  return null;
}

export default function MapPreview({ polylineString }: { polylineString: string }) {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    if (polylineString) {
      const decoded = polyline.decode(polylineString);
      setPositions(decoded);
    } else {
      setPositions([]);
    }
  }, [polylineString]);

  if (!polylineString || positions.length === 0) return null;

  return (
    <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 relative z-0">
      <MapContainer 
        center={positions[0]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={positions} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.9 }} />
        <MapBounds positions={positions} />
      </MapContainer>
    </div>
  );
}
