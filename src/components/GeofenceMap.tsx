import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, Shield, Users } from 'lucide-react';
import { Incident } from '@/types/incident';

// Fix Leaflet default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GeofenceZone {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
  type: 'safe' | 'caution' | 'danger';
  description: string;
  incidentCount?: number;
}

interface GeofenceMapProps {
  incidents?: Incident[];
  selectedIncidentId?: string;
  onIncidentSelect?: (id: string) => void;
  className?: string;
  userRole?: 'admin' | 'user';
}

const defaultZones: GeofenceZone[] = [
  {
    id: 'tourist-hub',
    name: 'Tourist Hub - Safe Zone',
    center: [40.7589, -73.9851], // Times Square
    radius: 500,
    type: 'safe',
    description: 'High security area with regular patrols and emergency stations',
    incidentCount: 2
  },
  {
    id: 'construction-area',
    name: 'Construction Zone',
    center: [40.7505, -73.9934],
    radius: 300,
    type: 'caution',
    description: 'Active construction area - exercise caution',
    incidentCount: 5
  },
  {
    id: 'high-crime',
    name: 'High Crime Area',
    center: [40.7282, -73.9942],
    radius: 400,
    type: 'danger',
    description: 'Avoid this area especially at night - high crime reports',
    incidentCount: 12
  },
  {
    id: 'subway-station',
    name: 'Central Station Safe Zone',
    center: [40.7527, -73.9772],
    radius: 200,
    type: 'safe',
    description: 'Major transportation hub with enhanced security',
    incidentCount: 1
  }
];

const getZoneColor = (type: GeofenceZone['type']) => {
  switch (type) {
    case 'safe': return '#22c55e';
    case 'caution': return '#eab308';
    case 'danger': return '#ef4444';
    default: return '#6b7280';
  }
};

const createCustomIcon = (type: GeofenceZone['type'], count?: number) => {
  const color = getZoneColor(type);
  const icon = type === 'safe' ? Shield : type === 'caution' ? AlertTriangle : MapPin;
  
  return divIcon({
    html: `
      <div style="
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          ${type === 'safe' ? 
            '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>' :
            type === 'caution' ?
            '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' :
            '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>'
          }
        </svg>
        ${count ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: #dc2626;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            border: 1px solid white;
          ">${count}</div>
        ` : ''}
      </div>
    `,
    className: 'custom-geofence-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const MapController: React.FC<{ zones: GeofenceZone[] }> = ({ zones }) => {
  const map = useMap();
  
  useEffect(() => {
    if (zones.length > 0) {
      const bounds = zones.map(zone => zone.center);
      map.fitBounds(bounds as any, { padding: [20, 20] });
    }
  }, [zones, map]);
  
  return null;
};

export const GeofenceMap: React.FC<GeofenceMapProps> = ({
  incidents = [],
  selectedIncidentId,
  onIncidentSelect,
  className = "",
  userRole = 'user'
}) => {
  const [zones] = useState<GeofenceZone[]>(defaultZones);
  const [selectedZone, setSelectedZone] = useState<GeofenceZone | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Location access denied:', error);
          // Default to NYC if location is denied
          setUserLocation([40.7589, -73.9851]);
        }
      );
    }
  }, []);

  const checkGeofenceStatus = (userPos: [number, number]) => {
    for (const zone of zones) {
      const distance = getDistance(userPos, zone.center);
      if (distance <= zone.radius) {
        return zone;
      }
    }
    return null;
  };

  const getDistance = (pos1: [number, number], pos2: [number, number]) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1[0] * Math.PI/180;
    const φ2 = pos2[0] * Math.PI/180;
    const Δφ = (pos2[0]-pos1[0]) * Math.PI/180;
    const Δλ = (pos2[1]-pos1[1]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const currentZone = userLocation ? checkGeofenceStatus(userLocation) : null;

  if (!userLocation) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading geofence map...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Geofence Status Card */}
      {userRole === 'user' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Current Location Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentZone ? (
              <div className="flex items-center justify-between">
                <div>
                  <Badge 
                    variant={currentZone.type === 'safe' ? 'default' : 
                            currentZone.type === 'caution' ? 'secondary' : 'destructive'}
                    className="mb-2"
                  >
                    {currentZone.type.toUpperCase()}
                  </Badge>
                  <h4 className="font-semibold">{currentZone.name}</h4>
                  <p className="text-sm text-muted-foreground">{currentZone.description}</p>
                </div>
                {currentZone.type === 'danger' && (
                  <Button variant="destructive" size="sm">
                    Get Safe Route
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Badge variant="outline" className="mb-2">NEUTRAL ZONE</Badge>
                <p className="text-sm text-muted-foreground">
                  You are in a general area. Stay alert and follow local safety guidelines.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Zone Summary */}
      {userRole === 'admin' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {zones.map(zone => (
            <Card key={zone.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedZone(zone)}>
              <CardContent className="p-4 text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center`} 
                     style={{ backgroundColor: getZoneColor(zone.type) }}>
                  <Users className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium">{zone.name.split(' ')[0]}</p>
                <p className="text-xs text-muted-foreground">{zone.incidentCount} incidents</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[400px] w-full">
            <MapContainer
              ref={mapRef}
              center={userLocation}
              zoom={14}
              scrollWheelZoom={true}
              className="h-full w-full rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController zones={zones} />
              
              {/* User location marker */}
              <Marker position={userLocation}>
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold">Your Location</h4>
                    <p className="text-sm">Current position</p>
                  </div>
                </Popup>
              </Marker>

              {/* Geofence zones */}
              {zones.map(zone => (
                <React.Fragment key={zone.id}>
                  <Circle
                    center={zone.center}
                    radius={zone.radius}
                    pathOptions={{
                      color: getZoneColor(zone.type),
                      fillColor: getZoneColor(zone.type),
                      fillOpacity: 0.2,
                      weight: 2
                    }}
                  />
                  <Marker 
                    position={zone.center}
                    icon={createCustomIcon(zone.type, userRole === 'admin' ? zone.incidentCount : undefined)}
                  >
                    <Popup>
                      <div className="p-3 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={zone.type === 'safe' ? 'default' : 
                                        zone.type === 'caution' ? 'secondary' : 'destructive'}>
                            {zone.type.toUpperCase()}
                          </Badge>
                          {userRole === 'admin' && (
                            <Badge variant="outline">{zone.incidentCount} incidents</Badge>
                          )}
                        </div>
                        <h4 className="font-semibold mb-1">{zone.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{zone.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Radius: {zone.radius}m
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}

              {/* Incident markers */}
              {incidents.map(incident => (
                <Marker
                  key={incident.id}
                  position={[incident.location.lat, incident.location.lng]}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold">{incident.type}</h4>
                      <p className="text-sm">Severity: {incident.severity}</p>
                      <p className="text-sm">Status: {incident.status}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Selected Zone Details */}
      {selectedZone && userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Zone Details
              <Button variant="outline" size="sm" onClick={() => setSelectedZone(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Badge variant={selectedZone.type === 'safe' ? 'default' : 
                              selectedZone.type === 'caution' ? 'secondary' : 'destructive'}>
                  {selectedZone.type.toUpperCase()}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold">{selectedZone.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedZone.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Radius:</span> {selectedZone.radius}m
                </div>
                <div>
                  <span className="font-medium">Incidents:</span> {selectedZone.incidentCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeofenceMap;