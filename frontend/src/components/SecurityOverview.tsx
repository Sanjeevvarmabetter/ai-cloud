import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface SecurityMetrics {
  total_resources: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  compliance_score: number;
}

interface SecurityOverviewProps {
  metrics: SecurityMetrics | null;
  loading: boolean;
}

export const SecurityOverview = ({ metrics, loading }: SecurityOverviewProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-border bg-gradient-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const riskPercentage = ((metrics.high_risk + metrics.medium_risk) / metrics.total_resources) * 100;
  const securityScore = 100 - riskPercentage;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Resources */}
      <Card className="border border-border bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Total Resources</CardTitle>
          <Shield className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metrics.total_resources}</div>
          <p className="text-xs text-muted-foreground">
            Cloud assets monitored
          </p>
          <Progress value={100} className="mt-2" />
        </CardContent>
      </Card>

      {/* High Risk Resources */}
      <Card className="border border-border bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Critical Risks</CardTitle>
          <XCircle className="h-4 w-4 text-loss" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-loss">{metrics.high_risk}</div>
          <p className="text-xs text-muted-foreground">
            Require immediate attention
          </p>
          <Progress 
            value={(metrics.high_risk / metrics.total_resources) * 100} 
            className="mt-2"
            // Use loss color for high risk
          />
        </CardContent>
      </Card>

      {/* Security Score */}
      <Card className="border border-border bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Security Score</CardTitle>
          {securityScore >= 80 ? (
            <TrendingUp className="h-4 w-4 text-profit" />
          ) : (
            <TrendingDown className="h-4 w-4 text-loss" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${securityScore >= 80 ? 'text-profit' : securityScore >= 60 ? 'text-neutral' : 'text-loss'}`}>
            {Math.round(securityScore)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Overall security posture
          </p>
          <Progress value={securityScore} className="mt-2" />
        </CardContent>
      </Card>

      {/* Compliance Score */}
      <Card className="border border-border bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Compliance</CardTitle>
          {metrics.compliance_score >= 80 ? (
            <CheckCircle className="h-4 w-4 text-profit" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-loss" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.compliance_score >= 80 ? 'text-profit' : metrics.compliance_score >= 60 ? 'text-neutral' : 'text-loss'}`}>
            {metrics.compliance_score}%
          </div>
          <p className="text-xs text-muted-foreground">
            Standards compliance
          </p>
          <Progress value={metrics.compliance_score} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};