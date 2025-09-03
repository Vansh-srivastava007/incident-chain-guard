import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'severity' | 'anchor' | 'mock';
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, variant = 'status', children, className }: StatusBadgeProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'severity':
        switch (status) {
          case 'low': return 'bg-severity-low text-white';
          case 'medium': return 'bg-severity-medium text-white';
          case 'high': return 'bg-severity-high text-white';
          case 'critical': return 'bg-severity-critical text-white';
          default: return 'bg-muted text-muted-foreground';
        }
      case 'anchor':
        switch (status) {
          case 'not_anchored': return 'bg-muted text-muted-foreground';
          case 'anchoring': return 'bg-status-anchoring text-white animate-pulse';
          case 'anchored': return 'bg-status-anchored text-white';
          default: return 'bg-muted text-muted-foreground';
        }
      case 'mock':
        return 'bg-status-mock text-white border border-dashed';
      case 'status':
      default:
        switch (status) {
          case 'pending': return 'bg-status-pending text-white';
          case 'acknowledged': return 'bg-primary text-primary-foreground';
          case 'resolved': return 'bg-success text-white';
          default: return 'bg-muted text-muted-foreground';
        }
    }
  };

  return (
    <Badge className={cn(getVariantClasses(), className)}>
      {children}
    </Badge>
  );
}