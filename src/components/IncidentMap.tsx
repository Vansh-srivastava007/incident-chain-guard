import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { StatusBadge } from '@/components/ui/badge-variant';
import { Incident } from '@/types/incident';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncidentId?: string;
  onIncidentSelect?: (incident: Incident) => void;
  className?: string;
}

const getSeverityColor = (severity: number) => {
  if (severity <= 3) return '#22c55e';
  if (severity <= 6) return '#eab308';
  if (severity <= 8) return '#f97316';
  return '#ef4444';
};

const getSeverityLabel = (value: number) => {
  if (value <= 3) return "Low";
  if (value <= 6) return "Medium";
  if (value <= 8) return "High";
  return "Critical";
};

const getSeverityStatus = (value: number) => {
  if (value <= 3) return "low";
  if (value <= 6) return "medium";
  if (value <= 8) return "high";
  return "critical";
};

const createSeverityIcon = (severity: number, isSelected: boolean) => {
  const color = getSeverityColor(severity);
  const size = isSelected ? 35 : 25;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 30 ? '16px' : '12px'};
      ">
        ${severity}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// Map controller for auto-fitting bounds
function MapController({ incidents }: { incidents: Incident[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (incidents.length > 0) {
      const group = new L.FeatureGroup(
        incidents.map(incident => 
          L.marker([incident.location.lat, incident.location.lng])
        )
      );
      if (group.getBounds().isValid()) {
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }, [incidents, map]);

  return null;
}

export function IncidentMap({ incidents, selectedIncidentId, onIncidentSelect, className }: IncidentMapProps) {
  const [mapKey, setMapKey] = useState(0);
  
  // Default to NYC if no incidents
  const center: [number, number] = incidents.length > 0 
    ? [incidents[0].location.lat, incidents[0].location.lng]
    : [40.7128, -74.0060];

  // Force re-render if incidents change significantly
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [incidents.length]);

  return (
    <div className={className}>
      <MapContainer
        key={mapKey}
        center={center}
        zoom={13}
        className="w-full h-full rounded-lg"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController incidents={incidents} />
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.location.lat, incident.location.lng]}
            icon={createSeverityIcon(incident.severity, incident.id === selectedIncidentId)}
            eventHandlers={{
              click: () => onIncidentSelect?.(incident)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold capitalize">{incident.type}</h4>
                  <StatusBadge 
                    status={getSeverityStatus(incident.severity)} 
                    variant="severity"
                  >
                    {getSeverityLabel(incident.severity)}
                  </StatusBadge>
                </div>
                
                {incident.reporterName && (
                  <p className="text-sm text-gray-600">
                    Reported by: {incident.reporterName}
                  </p>
                )}
                
                <p className="text-sm">
                  {incident.notes ? 
                    (incident.notes.length > 100 ? incident.notes.slice(0, 100) + '...' : incident.notes) 
                    : 'No additional details'
                  }
                </p>
                
                <div className="text-xs text-gray-500">
                  {new Date(incident.reportedAt).toLocaleString()}
                </div>
                
                <div className="flex gap-1 flex-wrap">
                  <StatusBadge status={incident.status} variant="status">
                    {incident.status}
                  </StatusBadge>
                  <StatusBadge status={incident.anchorStatus} variant="anchor">
                    {incident.anchorStatus === 'not_anchored' ? 'Not Anchored' : 
                     incident.anchorStatus === 'anchoring' ? 'Anchoring...' : 'Anchored'}
                  </StatusBadge>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}