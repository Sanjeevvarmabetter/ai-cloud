import { useState } from 'react';
import { Globe, MapPin, AlertTriangle, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface ThreatMapProps {
  resources: CloudResource[];
  loading: boolean;
}

export const ThreatMap = ({ resources, loading }: ThreatMapProps) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Group resources by region
  const regionData = resources.reduce((acc, resource) => {
    if (!acc[resource.region]) {
      acc[resource.region] = {
        resources: [],
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        totalRisk: 0
      };
    }
    
    acc[resource.region].resources.push(resource);
    acc[resource.region].totalRisk += resource.risk_score;
    
    switch (resource.risk_level) {
      case 'High':
        acc[resource.region].highRisk++;
        break;
      case 'Medium':
        acc[resource.region].mediumRisk++;
        break;
      case 'Low':
        acc[resource.region].lowRisk++;
        break;
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate average risk per region
  Object.keys(regionData).forEach(region => {
    const data = regionData[region];
    data.avgRisk = data.totalRisk / data.resources.length;
  });

  const getRegionRiskColor = (avgRisk: number) => {
    if (avgRisk >= 70) return 'text-loss bg-loss/10 border-loss/20';
    if (avgRisk >= 40) return 'text-neutral bg-neutral/10 border-neutral/20';
    return 'text-profit bg-profit/10 border-profit/20';
  };

  const getRegionFlag = (region: string) => {
    const regionFlags: Record<string, string> = {
      'us-east-1': '🇺🇸',
      'us-west-1': '🇺🇸',
      'us-west-2': '🇺🇸',
      'eu-west-1': '🇪🇺',
      'eu-central-1': '🇪🇺',
      'ap-southeast-1': '🇸🇬',
      'ap-northeast-1': '🇯🇵',
      'ap-south-1': '🇮🇳',
    };
    return regionFlags[region] || '🌐';
  };

  if (loading) {
    return (
      <Card className="border border-border bg-gradient-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Global Threat Landscape
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="regions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="regions">Regional View</TabsTrigger>
            <TabsTrigger value="heatmap">Risk Heatmap</TabsTrigger>
          </TabsList>
          
          <TabsContent value="regions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(regionData).map(([region, data]) => (
                <div
                  key={region}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                    selectedRegion === region 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                      : ''
                  } ${getRegionRiskColor(data.avgRisk)}`}
                  onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getRegionFlag(region)}</span>
                      <span className="font-medium text-sm">{region}</span>
                    </div>
                    <MapPin className="h-4 w-4" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Resources: {data.resources.length}</span>
                      <span>Avg Risk: {data.avgRisk.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {data.highRisk > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {data.highRisk} High
                        </Badge>
                      )}
                      {data.mediumRisk > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {data.mediumRisk} Med
                        </Badge>
                      )}
                      {data.lowRisk > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {data.lowRisk} Low
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedRegion && (
              <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                  <Info className="h-4 w-4" />
                  {selectedRegion} - Detailed Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2 text-foreground">Resource Distribution</h5>
                    <div className="space-y-1 text-sm">
                      {regionData[selectedRegion].resources
                        .reduce((acc: Record<string, number>, r: CloudResource) => {
                          acc[r.type] = (acc[r.type] || 0) + 1;
                          return acc;
                        }, {})
                        && Object.entries(
                          regionData[selectedRegion].resources.reduce(
                            (acc: Record<string, number>, r: CloudResource) => {
                              acc[r.type] = (acc[r.type] || 0) + 1;
                              return acc;
                            }, {}
                          )
                        ).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-muted-foreground">
                            <span>{type}:</span>
                            <span>{String(count)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2 text-foreground">Risk Breakdown</h5>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>High Risk:</span>
                        <span className="text-loss">{regionData[selectedRegion].highRisk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Risk:</span>
                        <span className="text-neutral">{regionData[selectedRegion].mediumRisk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Risk:</span>
                        <span className="text-profit">{regionData[selectedRegion].lowRisk}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="heatmap" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(regionData)
                .sort(([,a], [,b]) => b.avgRisk - a.avgRisk)
                .map(([region, data]) => (
                  <div key={region} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <span className="text-lg">{getRegionFlag(region)}</span>
                      <span className="font-medium text-sm text-foreground">{region}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-6 relative overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            data.avgRisk >= 70 ? 'bg-loss' : 
                            data.avgRisk >= 40 ? 'bg-neutral' : 'bg-profit'
                          }`}
                          style={{ width: `${(data.avgRisk / 100) * 100}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
                          {data.avgRisk.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-medium text-foreground">{data.resources.length}</div>
                      <div className="text-xs text-muted-foreground">resources</div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};