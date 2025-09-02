import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CSPMHeader } from '@/components/CSPMHeader';
import { SecurityOverview } from '@/components/SecurityOverview';
import { ResourcesTable } from '@/components/ResourcesTable';
import { ThreatMap } from '@/components/ThreatMap';
import { ComplianceBoard } from '@/components/ComplianceBoard';
import { RemediationPanel } from '@/components/RemediationPanel';

interface CloudResource {
  resource_id: string;
  type: string;
  region: string;
  risk_score: number;
  risk_level: string;
  public_access?: boolean;
  encryption?: boolean;
  ports?: number[];
  size_mb?: number;
  last_accessed?: string;
  compliance_status?: string;
}

interface SecurityMetrics {
  total_resources: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  compliance_score: number;
}

const Index = () => {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const { toast } = useToast();

  const fetchSecurityData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch('http://localhost:8000/resources');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResources(data);
      
      // Calculate metrics
      const totalResources = data.length;
      const highRisk = data.filter((r: CloudResource) => r.risk_level === 'High').length;
      const mediumRisk = data.filter((r: CloudResource) => r.risk_level === 'Medium').length;
      const lowRisk = data.filter((r: CloudResource) => r.risk_level === 'Low').length;
      const complianceScore = Math.round((lowRisk / totalResources) * 100);
      
      setMetrics({
        total_resources: totalResources,
        high_risk: highRisk,
        medium_risk: mediumRisk,
        low_risk: lowRisk,
        compliance_score: complianceScore
      });
      
      setLastUpdated(new Date());
      
      if (showRefreshing) {
        toast({
          title: "Security data refreshed",
          description: "Cloud security posture has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to CSPM server. Please check if the backend is running on port 8000.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemediation = async (resourceId: string) => {
    try {
      const response = await fetch('http://localhost:8000/remediate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resource_id: resourceId }),
      });

      if (!response.ok) {
        throw new Error(`Remediation failed! status: ${response.status}`);
      }

      toast({
        title: "Remediation Successful",
        description: `Security issue for resource ${resourceId} has been resolved.`,
      });

      // Refresh data after remediation
      fetchSecurityData(true);
    } catch (error) {
      console.error('Error during remediation:', error);
      toast({
        title: "Remediation Failed",
        description: error instanceof Error ? error.message : "Failed to remediate security issue.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSecurityData();
    
    // Auto-refresh every 2 minutes for security data
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchSecurityData(true);
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [refreshing]);

  const handleRefresh = () => {
    fetchSecurityData(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <CSPMHeader 
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          lastUpdated={lastUpdated}
        />
        
        <SecurityOverview 
          metrics={metrics}
          loading={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ResourcesTable 
              resources={resources}
              loading={loading}
              onResourceSelect={setSelectedResource}
              onRemediate={handleRemediation}
            />
            
            <ThreatMap 
              resources={resources}
              loading={loading}
            />
          </div>

          <div className="space-y-6">
            <ComplianceBoard 
              resources={resources}
              loading={loading}
            />
            
            <RemediationPanel 
              selectedResource={selectedResource}
              onRemediate={handleRemediation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;