import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, FileText } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface LocationState {
  reportId?: string;
  reportType?: string;
}

const ReportConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;

  useEffect(() => {
    // If no report data, redirect to home
    if (!state?.reportId) {
      toast({
        title: "No report found",
        description: "Redirecting to home page.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [state, navigate, toast]);

  if (!state?.reportId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Confirmation Card */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-600">
              Report Submitted Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-lg font-medium">
                Your report has been submitted. Action will be taken soon.
              </p>
              
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Report ID:</span>
                  <span className="font-mono text-muted-foreground">
                    {state.reportId.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{state.reportType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Status:</span>
                  <span className="text-yellow-600 font-medium">Under Review</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Emergency services have been notified. You will receive updates as your report is processed.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Note */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <p className="text-sm text-center text-muted-foreground">
              <strong>Emergency?</strong> If this is a life-threatening situation, 
              please call emergency services directly at <strong>112</strong> (India) 
              or your local emergency number.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportConfirmation;