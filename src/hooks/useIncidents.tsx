import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Incident, IncidentFile, AuditLogEntry } from '@/types/incident';

interface DatabaseIncident {
  id: string;
  reporter_name: string | null;
  type: 'theft' | 'assault' | 'medical' | 'crowd' | 'other';
  severity: number;
  location_lat: number;
  location_lng: number;
  location_address: string | null;
  notes: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  anchor_status: 'not_anchored' | 'anchoring' | 'anchored';
  verification_status: string | null;
  verification_at: string | null;
  chain_tx_id: string | null;
  chain_hash: string | null;
  reported_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const transformDatabaseIncident = async (dbIncident: DatabaseIncident): Promise<Incident> => {
    // Fetch files for this incident
    const { data: files } = await supabase
      .from('incident_files')
      .select('*')
      .eq('incident_id', dbIncident.id);

    // Fetch audit logs for this incident
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('incident_id', dbIncident.id)
      .order('timestamp', { ascending: false });

    return {
      id: dbIncident.id,
      reporterName: dbIncident.reporter_name || undefined,
      type: dbIncident.type,
      severity: dbIncident.severity,
      location: {
        lat: Number(dbIncident.location_lat),
        lng: Number(dbIncident.location_lng),
        address: dbIncident.location_address || undefined
      },
      notes: dbIncident.notes,
      files: files?.map((file): IncidentFile => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        hash: file.hash,
        preview: file.preview || undefined
      })) || [],
      status: dbIncident.status,
      anchorStatus: dbIncident.anchor_status,
      verificationStatus: (dbIncident.verification_status as 'pending' | 'verified' | 'compromised') || 'pending',
      chainTxId: dbIncident.chain_tx_id || undefined,
      chainHash: dbIncident.chain_hash || undefined,
      reportedAt: dbIncident.reported_at,
      acknowledgedAt: dbIncident.acknowledged_at || undefined,
      resolvedAt: dbIncident.resolved_at || undefined,
      verificationAt: dbIncident.verification_at || undefined,
      auditLog: auditLogs?.map((log): AuditLogEntry => ({
        id: log.id,
        timestamp: log.timestamp,
        action: log.action,
        user: log.user_name,
        details: log.details || undefined
      })) || []
    };
  };

  const loadIncidents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedIncidents = await Promise.all(
        data.map(transformDatabaseIncident)
      );

      setIncidents(transformedIncidents);
    } catch (error) {
      console.error('Error loading incidents:', error);
      toast({
        title: "Error Loading Incidents",
        description: "Failed to load incidents from database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIncident = async (updatedIncident: Incident) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({
          status: updatedIncident.status,
          anchor_status: updatedIncident.anchorStatus,
          verification_status: updatedIncident.verificationStatus,
          chain_tx_id: updatedIncident.chainTxId,
          chain_hash: updatedIncident.chainHash,
          acknowledged_at: updatedIncident.acknowledgedAt,
          resolved_at: updatedIncident.resolvedAt,
          verification_at: updatedIncident.verificationAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedIncident.id);

      if (error) throw error;

      setIncidents(prev => 
        prev.map(incident => 
          incident.id === updatedIncident.id ? updatedIncident : incident
        )
      );
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: "Error Updating Incident",
        description: "Failed to update incident in database.",
        variant: "destructive"
      });
    }
  };

  const addAuditLog = async (incident: Incident, action: string, details?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          incident_id: incident.id,
          action,
          user_name: user.user_metadata?.display_name || user.email || 'Unknown User',
          details,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;

      // Reload incidents to get updated audit logs
      loadIncidents();
    } catch (error) {
      console.error('Error adding audit log:', error);
      toast({
        title: "Error Adding Audit Log",
        description: "Failed to add audit log to database.",
        variant: "destructive"
      });
    }
  };

  const createIncident = async (incidentData: Omit<Incident, 'id' | 'auditLog' | 'reportedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          reporter_name: incidentData.reporterName,
          type: incidentData.type,
          severity: incidentData.severity,
          location_lat: incidentData.location.lat,
          location_lng: incidentData.location.lng,
          location_address: incidentData.location.address,
          notes: incidentData.notes,
          status: incidentData.status,
          anchor_status: incidentData.anchorStatus,
          verification_status: incidentData.verificationStatus || 'pending',
          created_by: user.id,
          reported_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Add files if any
      if (incidentData.files.length > 0) {
        const filesData = incidentData.files.map(file => ({
          incident_id: data.id,
          name: file.name,
          type: file.type,
          size: file.size,
          hash: file.hash,
          preview: file.preview
        }));

        await supabase.from('incident_files').insert(filesData);
      }

      // Reload incidents
      loadIncidents();

      toast({
        title: "Incident Created",
        description: "New incident has been successfully created."
      });
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: "Error Creating Incident",
        description: "Failed to create incident in database.",
        variant: "destructive"
      });
    }
  };

  // Generate a mock transaction hash
  const generateMockTxHash = () => {
    return '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  // Generate evidence hash from incident data
  const generateEvidenceHash = (incident: Incident) => {
    const dataString = JSON.stringify({
      id: incident.id,
      type: incident.type,
      severity: incident.severity,
      notes: incident.notes,
      location: incident.location,
      files: incident.files.map(f => ({ name: f.name, hash: f.hash }))
    });
    // Simple hash simulation (in production, use proper cryptographic hashing)
    return 'sha256:' + Array.from(dataString).reduce((hash, char) => 
      ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff, 0
    ).toString(16);
  };

  const anchorEvidence = async (incident: Incident) => {
    if (!user) return;

    try {
      // Simulate blockchain anchoring delay
      const txId = generateMockTxHash();
      const evidenceHash = generateEvidenceHash(incident);
      
      const updatedIncident: Incident = {
        ...incident,
        anchorStatus: 'anchored',
        chainTxId: txId,
        chainHash: evidenceHash
      };

      await updateIncident(updatedIncident);
      await addAuditLog(updatedIncident, 'Evidence Anchored to Blockchain (Mock)', `TX: ${txId}`);

      toast({
        title: "Evidence Anchored Successfully",
        description: `Evidence successfully anchored on blockchain (simulation). TX: ${txId.slice(0, 10)}...`,
      });
    } catch (error) {
      console.error('Error anchoring evidence:', error);
      toast({
        title: "Anchoring Failed",
        description: "Failed to anchor evidence to blockchain.",
        variant: "destructive"
      });
    }
  };

  const verifyHashIntegrity = async (incident: Incident) => {
    if (!user || !incident.chainHash) return;

    try {
      // Generate current evidence hash
      const currentHash = generateEvidenceHash(incident);
      
      // Simulate 10% chance of hash mismatch
      const isCompromised = Math.random() < 0.1;
      const hashMatches = !isCompromised && currentHash === incident.chainHash;
      
      const verificationStatus = hashMatches ? 'verified' : 'compromised';
      const verificationAt = new Date().toISOString();

      const updatedIncident: Incident = {
        ...incident,
        verificationStatus,
        verificationAt
      };

      await updateIncident(updatedIncident);
      
      const action = hashMatches ? 'Hash Integrity Verified' : 'Hash Integrity Compromised';
      const details = hashMatches 
        ? 'Evidence integrity verified. No tampering detected.'
        : 'Hash mismatch detected. Evidence may have been compromised.';
      
      await addAuditLog(updatedIncident, action, details);

      toast({
        title: hashMatches ? "✅ Integrity Verified" : "⚠️ Integrity Compromised",
        description: details,
        variant: hashMatches ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error verifying hash:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify hash integrity.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [user]);

  return {
    incidents,
    loading,
    loadIncidents,
    updateIncident,
    addAuditLog,
    createIncident,
    anchorEvidence,
    verifyHashIntegrity
  };
};