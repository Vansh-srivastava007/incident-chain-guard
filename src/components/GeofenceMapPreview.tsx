import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

// Lightweight, dependency-free preview to avoid react-leaflet runtime issues
export const GeofenceMapPreview: React.FC<Props> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full bg-muted rounded-lg overflow-hidden", className)}>
      {/* Simple illustrative map-like SVG with three geofences */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Geofencing preview with safe, caution, and danger zones"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeOpacity="0.25" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="800" height="400" fill="hsl(var(--card))" />
        <rect width="800" height="400" fill="url(#grid)" />

        {/* Safe Zone */}
        <circle cx="220" cy="200" r="120" fill="hsl(var(--primary) / 0.18)" stroke="hsl(var(--primary))" strokeWidth="3" />
        {/* Caution Zone */}
        <circle cx="420" cy="170" r="90" fill="hsl(var(--accent) / 0.18)" stroke="hsl(var(--accent))" strokeWidth="3" />
        {/* Danger Zone */}
        <circle cx="600" cy="230" r="110" fill="hsl(var(--destructive) / 0.18)" stroke="hsl(var(--destructive))" strokeWidth="3" />

        {/* A few mock pins */}
        <g fill="hsl(var(--foreground))">
          <circle cx="220" cy="200" r="4" />
          <circle cx="430" cy="180" r="4" />
          <circle cx="590" cy="240" r="4" />
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-card/85 backdrop-blur-sm border border-border rounded-md px-3 py-2 text-xs shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" aria-hidden />
            <span className="text-foreground/90">Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent" aria-hidden />
            <span className="text-foreground/90">Caution</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-destructive" aria-hidden />
            <span className="text-foreground/90">Danger</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofenceMapPreview;
