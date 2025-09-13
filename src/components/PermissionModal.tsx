import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Cookie, 
  Camera, 
  Mic, 
  Bell, 
  Phone, 
  HardDrive, 
  Bluetooth,
  Shield,
  X
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigateAfterAllow?: string;
}

export const PermissionModal = ({ isOpen, onClose, navigateAfterAllow }: PermissionModalProps) => {
  const navigate = useNavigate();
  const [showCustomize, setShowCustomize] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'location',
      name: 'Location',
      description: 'Suggest nearby attractions and ensure safety',
      icon: <MapPin className="w-5 h-5" />,
      enabled: true
    },
    {
      id: 'cookies',
      name: 'Cookies & Storage',
      description: 'Save preferences and improve experience',
      icon: <Cookie className="w-5 h-5" />,
      enabled: true
    },
    {
      id: 'camera',
      name: 'Camera',
      description: 'For QR check-ins and photo uploads',
      icon: <Camera className="w-5 h-5" />,
      enabled: true
    },
    {
      id: 'microphone',
      name: 'Microphone',
      description: 'For voice-guided tours',
      icon: <Mic className="w-5 h-5" />,
      enabled: true
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Weather updates and safety alerts',
      icon: <Bell className="w-5 h-5" />,
      enabled: true
    },
    {
      id: 'contact',
      name: 'Contact Info',
      description: 'For emergency communication',
      icon: <Phone className="w-5 h-5" />,
      enabled: true
    },
    {
      id: 'storage',
      name: 'Storage Access',
      description: 'Save maps for offline use',
      icon: <HardDrive className="w-5 h-5" />,
      enabled: true
    },
    {
      id: 'bluetooth',
      name: 'Bluetooth',
      description: 'Detect nearby attractions and offers',
      icon: <Bluetooth className="w-5 h-5" />,
      enabled: true
    }
  ]);

  const togglePermission = (id: string) => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.id === id 
          ? { ...permission, enabled: !permission.enabled }
          : permission
      )
    );
  };

  const handleAllowAll = async () => {
    // Request all permissions in sequence
    const enabledPermissions = permissions.filter(p => p.enabled);
    
    for (const permission of enabledPermissions) {
      try {
        switch (permission.id) {
          case 'location':
            if ('geolocation' in navigator) {
              await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
              });
            }
            break;
          case 'notifications':
            if ('Notification' in window) {
              await Notification.requestPermission();
            }
            break;
          case 'camera':
          case 'microphone':
            if ('mediaDevices' in navigator) {
              const constraints: MediaStreamConstraints = {};
              if (permission.id === 'camera') constraints.video = true;
              if (permission.id === 'microphone') constraints.audio = true;
              const stream = await navigator.mediaDevices.getUserMedia(constraints);
              stream.getTracks().forEach(track => track.stop()); // Stop immediately after permission
            }
            break;
          default:
            // For other permissions, just simulate the request
            await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`Permission denied for ${permission.name}:`, error);
      }
    }
    
    if (navigateAfterAllow) {
      navigate(navigateAfterAllow);
    }
    onClose();
  };

  const handleCustomizeComplete = () => {
    handleAllowAll(); // Apply selected permissions
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">
            {showCustomize ? "Customize Permissions" : "Allow permissions for the best experience"}
          </CardTitle>
          {!showCustomize && (
            <p className="text-sm text-muted-foreground mt-2">
              To provide personalized recommendations and safety alerts, we need the following permissions:
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {!showCustomize ? (
            <>
              {/* Permission List */}
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="text-primary mt-0.5">
                      {permission.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{permission.name}</h4>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleAllowAll}
                  className="flex-1"
                >
                  Allow All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCustomize(true)}
                  className="flex-1"
                >
                  Customize
                </Button>
              </div>

              {/* Privacy Notice */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  You can change these anytime in settings. We respect your privacy.{" "}
                  <button className="text-primary hover:underline">
                    View Privacy Policy
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Customize View */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Choose which permissions to enable:
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCustomize(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-primary mt-0.5">
                        {permission.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{permission.name}</h4>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={permission.enabled}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCustomizeComplete} className="flex-1">
                  Apply Settings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCustomize(false)}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};