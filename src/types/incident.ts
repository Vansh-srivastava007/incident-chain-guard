export type IncidentType = 'theft' | 'assault' | 'medical' | 'crowd' | 'other';

export type IncidentStatus = 'pending' | 'acknowledged' | 'resolved';

export type AnchorStatus = 'not_anchored' | 'anchoring' | 'anchored';

export type VerificationStatus = 'pending' | 'verified' | 'compromised';

export interface IncidentLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface IncidentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  hash: string;
  preview?: string; // base64 or blob url
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

export interface Incident {
  id: string;
  reporterName?: string;
  type: IncidentType;
  severity: number; // 1-10
  location: IncidentLocation;
  notes: string;
  files: IncidentFile[];
  status: IncidentStatus;
  anchorStatus: AnchorStatus;
  verificationStatus: VerificationStatus;
  chainTxId?: string;
  chainHash?: string;
  reportedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  verificationAt?: string;
  auditLog: AuditLogEntry[];
}

export interface EmergencyContact {
  type: 'police' | 'hospital' | 'fire';
  number: string;
  name: string;
}