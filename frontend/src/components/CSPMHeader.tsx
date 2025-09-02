import { Shield, RefreshCw, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CSPMHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export const CSPMHeader = ({ onRefresh, isRefreshing, lastUpdated }: CSPMHeaderProps) => {
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString();
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-card rounded-lg border border-border shadow-card">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cloud Security Posture</h1>
            <p className="text-muted-foreground">AI-Driven CSPM Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Live Monitoring
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Real-time Alerts
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last updated</p>
          <p className="text-sm font-medium text-foreground">
            {formatLastUpdated(lastUpdated)}
          </p>
        </div>
        
        <Button 
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Scanning...' : 'Refresh'}
        </Button>
      </div>
    </header>
  );
};