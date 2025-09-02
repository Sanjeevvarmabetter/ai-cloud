import { useState } from 'react';
import { Wrench, Play, CheckCircle, AlertTriangle, Clock, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
}

interface RemediationAction {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  automated: boolean;
  estimatedTime: string;
  icon: React.ReactNode;
}

interface RemediationPanelProps {
  selectedResource: CloudResource | null;
  onRemediate: (resourceId: string) => void;
}

export const RemediationPanel = ({ selectedResource, onRemediate }: RemediationPanelProps) => {
  const [activeActions, setActiveActions] = useState<string[]>([]);

  const getRemediationActions = (resource: CloudResource | null): RemediationAction[] => {
    if (!resource) return [];

    const actions: RemediationAction[] = [];

    // Public access remediation
    if (resource.public_access) {
      actions.push({
        id: 'disable-public-access',
        title: 'Disable Public Access',
        description: 'Remove public read/write permissions and restrict access to authorized users only.',
        impact: 'high',
        urgency: 'high',
        automated: true,
        estimatedTime: '2 minutes',
        icon: <EyeOff className="h-4 w-4" />
      });
    }

    // Encryption remediation
    if (resource.encryption === false) {
      actions.push({
        id: 'enable-encryption',
        title: 'Enable Encryption',
        description: 'Implement server-side encryption using AWS KMS or similar service.',
        impact: 'medium',
        urgency: 'high',
        automated: true,
        estimatedTime: '5 minutes',
        icon: <Lock className="h-4 w-4" />
      });
    }

    // Port security
    if (resource.ports && resource.ports.length > 0) {
      const dangerousPorts = resource.ports.filter(port => [22, 3389, 1433, 3306].includes(port));
      if (dangerousPorts.length > 0) {
        actions.push({
          id: 'secure-ports',
          title: 'Secure Network Ports',
          description: `Close or restrict access to ${dangerousPorts.length} potentially dangerous ports.`,
          impact: 'high',
          urgency: 'medium',
          automated: true,
          estimatedTime: '3 minutes',
          icon: <Shield className="h-4 w-4" />
        });
      }
    }

    // High risk general remediation
    if (resource.risk_level === 'High') {
      actions.push({
        id: 'security-audit',
        title: 'Comprehensive Security Audit',
        description: 'Perform detailed security assessment and apply recommended fixes.',
        impact: 'high',
        urgency: 'high',
        automated: false,
        estimatedTime: '15 minutes',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }

    return actions;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-loss';
      case 'medium':
        return 'text-neutral';
      case 'low':
        return 'text-profit';
      default:
        return 'text-muted-foreground';
    }
  };

  const getUrgencyVariant = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const executeAction = async (actionId: string) => {
    if (!selectedResource) return;

    setActiveActions(prev => [...prev, actionId]);
    
    // Simulate action execution
    setTimeout(() => {
      setActiveActions(prev => prev.filter(id => id !== actionId));
      onRemediate(selectedResource.resource_id);
    }, 2000);
  };

  const actions = getRemediationActions(selectedResource);

  return (
    <Card className="border border-border bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Auto-Remediation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedResource ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Select a resource from the table to view available remediation actions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resource Info */}
            <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">{selectedResource.resource_id}</h4>
                <Badge variant={selectedResource.risk_level === 'High' ? 'destructive' : selectedResource.risk_level === 'Medium' ? 'secondary' : 'outline'}>
                  {selectedResource.risk_level} Risk
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-1 text-foreground">{selectedResource.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Region:</span>
                  <span className="ml-1 text-foreground">{selectedResource.region}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Score:</span>
                  <span className={`ml-1 font-semibold ${
                    selectedResource.risk_score >= 70 ? 'text-loss' : 
                    selectedResource.risk_score >= 40 ? 'text-neutral' : 'text-profit'
                  }`}>
                    {selectedResource.risk_score.toFixed(1)}/100
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-1 text-foreground">
                    {selectedResource.public_access ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>

            {actions.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  This resource appears to be secure. No immediate remediation actions are required.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">Available Actions ({actions.length})</h4>
                  <Button
                    onClick={() => onRemediate(selectedResource.resource_id)}
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={activeActions.length > 0}
                  >
                    <Play className="h-3 w-3" />
                    Run All
                  </Button>
                </div>

                <div className="space-y-3">
                  {actions.map((action, index) => (
                    <div key={action.id}>
                      <div className="p-3 border border-border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {action.icon}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-foreground">{action.title}</h5>
                              <p className="text-sm text-muted-foreground mt-1">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={getUrgencyVariant(action.urgency)} className="text-xs">
                            {action.urgency} urgency
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <span className={getImpactColor(action.impact)}>
                              {action.impact} impact
                            </span>
                          </Badge>
                          {action.automated && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Automated
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {action.estimatedTime}
                          </div>
                        </div>

                        {activeActions.includes(action.id) && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                              Executing action...
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                        )}

                        <Button
                          onClick={() => executeAction(action.id)}
                          disabled={activeActions.includes(action.id) || !action.automated}
                          size="sm"
                          variant={action.urgency === 'high' ? 'default' : 'outline'}
                          className="w-full flex items-center gap-2"
                        >
                          {activeActions.includes(action.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                              Executing...
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" />
                              {action.automated ? 'Execute Now' : 'Manual Review Required'}
                            </>
                          )}
                        </Button>
                      </div>
                      {index < actions.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};