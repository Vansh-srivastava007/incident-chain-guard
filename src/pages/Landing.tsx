import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, MapPin, Anchor, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { UserProfileButton } from "@/components/UserProfileButton";
import { useAuth } from "@/hooks/useAuth";
import { PermissionModal } from "@/components/PermissionModal";

import Spline from '@splinetool/react-spline';

// Fallback 3D-style hero element
const FallbackHero = () => (
  <div className="relative h-[500px] w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-2xl overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--accent))_0%,transparent_50%)] opacity-30"></div>
    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/20 rounded-full blur-lg animate-pulse delay-1000"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="w-48 h-48 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl backdrop-blur-sm border border-primary/20 animate-float">
        <div className="absolute inset-4 bg-gradient-to-br from-background/50 to-transparent rounded-2xl flex items-center justify-center">
          <Shield className="w-16 h-16 text-primary opacity-60" />
        </div>
      </div>
    </div>
  </div>
);

// Spline 3D Hero Component with error handling
const Hero3D = () => {
  const [hasError, setHasError] = useState(false);

  const handleSplineError = () => {
    console.warn("Spline failed to load, falling back to CSS hero");
    setHasError(true);
  };

  if (hasError) {
    return <FallbackHero />;
  }

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden">
      <Spline 
        scene="https://prod.spline.design/eSo9YFci-1sasxdL/scene.splinecode"
        onError={handleSplineError}
      />
    </div>
  );
};
const GeofenceMapLazy = lazy(() => import("@/components/GeofenceMap").then(m => ({ default: m.GeofenceMap })));
const Landing = () => {
  const { user } = useAuth();
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Permission modal will only show when "Start Demo" button is clicked

  const handlePermissionClose = () => {
    setShowPermissionModal(false);
    localStorage.setItem('hasSeenPermissions', 'true');
  };
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header with Profile Button */}
      <header className="absolute top-0 right-0 p-6 z-10">
        {user ? <UserProfileButton /> : <Button asChild variant="outline">
            <Link to="/auth">Sign In</Link>
          </Button>}
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-card border rounded-full px-6 py-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-card-foreground">
                  Blockchain Tourist Safety Protocol
                </span>
              </div>
              
              <h1 className="text-6xl font-bold text-foreground leading-tight mb-4">
                Safe Tour AI
              </h1>
              <h2 className="text-3xl font-semibold text-muted-foreground leading-tight">
                Incident Response with
                <span className="text-primary"> Immutable Evidence</span>
              </h2>
              
              <p className="text-xl text-muted-foreground">
                When tourists face emergencies, every second counts. Our system enables 
                instant reporting, coordinated response, and blockchain-verified evidence 
                integrity for accountability and justice.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => setShowPermissionModal(true)}
                >
                  Start Demo - Report Incident
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to="/admin-login">Admin Panel</Link>
                </Button>
              </div>
            </div>

            {/* Right 3D Section */}
            <div className="hidden lg:block relative">
              <Hero3D />
              {/* Overlay to cover Spline branding */}
              <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Powered by AI Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Statement */}
        <Card className="mb-12 border-l-4 border-l-destructive mt-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">The Challenge</h2>
            <p className="text-lg text-muted-foreground">
              Tourist incidents often suffer from poor coordination, evidence tampering, 
              delayed response times, and lack of accountability between local authorities 
              and international travelers. Traditional systems leave evidence vulnerable 
              and create trust gaps in crisis situations.
            </p>
          </CardContent>
        </Card>

        {/* Key Differentiators */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-foreground">Instant Geolocation</h3>
            <p className="text-muted-foreground">
              Automatic location capture with precise coordinates and visual evidence 
              upload for immediate incident documentation.
            </p>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-foreground">Coordinated Response</h3>
            <p className="text-muted-foreground">
              Direct integration with emergency services, automated severity assessment, 
              and real-time incident tracking for coordinated response.
            </p>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Anchor className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-foreground">Immutable Evidence</h3>
            <p className="text-muted-foreground">
              Blockchain-anchored evidence hashes ensure evidence integrity, 
              preventing tampering and providing cryptographic proof for legal proceedings.
            </p>
          </Card>
        </div>

        {/* Geofencing Section */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Smart Geofencing</h2>
                <p className="text-lg text-muted-foreground">
                  Our AI-powered geofencing system continuously monitors tourist locations and 
                  automatically assesses risk levels based on real-time data, historical incidents, 
                  and local safety conditions.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                    <span className="text-foreground font-medium">Safe Zones</span>
                    <span className="text-muted-foreground">- Low risk areas with active monitoring</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-accent rounded-full"></div>
                    <span className="text-foreground font-medium">Caution Zones</span>
                    <span className="text-muted-foreground">- Moderate risk, enhanced surveillance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-destructive rounded-full"></div>
                    <span className="text-foreground font-medium">High Risk Zones</span>
                    <span className="text-muted-foreground">- Immediate alerts and response protocols</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px] rounded-lg overflow-hidden border">
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading map…</div>}>
                  <GeofenceMapLazy className="w-full h-full" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Workflow */}
        <Card className="bg-primary/5 border-primary/20 mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">90-Second AI Response Workflow</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">15s</div>
                <div>
                  <h4 className="font-semibold text-foreground">Monitoring Agent Identifies Anomaly</h4>
                  <p className="text-muted-foreground">AI continuously monitors geofenced areas and detects unusual patterns or incidents</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">25s</div>
                <div>
                  <h4 className="font-semibold text-foreground">Geofence Validation</h4>
                  <p className="text-muted-foreground">Confirms exact location coordinates and assesses risk level based on zone classification</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">45s</div>
                <div>
                  <h4 className="font-semibold text-foreground">Triage Agent Scores Incident</h4>
                  <p className="text-muted-foreground">AI analyzes severity, bundles evidence, and prioritizes response based on threat level</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">60s</div>
                <div>
                  <h4 className="font-semibold text-foreground">Orchestration Agent Matches Responders</h4>
                  <p className="text-muted-foreground">Identifies and contacts nearest qualified emergency responders and authorities</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">75s</div>
                <div>
                  <h4 className="font-semibold text-foreground">Blockchain Anchoring</h4>
                  <p className="text-muted-foreground">Creates immutable record of incident data and evidence for legal accountability</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">90s</div>
                <div>
                  <h4 className="font-semibold text-foreground">Emergency Dispatch Coordination</h4>
                  <p className="text-muted-foreground">Coordinates with responders en route, provides real-time updates and location data</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Footer */}
        <footer className="mt-16 border-t border-border/40 pt-12 pb-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg">IncidentChain</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Blockchain-powered tourist safety and emergency response system.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Instant Incident Reporting</li>
                <li>Blockchain Evidence Anchoring</li>
                <li>Emergency Response Coordination</li>
                <li>Hash Integrity Verification</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Safety</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>24/7 Emergency Support</li>
                <li>Real-time Location Tracking</li>
                <li>Automated Alert System</li>
                <li>Multi-language Support</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Emergency Procedures</li>
                <li>Contact Information</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center border-t border-border/40 pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              🚨 This is a PROTOTYPE using CLIENT-SIDE MOCKS for demo purposes. 
              Production deployment requires integration with Twilio (PSTN), MinIO (storage), and Polygon (blockchain).
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 IncidentChain Guard. All rights reserved. Emergency: 112 (India) | 911 (USA) | 999 (UK)
            </p>
          </div>
        </footer>
      </main>

      {/* Permission Modal */}
      <PermissionModal 
        isOpen={showPermissionModal} 
        onClose={handlePermissionClose}
        navigateAfterAllow="/report"
      />
    </div>;
};
export default Landing;