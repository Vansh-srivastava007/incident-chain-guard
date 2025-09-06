import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge-variant";
import { IncidentMap } from "@/components/IncidentMap";
import { Badge } from "@/components/ui/badge";
import { IncidentStore } from "@/utils/store";
import { generateMockTxId, generateBlockchainExplorerUrl } from "@/utils/crypto";
import { Incident, AuditLogEntry } from "@/types/incident";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Phone, 
  Anchor, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Hash,
  ExternalLink,
  MapPin,
  FileText,
  Eye,
  EyeOff
} from "lucide-react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { UserProfileButton } from "@/components/UserProfileButton";

const OpsDashboard = () => {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [blurEvidence, setBlurEvidence] = useState(true);
  const [isAnchoring, setIsAnchoring] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = () => {
    const store = IncidentStore.getInstance();
    const allIncidents = store.getAllIncidents();
    setIncidents(allIncidents);
    if (allIncidents.length > 0 && !selectedIncident) {
      setSelectedIncident(allIncidents[0]);
    }
  };

  const updateIncident = (updatedIncident: Incident) => {
    const store = IncidentStore.getInstance();
    store.saveIncident(updatedIncident);
    setIncidents(prev => prev.map(i => i.id === updatedIncident.id ? updatedIncident : i));
    if (selectedIncident?.id === updatedIncident.id) {
      setSelectedIncident(updatedIncident);
    }
  };

  const addAuditLog = (incident: Incident, action: string, details?: string) => {
    const auditEntry: AuditLogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action,
      user: 'Operations Team',
      details
    };

    return {
      ...incident,
      auditLog: [...incident.auditLog, auditEntry]
    };
  };

  const handleEmergencyCall = (type: 'police' | 'hospital' | 'fire') => {
    if (!selectedIncident) return;

    const contactInfo = {
      police: { name: 'NYPD Emergency Dispatch', number: '911', dept: 'Police Department' },
      hospital: { name: 'Mount Sinai Emergency', number: '(212) 241-6500', dept: 'Emergency Medical' },
      fire: { name: 'FDNY Emergency Response', number: '911', dept: 'Fire Department' }
    };

    const contact = contactInfo[type];
    
    // Show initial call notification
    toast({
      title: `📞 Initiating Emergency Call`,
      description: `Connecting to ${contact.dept}...`,
    });

    // Simulate call connection process
    setTimeout(() => {
      toast({
        title: `🚨 EMERGENCY CALL CONNECTED (Mock)`,
        description: (
          <div className="space-y-3">
            <div className="font-semibold">Connected to: {contact.name}</div>
            <div className="text-sm space-y-1">
              <p>📍 Location: {selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lng.toFixed(4)}</p>
              <p>🚨 Incident: {selectedIncident.type.toUpperCase()}</p>
              <p>⚡ Severity: {selectedIncident.severity}/10</p>
              <p>👤 Reporter: {selectedIncident.reporterName || 'Anonymous'}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="" variant="mock">MOCK PSTN/TWILIO</StatusBadge>
              <span className="text-xs">Replace with Twilio Voice API</span>
            </div>
            <div className="text-xs bg-muted p-2 rounded">
              📞 Call Duration: 00:45 (simulated)
              <br />
              📋 Incident ID shared with dispatcher
              <br />
              🚛 Units dispatched to location
            </div>
          </div>
        ),
        duration: 10000,
      });

      // Add detailed audit log
      const updatedIncident = addAuditLog(
        selectedIncident,
        `Emergency Response - ${contact.dept.toUpperCase()}`,
        `Connected to ${contact.name} (${contact.number}). Incident details shared, units dispatched. Call ID: MOCK-${Date.now()}`
      );

      updateIncident(updatedIncident);
    }, 1500);
  };

  const handleAcknowledge = () => {
    if (!selectedIncident) return;

    const now = new Date().toISOString();
    let updatedIncident: Incident = {
      ...selectedIncident,
      status: 'acknowledged',
      acknowledgedAt: now
    };

    updatedIncident = addAuditLog(updatedIncident, 'Incident Acknowledged') as Incident;
    updateIncident(updatedIncident);

    toast({
      title: "Incident acknowledged",
      description: "Response team has been notified.",
    });
  };

  const handleResolve = () => {
    if (!selectedIncident) return;

    const now = new Date().toISOString();
    let updatedIncident: Incident = {
      ...selectedIncident,
      status: 'resolved',
      resolvedAt: now
    };

    updatedIncident = addAuditLog(updatedIncident, 'Incident Resolved') as Incident;
    updateIncident(updatedIncident);

    toast({
      title: "Incident resolved",
      description: "Case has been closed successfully.",
    });
  };

  const handleAnchorEvidence = async () => {
    if (!selectedIncident || selectedIncident.anchorStatus === 'anchored') return;

    setIsAnchoring(true);

    // Show initial anchoring notification
    toast({
      title: "🔗 Initiating Blockchain Anchor",
      description: "Preparing evidence for blockchain submission...",
    });

    // Update to anchoring status
    let updatedIncident: Incident = {
      ...selectedIncident,
      anchorStatus: 'anchoring'
    };
    updateIncident(updatedIncident);

    // Simulate blockchain anchoring process with multiple steps
    setTimeout(() => {
      toast({
        title: "⛓️ Computing Evidence Hash",
        description: "Generating cryptographic proof of evidence integrity...",
      });
    }, 1000);

    setTimeout(() => {
      toast({
        title: "📡 Broadcasting to Blockchain",
        description: "Submitting transaction to Polygon network...",
      });
    }, 2500);

    setTimeout(() => {
      const txId = generateMockTxId();
      const explorerUrl = generateBlockchainExplorerUrl(txId);
      
      updatedIncident = {
        ...updatedIncident,
        anchorStatus: 'anchored',
        chainTxId: txId,
        chainHash: selectedIncident.files.length > 0 ? selectedIncident.files[0].hash : 'demo-hash-' + Math.random().toString(36).substring(7)
      };

      updatedIncident = addAuditLog(
        updatedIncident, 
        'Evidence Anchored to Blockchain', 
        `Transaction confirmed on Polygon. TX ID: ${txId} (MOCK)`
      ) as Incident;

      updateIncident(updatedIncident);
      setIsAnchoring(false);

      toast({
        title: "✅ Blockchain Anchor Complete (Mock)",
        description: (
          <div className="space-y-3">
            <p>Evidence successfully anchored to blockchain!</p>
            <div className="flex items-center gap-2">
              <StatusBadge status="" variant="mock">MOCK POLYGON</StatusBadge>
              <span className="text-xs">Replace with Polygon API</span>
            </div>
            <div className="text-xs bg-muted p-2 rounded font-mono">
              🔗 TX Hash: {txId}
              <br />
              📋 Evidence Hash: {updatedIncident.chainHash?.slice(0, 32)}...
              <br />
              ⛽ Gas Used: 0.00123 MATIC (mock)
              <br />
              🕒 Block Time: {new Date().toLocaleTimeString()}
            </div>
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
            >
              🔍 View on PolygonScan (Mock) <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ),
        duration: 12000,
      });
    }, 4000);
  };

  const handleVerifyHash = () => {
    if (!selectedIncident?.chainHash) {
      toast({
        title: "No Evidence to Verify",
        description: "Please anchor evidence first before verification.",
        variant: "destructive"
      });
      return;
    }

    // Show verification process
    toast({
      title: "🔍 Verifying Hash Integrity...",
      description: "Checking evidence against blockchain records...",
    });

    // Simulate verification delay
    setTimeout(() => {
      // Mock hash verification - 95% success rate for demo
      const isValid = Math.random() > 0.05;
      
      if (isValid) {
        toast({
          title: "✅ Hash Verification Successful",
          description: (
            <div className="space-y-2">
              <p>Evidence integrity confirmed - no tampering detected.</p>
              <div className="flex items-center gap-2">
                <StatusBadge status="" variant="mock">MOCK VERIFICATION</StatusBadge>
                <span className="text-xs">Production: Use Polygon API</span>
              </div>
              <div className="text-xs font-mono bg-muted p-2 rounded">
                Original Hash: {selectedIncident.chainHash?.slice(0, 32)}...
                <br />
                Current Hash: {selectedIncident.chainHash?.slice(0, 32)}...
                <br />
                Status: ✅ MATCH
              </div>
            </div>
          ),
          duration: 8000,
        });

        // Add to audit log
        const updatedIncident = addAuditLog(
          selectedIncident,
          'Hash Verification - SUCCESS',
          'Evidence integrity confirmed via blockchain verification (MOCK)'
        );
        updateIncident(updatedIncident);
      } else {
        toast({
          title: "❌ Hash Verification Failed",
          description: (
            <div className="space-y-2">
              <p>⚠️ Warning: Evidence may have been tampered with!</p>
              <div className="text-xs font-mono bg-destructive/10 p-2 rounded">
                Hash Mismatch Detected
                <br />
                Investigation Required
              </div>
            </div>
          ),
          variant: "destructive",
          duration: 8000,
        });

        // Add to audit log
        const updatedIncident = addAuditLog(
          selectedIncident,
          'Hash Verification - FAILED',
          'Evidence integrity compromised - hash mismatch detected (MOCK)'
        );
        updateIncident(updatedIncident);
      }
    }, 2000);
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

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Operations Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Real-time incident monitoring and response coordination
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="" variant="mock">DEMO MODE</StatusBadge>
            <Button asChild variant="outline">
              <Link to="/report">Report New Incident</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back to Landing</Link>
            </Button>
            <UserProfileButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Incident List */}
        <div className="w-80 border-r bg-card overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Active Incidents ({incidents.length})</h2>
          </div>
          <div className="space-y-2 p-4">
            {incidents.map((incident) => (
              <Card 
                key={incident.id}
                className={`cursor-pointer transition-colors ${
                  selectedIncident?.id === incident.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedIncident(incident)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium capitalize truncate">{incident.type}</h3>
                      <p className="text-xs text-muted-foreground">
                        ID: {incident.id.slice(0, 8)}...
                      </p>
                    </div>
                    <StatusBadge 
                      status={getSeverityStatus(incident.severity)} 
                      variant="severity"
                    >
                      {incident.severity}
                    </StatusBadge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {incident.notes || "No additional details"}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.reportedAt).toLocaleString()}
                  </div>
                  
                  <div className="flex gap-1">
                    <StatusBadge status={incident.status} variant="status">
                      {incident.status}
                    </StatusBadge>
                    <StatusBadge status={incident.anchorStatus} variant="anchor">
                      {incident.anchorStatus === 'not_anchored' ? 'Not Anchored' :
                       incident.anchorStatus === 'anchoring' ? 'Anchoring...' : 'Anchored'}
                    </StatusBadge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Center - Map */}
        <div className="flex-1 relative">
          <IncidentMap
            incidents={incidents}
            selectedIncidentId={selectedIncident?.id}
            onIncidentSelect={setSelectedIncident}
            className="h-full"
          />
          
          {/* Map overlay stats */}
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total</div>
                <div className="font-bold">{incidents.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Pending</div>
                <div className="font-bold text-urgent">
                  {incidents.filter(i => i.status === 'pending').length}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Anchored</div>
                <div className="font-bold text-success">
                  {incidents.filter(i => i.anchorStatus === 'anchored').length}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Resolved</div>
                <div className="font-bold text-primary">
                  {incidents.filter(i => i.status === 'resolved').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Incident Details */}
        <div className="w-96 border-l bg-card overflow-y-auto">
          {selectedIncident ? (
            <div className="space-y-6 p-6">
              {/* Incident Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold capitalize">{selectedIncident.type}</h2>
                  <StatusBadge 
                    status={getSeverityStatus(selectedIncident.severity)} 
                    variant="severity"
                  >
                    {getSeverityLabel(selectedIncident.severity)} ({selectedIncident.severity})
                  </StatusBadge>
                </div>
                
                <div className="flex gap-2">
                  <StatusBadge status={selectedIncident.status} variant="status">
                    {selectedIncident.status}
                  </StatusBadge>
                  <StatusBadge status={selectedIncident.anchorStatus} variant="anchor">
                    {selectedIncident.anchorStatus === 'not_anchored' ? 'Not Anchored' :
                     selectedIncident.anchorStatus === 'anchoring' ? 'Anchoring...' : 'Anchored'}
                  </StatusBadge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleEmergencyCall('police')}
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Police
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEmergencyCall('hospital')}
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Hospital
                  </Button>
                </div>
                
                <Button 
                  variant="outline"
                  size="sm" 
                  className="w-full flex items-center gap-2"
                  onClick={handleAnchorEvidence}
                  disabled={selectedIncident.anchorStatus === 'anchored' || isAnchoring}
                >
                  <Anchor className="w-4 h-4" />
                  {selectedIncident.anchorStatus === 'anchored' ? 'Evidence Anchored ✓' :
                   isAnchoring ? 'Anchoring...' : 'Anchor Evidence (Mock)'}
                </Button>
                
                {selectedIncident.anchorStatus === 'anchored' && (
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="w-full flex items-center gap-2"
                    onClick={handleVerifyHash}
                  >
                    <Hash className="w-4 h-4" />
                    Verify Hash Integrity
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAcknowledge}
                    disabled={selectedIncident.status !== 'pending'}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Acknowledge
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleResolve}
                    disabled={selectedIncident.status === 'resolved'}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </Button>
                </div>
              </div>

              {/* Incident Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Incident Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Reporter</div>
                    <div className="text-sm">{selectedIncident.reporterName || 'Anonymous'}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Location</div>
                    <div className="text-sm flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div>{selectedIncident.location.address || 'Address not available'}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {selectedIncident.location.lat.toFixed(6)}, {selectedIncident.location.lng.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Notes</div>
                    <div className="text-sm">{selectedIncident.notes || 'No additional notes'}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Reported</div>
                    <div className="text-sm">{new Date(selectedIncident.reportedAt).toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Evidence Files */}
              {selectedIncident.files.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Evidence Files ({selectedIncident.files.length})</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBlurEvidence(!blurEvidence)}
                      >
                        {blurEvidence ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedIncident.files.map((file) => (
                      <div key={file.id} className="border rounded p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{file.type}</div>
                          </div>
                          {file.preview && (
                            <img 
                              src={file.preview} 
                              alt="Evidence" 
                              className={`w-12 h-12 object-cover rounded border ${blurEvidence ? 'blur-sm' : ''}`}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Hash className="w-3 h-3 text-muted-foreground" />
                          <span className="font-mono text-muted-foreground">
                            {file.hash.slice(0, 16)}...
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Blockchain Status */}
              {selectedIncident.chainTxId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Blockchain Anchor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Transaction ID</div>
                      <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                        {selectedIncident.chainTxId}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Evidence Hash</div>
                      <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                        {selectedIncident.chainHash}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleVerifyHash}
                        className="flex-1"
                      >
                        Verify Hash
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <a 
                          href={generateBlockchainExplorerUrl(selectedIncident.chainTxId)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Explorer
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Audit Trail */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Audit Trail ({selectedIncident.auditLog.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedIncident.auditLog.slice().reverse().map((entry) => (
                      <div key={entry.id} className="text-xs border-l-2 border-primary/20 pl-3 pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{entry.action}</div>
                          <div className="text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-muted-foreground">By: {entry.user}</div>
                        {entry.details && (
                          <div className="text-muted-foreground mt-1 font-mono text-xs">
                            {entry.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-2">
                <Shield className="w-12 h-12 mx-auto opacity-50" />
                <p>Select an incident to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpsDashboard;