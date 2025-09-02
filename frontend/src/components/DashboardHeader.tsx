import { Badge } from "@/components/ui/badge";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export const DashboardHeader = ({ onRefresh, isRefreshing, lastUpdated }: DashboardHeaderProps) => {
  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">AaravFx Dashboard</h1>
            <p className="text-muted-foreground">Real-time trading account overview</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-primary/20 text-primary">
            Guest Mode
          </Badge>
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">
              Last updated: {formatLastUpdated(lastUpdated)}
            </div>
          )}
        </div>
        
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="border-primary/20 hover:bg-primary/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};