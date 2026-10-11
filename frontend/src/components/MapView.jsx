import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/*
|--------------------------------------------------------------------------
| Leaflet + OpenStreetMap Map View
|--------------------------------------------------------------------------
| Reusable map used for destinations and trip context.
| Renders an OSM tile layer with a brand pin and optional popup label.
*/

const buildPin = () =>
  L.divIcon({
    className: 'touristo-map-pin',
    html: `
      <span style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:34px;
        height:34px;
        border-radius:9999px;
        background:#163B2F;
        border:3px solid #C8A45D;
        box-shadow:0 6px 16px rgba(0,0,0,0.28);
      ">
        <span style="
          width:10px;
          height:10px;
          border-radius:9999px;
          background:#E7D3A3;
        "></span>
      </span>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });

const Recenter = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude]);
  }, [latitude, longitude, map]);

  return null;
};

const normalizeCoord = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const MapView = ({
  latitude,
  longitude,
  label,
  zoom = 11,
  height = 320,
  className = '',
}) => {
  const lat = normalizeCoord(latitude);
  const lng = normalizeCoord(longitude);

  if (lat === null || lng === null) {
    return (
      <div
        className={`flex items-center justify-center rounded-[26px] border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] text-sm text-[color:var(--text-secondary)] ${className}`}
        style={{ height }}
      >
        Location coordinates are not available.
      </div>
    );
  }

  const position = [lat, lng];

  return (
    <div
      className={`relative z-0 isolate overflow-hidden rounded-[26px] border border-[color:var(--border-light)] shadow-[var(--shadow-sm)] ${className}`}
    >
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={buildPin()}>
          {label && (
            <Popup>
              <span className="text-sm font-semibold">{label}</span>
            </Popup>
          )}
        </Marker>

        <Recenter latitude={lat} longitude={lng} />
      </MapContainer>
    </div>
  );
};

export default MapView;
