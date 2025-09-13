import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Shield, Heart, Flame, AlertTriangle, Users, ArrowLeft, Anchor, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIncidents } from '@/hooks/useIncidents';
import { useToast } from '@/hooks/use-toast';
import { IncidentMap } from "@/components/IncidentMap";
import GeofenceMap from "@/components/GeofenceMap";
import { Incident } from '@/types/incident';

interface EmergencyContact {
  category: string;
  name: string;
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const emergencyContacts: EmergencyContact[] = [
  {
    category: "Emergency Services",
    name: "Emergency Helpline",
    number: "112",
    icon: AlertTriangle,
    description: "All emergency services (Police, Fire, Medical)"
  },
  {
    category: "Police",
    name: "Police Helpline",
    number: "100",
    icon: Shield,
    description: "Police emergency and crime reporting"
  },
  {
    category: "Medical Emergency",
    name: "Medical Emergency",
    number: "108",
    icon: Heart,
    description: "Ambulance and medical emergency services"
  },
  {
    category: "Fire Department",
    name: "Fire Brigade",
    number: "101",
    icon: Flame,
    description: "Fire emergency and rescue services"
  },
  {
    category: "Women Helpline",
    name: "Women Helpline",
    number: "1091",
    icon: Users,
    description: "24x7 helpline for women in distress"
  },
  {
    category: "Disaster Management",
    name: "Disaster Management",
    number: "1070",
    icon: AlertTriangle,
    description: "Natural disaster and emergency response"
  },
  {
    category: "Tourist Helpline",
    name: "Incredible India Helpline",
    number: "1363",
    icon: Phone,
    description: "Tourist assistance and support services"
  }
];

const AdminPanel = () => {
  const { incidents, loading, anchorEvidence, verifyHashIntegrity } = useIncidents();
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [processingIncident, setProcessingIncident] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCall = (number: string, name: string) => {
    // In a real app, this would initiate a call
    toast({
      title: "Call Initiated",
      description: `Calling ${name} at ${number}`,
    });
    
    // Simulate call for demo
    window.open(`tel:${number}`, '_self');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'acknowledged': return 'default';
      case 'resolved': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'secondary';
    if (severity <= 6) return 'default';
    if (severity <= 8) return 'destructive';
    return 'destructive';
  };

  const getAnchorStatusColor = (status: string) => {
    switch (status) {
      case 'not_anchored': return 'secondary';
      case 'anchoring': return 'default';
      case 'anchored': return 'default';
      default: return 'secondary';
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'verified': return 'default';
      case 'compromised': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleAnchorEvidence = async (incident: any) => {
    setProcessingIncident(incident.id);
    try {
      await anchorEvidence(incident);
    } finally {
      setProcessingIncident(null);
    }
  };

  const handleVerifyHash = async (incident: any) => {
    setProcessingIncident(incident.id);
    try {
      await verifyHashIntegrity(incident);
    } finally {
      setProcessingIncident(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Emergency Response Management System</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Last updated: {lastUpdate.toLocaleTimeString()}</p>
            <p>Auto-refresh: Every 30s</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="geofencing">Geofencing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Statistics */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{incidents.length}</p>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {incidents.filter(i => i.status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {incidents.filter(i => i.status === 'acknowledged').length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {incidents.filter(i => i.status === 'resolved').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </CardContent>
              </Card>
            </div>

            {/* Incident Map Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Incident Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IncidentMap
                  incidents={incidents}
                  selectedIncidentId={selectedIncident?.id}
                  onIncidentSelect={(incident: Incident) => setSelectedIncident(incident)}
                  className="h-[400px]"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              All Reports ({incidents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reports submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Anchor Status</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-mono text-xs">
                          {incident.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {incident.reporterName || 'Anonymous'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {incident.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(incident.severity)}>
                            {incident.severity}/10
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getAnchorStatusColor(incident.anchorStatus)}>
                            {incident.anchorStatus}
                          </Badge>
                          {incident.chainTxId && (
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                              TX: {incident.chainTxId.slice(0, 10)}...
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getVerificationStatusColor(incident.verificationStatus)}>
                            {incident.verificationStatus}
                          </Badge>
                          {incident.verificationAt && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(incident.verificationAt).toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(incident.reportedAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs">
                          {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-sm" title={incident.notes}>
                            {incident.notes || 'No details provided'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            {incident.anchorStatus === 'not_anchored' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAnchorEvidence(incident)}
                                disabled={processingIncident === incident.id}
                                className="text-xs"
                              >
                                <Anchor className="w-3 h-3 mr-1" />
                                {processingIncident === incident.id ? 'Anchoring...' : 'Anchor Evidence (Mock)'}
                              </Button>
                            )}
                            {incident.anchorStatus === 'anchored' && incident.chainHash && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyHash(incident)}
                                disabled={processingIncident === incident.id}
                                className="text-xs"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {processingIncident === incident.id ? 'Verifying...' : 'Verify Hash'}
                              </Button>
                            )}
                            {incident.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleCall('100', 'Police')}
                                className="text-xs"
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Call Police (Mock)
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Helpline Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Emergency Helpline Numbers (India)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emergencyContacts.map((contact, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <contact.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm">{contact.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              {contact.description}
                            </p>
                            <Button 
                              onClick={() => handleCall(contact.number, contact.name)}
                              size="sm" 
                              className="w-full"
                            >
                              <Phone className="w-3 h-3 mr-2" />
                              Call {contact.number}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geofencing" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Geofencing & Safety Zones</h2>
                <p className="text-muted-foreground">
                  Monitor safety zones and geofenced areas with real-time incident tracking
                </p>
              </div>
            </div>

            <GeofenceMap 
              incidents={incidents}
              selectedIncidentId={selectedIncident?.id}
              onIncidentSelect={(id: string) => setSelectedIncident(incidents.find(i => i.id === id) || null)}
              userRole="admin"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;