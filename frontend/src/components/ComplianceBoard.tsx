import { CheckCircle, XCircle, AlertTriangle, Award, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

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

interface ComplianceBoardProps {
  resources: CloudResource[];
  loading: boolean;
}

interface ComplianceStandard {
  name: string;
  icon: string;
  description: string;
  score: number;
  requirements: {
    name: string;
    status: 'compliant' | 'non-compliant' | 'warning';
    count: number;
  }[];
}

export const ComplianceBoard = ({ resources, loading }: ComplianceBoardProps) => {
  const calculateCompliance = (): ComplianceStandard[] => {
    if (resources.length === 0) return [];

    const encryptedResources = resources.filter(r => r.encryption !== false).length;
    const publicResources = resources.filter(r => r.public_access === true).length;
    const highRiskResources = resources.filter(r => r.risk_level === 'High').length;
    const s3Resources = resources.filter(r => r.type === 'S3').length;
    const ec2Resources = resources.filter(r => r.type === 'EC2').length;

    return [
      {
        name: 'SOC 2',
        icon: '🔒',
        description: 'Security, Availability, Processing Integrity',
        score: Math.round(((resources.length - highRiskResources) / resources.length) * 100),
        requirements: [
          {
            name: 'Access Controls',
            status: publicResources === 0 ? 'compliant' : 'non-compliant',
            count: resources.length - publicResources
          },
          {
            name: 'Data Encryption',
            status: encryptedResources === resources.length ? 'compliant' : 'warning',
            count: encryptedResources
          },
          {
            name: 'Risk Assessment',
            status: highRiskResources === 0 ? 'compliant' : 'non-compliant',
            count: resources.length - highRiskResources
          }
        ]
      },
      {
        name: 'PCI DSS',
        icon: '💳',
        description: 'Payment Card Industry Data Security',
        score: Math.round(((encryptedResources + (resources.length - publicResources)) / (resources.length * 2)) * 100),
        requirements: [
          {
            name: 'Network Security',
            status: publicResources < resources.length * 0.1 ? 'compliant' : 'warning',
            count: resources.length - publicResources
          },
          {
            name: 'Data Protection',
            status: encryptedResources >= resources.length * 0.8 ? 'compliant' : 'non-compliant',
            count: encryptedResources
          },
          {
            name: 'Access Management',
            status: highRiskResources === 0 ? 'compliant' : 'warning',
            count: resources.length - highRiskResources
          }
        ]
      },
      {
        name: 'GDPR',
        icon: '🇪🇺',
        description: 'General Data Protection Regulation',
        score: Math.round((encryptedResources / resources.length) * 100),
        requirements: [
          {
            name: 'Data Encryption',
            status: encryptedResources === resources.length ? 'compliant' : 'non-compliant',
            count: encryptedResources
          },
          {
            name: 'Data Minimization',
            status: s3Resources <= resources.length * 0.3 ? 'compliant' : 'warning',
            count: s3Resources
          },
          {
            name: 'Security by Design',
            status: highRiskResources === 0 ? 'compliant' : 'non-compliant',
            count: resources.length - highRiskResources
          }
        ]
      },
      {
        name: 'HIPAA',
        icon: '🏥',
        description: 'Health Insurance Portability',
        score: Math.round(((encryptedResources + (resources.length - publicResources)) / (resources.length * 2)) * 100),
        requirements: [
          {
            name: 'Safeguards',
            status: encryptedResources >= resources.length * 0.9 ? 'compliant' : 'non-compliant',
            count: encryptedResources
          },
          {
            name: 'Access Controls',
            status: publicResources === 0 ? 'compliant' : 'non-compliant',
            count: resources.length - publicResources
          },
          {
            name: 'Audit Controls',
            status: highRiskResources < resources.length * 0.1 ? 'compliant' : 'warning',
            count: resources.length - highRiskResources
          }
        ]
      }
    ];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-3 w-3 text-profit" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-neutral" />;
      case 'non-compliant':
        return <XCircle className="h-3 w-3 text-loss" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-neutral" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-profit';
      case 'warning':
        return 'text-neutral';
      case 'non-compliant':
        return 'text-loss';
      default:
        return 'text-neutral';
    }
  };

  if (loading) {
    return (
      <Card className="border border-border bg-gradient-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const complianceStandards = calculateCompliance();

  return (
    <Card className="border border-border bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Award className="h-5 w-5" />
          Compliance Standards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {complianceStandards.map((standard, index) => (
          <div key={standard.name}>
            <div className="space-y-3">
              {/* Standard Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{standard.icon}</span>
                  <div>
                    <h4 className="font-semibold text-foreground">{standard.name}</h4>
                    <p className="text-xs text-muted-foreground">{standard.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    standard.score >= 80 ? 'text-profit' : 
                    standard.score >= 60 ? 'text-neutral' : 'text-loss'
                  }`}>
                    {standard.score}%
                  </div>
                  <div className="text-xs text-muted-foreground">compliance</div>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress 
                value={standard.score} 
                className="h-2"
              />

              {/* Requirements */}
              <div className="space-y-2">
                {standard.requirements.map((req, reqIndex) => (
                  <div key={reqIndex} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(req.status)}
                      <span className="text-foreground">{req.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={getStatusColor(req.status)}>
                        {req.count}/{resources.length}
                      </span>
                      <Badge 
                        variant={req.status === 'compliant' ? 'outline' : req.status === 'warning' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {req.status === 'compliant' ? 'Pass' : req.status === 'warning' ? 'Warning' : 'Fail'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {index < complianceStandards.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}

        {/* Overall Summary */}
        <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-foreground">Overall Compliance</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Average Score</div>
              <div className="font-semibold text-foreground">
                {Math.round(complianceStandards.reduce((acc, s) => acc + s.score, 0) / complianceStandards.length)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Standards Met</div>
              <div className="font-semibold text-foreground">
                {complianceStandards.filter(s => s.score >= 80).length}/{complianceStandards.length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};