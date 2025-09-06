import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { StatusBadge } from "@/components/ui/badge-variant";
import { ArrowLeft, MapPin, Upload, Shield, Hash } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { generateFileHash } from "@/utils/crypto";
import { IncidentType, IncidentFile } from "@/types/incident";
import { useToast } from "@/hooks/use-toast";
import { useIncidents } from "@/hooks/useIncidents";
import { useAuth } from "@/hooks/useAuth";

const ReportIncident = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createIncident } = useIncidents();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    reporterName: "",
    type: "" as IncidentType,
    severity: [5],
    notes: "",
    files: [] as IncidentFile[]
  });
  
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const getSeverityLabel = (value: number) => {
    if (value <= 3) return "Low";
    if (value <= 6) return "Medium";  
    if (value <= 8) return "High";
    return "Critical";
  };

  const getSeverityColor = (value: number) => {
    if (value <= 3) return "low";
    if (value <= 6) return "medium";
    if (value <= 8) return "high";
    return "critical";
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });
      
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      
      toast({
        title: "Location captured",
        description: "Your current location has been recorded.",
      });
    } catch (error) {
      // Fallback to NYC coordinates for demo
      setLocation({ lat: 40.7128, lng: -74.0060 });
      toast({
        title: "Using demo location",
        description: "Using NYC coordinates for demonstration.",
        variant: "destructive"
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: IncidentFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Generate hash
      const hash = await generateFileHash(file);
      
      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      const incidentFile: IncidentFile = {
        id: uuidv4(),
        name: file.name,
        type: file.type,
        size: file.size,
        hash,
        preview
      };
      
      newFiles.push(incidentFile);
    }
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));

    toast({
      title: "Files uploaded",
      description: `${newFiles.length} file(s) processed and hashed.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !location) {
      toast({
        title: "Missing required fields",
        description: "Please select incident type and capture location.",
        variant: "destructive"
      });
      return;
    }

    const incident = {
      reporterName: formData.reporterName || undefined,
      type: formData.type,
      severity: formData.severity[0],
      location: {
        lat: location.lat,
        lng: location.lng,
        address: "Demo Location" // In real app, reverse geocode
      },
      notes: formData.notes,
      files: formData.files,
      status: 'pending' as const,
      anchorStatus: 'not_anchored' as const
    };

    setCurrentIncident(incident);
    setShowPreview(true);
  };

  const finalizeSubmission = async () => {
    if (!currentIncident) return;
    
    setIsSubmitting(true);
    
    try {
      await createIncident(currentIncident);
      
      // Generate a temporary ID for the confirmation page
      const tempId = uuidv4();
      
      navigate('/report-confirmation', {
        state: {
          reportId: tempId,
          reportType: currentIncident.type
        }
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (showPreview && currentIncident) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowPreview(false)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">Review Incident Report</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Incident Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="capitalize">{currentIncident.type}</p>
                </div>
                <div>
                  <Label>Severity</Label>
                  <StatusBadge 
                    status={getSeverityColor(currentIncident.severity!)} 
                    variant="severity"
                  >
                    {getSeverityLabel(currentIncident.severity!)} ({currentIncident.severity})
                  </StatusBadge>
                </div>
              </div>
              
              <div>
                <Label>Location</Label>
                <p className="text-sm text-muted-foreground">
                  {currentIncident.location.lat.toFixed(6)}, {currentIncident.location.lng.toFixed(6)}
                </p>
              </div>
              
              <div>
                <Label>Notes</Label>
                <p className="text-sm">{currentIncident.notes || "No additional notes"}</p>
              </div>
              
              {currentIncident.files.length > 0 && (
                <div>
                  <Label>Evidence Files ({currentIncident.files.length})</Label>
                  <div className="space-y-2 mt-2">
                    {currentIncident.files.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{file.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">{file.hash.slice(0, 16)}...</span>
                          </div>
                        </div>
                        {file.preview && (
                          <img 
                            src={file.preview} 
                            alt="Preview" 
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
              className="flex-1"
            >
              Back to Edit
            </Button>
            <Button 
              onClick={finalizeSubmission}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Report Incident</h1>
            <p className="text-muted-foreground">Provide details for emergency response</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reporterName">Reporter Name (Optional)</Label>
                <Input
                  id="reporterName"
                  value={formData.reporterName}
                  onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
                  placeholder="Your name"
                />
              </div>

              <div>
                <Label htmlFor="type">Incident Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as IncidentType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="assault">Assault</SelectItem>
                    <SelectItem value="medical">Medical Emergency</SelectItem>
                    <SelectItem value="crowd">Crowd Control</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Severity Level: {formData.severity[0]} - {getSeverityLabel(formData.severity[0])}</Label>
                <div className="px-3 py-2">
                  <Slider
                    value={formData.severity}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 - Minor</span>
                  <span>10 - Critical</span>
                </div>
              </div>

              <div>
                <Label>Location *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getLocation}
                    disabled={locationLoading}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    {locationLoading ? "Getting location..." : location ? "Update Location" : "Capture Location"}
                  </Button>
                  {location && (
                    <div className="flex-1 px-3 py-2 bg-muted rounded border text-sm">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe what happened..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Evidence Upload (Images/Videos)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <Label 
                    htmlFor="fileUpload" 
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    Click to upload files or drag and drop
                  </Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Uploaded Files</Label>
                    {formData.files.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 border rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{file.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">{file.hash.slice(0, 24)}...</span>
                          </div>
                        </div>
                        {file.preview && (
                          <img 
                            src={file.preview} 
                            alt="Preview" 
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg">
            Preview Report
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ReportIncident;