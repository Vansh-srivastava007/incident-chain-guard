import { Incident } from '@/types/incident';

const STORAGE_KEY = 'tourist_incidents';

export class IncidentStore {
  private static instance: IncidentStore;
  
  static getInstance(): IncidentStore {
    if (!IncidentStore.instance) {
      IncidentStore.instance = new IncidentStore();
    }
    return IncidentStore.instance;
  }

  getAllIncidents(): Incident[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultIncidents();
    } catch (error) {
      console.error('Error loading incidents:', error);
      return this.getDefaultIncidents();
    }
  }

  saveIncident(incident: Incident): void {
    const incidents = this.getAllIncidents();
    const existingIndex = incidents.findIndex(i => i.id === incident.id);
    
    if (existingIndex >= 0) {
      incidents[existingIndex] = incident;
    } else {
      incidents.unshift(incident); // Add to beginning
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
  }

  getIncidentById(id: string): Incident | undefined {
    return this.getAllIncidents().find(incident => incident.id === id);
  }

  private getDefaultIncidents(): Incident[] {
    const now = new Date();
    return [
      {
        id: 'demo-001',
        reporterName: 'Sarah Johnson',
        type: 'theft',
        severity: 7,
        location: { lat: 40.7128, lng: -74.0060, address: 'Times Square, NYC' },
        notes: 'Phone stolen while taking photos. Suspect fled towards subway entrance.',
        files: [],
        status: 'acknowledged',
        anchorStatus: 'anchored',
        chainTxId: '0xdeadbeef123456789abcdef',
        chainHash: 'a1b2c3d4e5f6...',
        reportedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        auditLog: [
          {
            id: 'audit-001',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            action: 'Incident Reported',
            user: 'System'
          },
          {
            id: 'audit-002',
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
            action: 'Evidence Anchored to Blockchain',
            user: 'System',
            details: 'TX: 0xdeadbeef123456789abcdef'
          }
        ]
      },
      {
        id: 'demo-002',
        type: 'medical',
        severity: 9,
        location: { lat: 40.7589, lng: -73.9851, address: 'Central Park, NYC' },
        notes: 'Tourist collapsed during jogging. Appears to be heat exhaustion.',
        files: [],
        status: 'pending',
        anchorStatus: 'not_anchored',
        reportedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        auditLog: [
          {
            id: 'audit-003',
            timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
            action: 'Incident Reported',
            user: 'Anonymous Reporter'
          }
        ]
      }
    ];
  }
}