import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  Phone, 
  Navigation,
  Clock,
  FileText,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import GeofenceMap from '@/components/GeofenceMap';
import { useIncidents } from '@/hooks/useIncidents';

const UserDashboard = () => {
  const { incidents } = useIncidents();
  const [activeTab, setActiveTab] = useState("location");
  
  // Mock user data
  const userReports = incidents.filter(incident => 
    incident.reporterName?.toLowerCase().includes('tourist') || 
    incident.reporterName?.toLowerCase().includes('traveler')
  ).slice(0, 3);

  const safetyTips = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Emergency Contacts",
      description: "Save local emergency numbers: 112 (India), 911 (USA), 999 (UK)"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Share Location",
      description: "Keep location sharing on with trusted contacts"
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: "Document Everything",
      description: "Take photos of incidents and keep evidence secure"
    }
  ];

  const quickActions = [
    {
      title: "Report Incident",
      description: "Report a new safety concern or emergency",
      icon: <AlertTriangle className="w-5 h-5" />,
      href: "/report",
      variant: "destructive" as const
    },
    {
      title: "View Safety Zones",
      description: "Check current location safety status",
      icon: <Shield className="w-5 h-5" />,
      href: "#geofencing",
      variant: "default" as const
    },
    {
      title: "Emergency Contacts",
      description: "Quick access to emergency services",
      icon: <Phone className="w-5 h-5" />,
      href: "#emergency",
      variant: "outline" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Safety Dashboard</h1>
            <p className="text-muted-foreground">
              Stay safe with real-time location monitoring and emergency tools
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/report">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Incident
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <MapPin className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    action.variant === 'destructive' ? 'bg-destructive/10 text-destructive' :
                    action.variant === 'default' ? 'bg-primary/10 text-primary' :
                    'bg-muted'
                  }`}>
                    {action.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="location">Location & Safety</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="safety">Safety Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="location" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Current Location Safety
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GeofenceMap userRole="user" incidents={incidents} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userReports.length > 0 ? (
                  <div className="space-y-4">
                    {userReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                          <Badge variant={
                            report.status === 'resolved' ? 'default' :
                            report.status === 'acknowledged' ? 'secondary' : 'outline'
                          }>
                              {report.status.replace('_', ' ')}
                            </Badge>
                            <span className="font-medium">{report.type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(report.reportedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Severity: {report.severity}/5 • {report.location.address || 'Location recorded'}
                        </p>
                        {report.notes && (
                          <p className="text-sm">{report.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Reports Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't submitted any incident reports.
                    </p>
                    <Button asChild>
                      <Link to="/report">Create First Report</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <div className="grid gap-6">
              {/* Safety Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Essential Safety Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {safetyTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {tip.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{tip.title}</h4>
                          <p className="text-sm text-muted-foreground">{tip.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Local Emergency</h4>
                        <p className="text-sm text-muted-foreground">Police, Fire, Medical</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Call 112
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Tourist Police</h4>
                        <p className="text-sm text-muted-foreground">Specialized tourist assistance</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Call Now
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Embassy Support</h4>
                        <p className="text-sm text-muted-foreground">Consular services</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;