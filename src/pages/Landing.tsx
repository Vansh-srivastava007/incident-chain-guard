import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, MapPin, Anchor, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { UserProfileButton } from "@/components/UserProfileButton";
import { useAuth } from "@/hooks/useAuth";
import { PermissionModal } from "@/components/PermissionModal";
import Spline from '@splinetool/react-spline';

// Spline 3D Hero Component
const Hero3D = () => (
  <div className="h-[500px] w-full rounded-2xl overflow-hidden">
    <Spline scene="https://prod.spline.design/eSo9YFci-1sasxdL/scene.splinecode" />
  </div>
);
const Landing = () => {
  const { user } = useAuth();
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    // Show the permission modal when the page loads for the first time
    const hasSeenPermissions = localStorage.getItem('hasSeenPermissions');
    if (!hasSeenPermissions) {
      setTimeout(() => setShowPermissionModal(true), 1000); // Show after 1 second
    }
  }, []);

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
              
              <h1 className="text-5xl font-bold text-foreground leading-tight">
                Incident Response with
                <span className="text-primary"> Immutable Evidence</span>
              </h1>
              
              <p className="text-xl text-muted-foreground">
                When tourists face emergencies, every second counts. Our system enables 
                instant reporting, coordinated response, and blockchain-verified evidence 
                integrity for accountability and justice.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/report">Start Demo - Report Incident</Link>
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

        {/* Demo Instructions */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">45-Second Demo Flow</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-foreground">Report an Incident</h4>
                  <p className="text-muted-foreground">Fill out incident form, upload evidence, see hash generation</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-foreground">View on Operations Dashboard</h4>
                  <p className="text-muted-foreground">See incident on map, check details, review evidence</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-foreground">Simulate Emergency Response</h4>
                  <p className="text-muted-foreground">Click "Call Police (Mock)" to see integration simulation</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-foreground">Anchor Evidence</h4>
                  <p className="text-muted-foreground">Click "Anchor Evidence (Mock)" to see blockchain simulation</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">5</div>
                <div>
                  <h4 className="font-semibold text-foreground">Verify Hash Integrity</h4>
                  <p className="text-muted-foreground">Click "Verify Hash" to confirm evidence hasn't been tampered with</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p className="text-sm">
            🚨 This is a PROTOTYPE using CLIENT-SIDE MOCKS for demo purposes. 
            Production deployment requires integration with Twilio (PSTN), MinIO (storage), and Polygon (blockchain).
          </p>
        </div>
      </main>

      {/* Permission Modal */}
      <PermissionModal 
        isOpen={showPermissionModal} 
        onClose={handlePermissionClose} 
      />
    </div>;
};
export default Landing;