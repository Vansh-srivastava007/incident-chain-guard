import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useIncidents } from '@/hooks/useIncidents';
import { User, LogOut, FileText, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const UserProfileButton = () => {
  const { user, signOut } = useAuth();
  const { incidents } = useIncidents();
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of the system.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const userInitials = user.email?.slice(0, 2).toUpperCase() || 'U';
  const userIncidents = incidents || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-12 w-12 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 bg-popover" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.display_name || user.user_metadata?.full_name || 'Operator'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile & Records</span>
            </DropdownMenuItem>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {user.user_metadata?.display_name || user.user_metadata?.full_name || 'Operator'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* User Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">User ID:</span>
                      <p className="font-mono text-xs break-all">{user.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Account Created:</span>
                      <p>{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Last Sign In:</span>
                      <p>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Role:</span>
                      <Badge variant="secondary">Operator</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Incident Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Records ({userIncidents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userIncidents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No incident records found. Records will appear here as you interact with the system.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {userIncidents.slice(0, 10).map((incident) => (
                        <div key={incident.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium capitalize text-sm">{incident.type}</h4>
                            <Badge 
                              variant={incident.severity <= 3 ? "secondary" : 
                                      incident.severity <= 6 ? "default" : "destructive"}
                            >
                              Severity {incident.severity}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(incident.reportedAt).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {incident.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {incident.anchorStatus === 'not_anchored' ? 'Not Anchored' : 
                               incident.anchorStatus === 'anchoring' ? 'Anchoring...' : 'Anchored'}
                            </Badge>
                          </div>
                          
                          {incident.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {incident.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};