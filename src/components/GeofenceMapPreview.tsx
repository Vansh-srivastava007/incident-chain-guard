import React from "react";
import { cn } from "@/lib/utils";
import geofenceMapImage from "@/assets/geofence-map.jpeg";

interface Props {
  className?: string;
}

// Lightweight, dependency-free preview to avoid react-leaflet runtime issues
export const GeofenceMapPreview: React.FC<Props> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full bg-muted rounded-lg overflow-hidden", className)}>
      {/* Geofence map image */}
      <img 
        src={geofenceMapImage}
        alt="Geofencing map showing safe zones in green, caution zones in yellow, and danger zones in red"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-card/85 backdrop-blur-sm border border-border rounded-md px-3 py-2 text-xs shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" aria-hidden />
            <span className="text-foreground/90">Safe (Green)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500" aria-hidden />
            <span className="text-foreground/90">Caution</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden />
            <span className="text-foreground/90">Danger</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofenceMapPreview;
