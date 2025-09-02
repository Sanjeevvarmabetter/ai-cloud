import { useState } from 'react';
import { MoreHorizontal, Shield, AlertTriangle, CheckCircle, Eye, Wrench } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

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

interface ResourcesTableProps {
  resources: CloudResource[];
  loading: boolean;
  onResourceSelect: (resource: CloudResource) => void;
  onRemediate: (resourceId: string) => void;
}

export const ResourcesTable = ({ resources, loading, onResourceSelect, onRemediate }: ResourcesTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
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

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'medium':
        return <Shield className="h-3 w-3" />;
      case 'low':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getTypeIcon = (type: string) => {
    // Different icons for different resource types
    switch (type.toLowerCase()) {
      case 's3':
        return '🗂️';
      case 'ec2':
        return '💻';
      case 'iam':
        return '👤';
      case 'rds':
        return '🗄️';
      default:
        return '☁️';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRisk === 'all' || resource.risk_level.toLowerCase() === filterRisk;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Card className="border border-border bg-gradient-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-gradient-card shadow-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cloud Resources ({resources.length})
          </CardTitle>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48"
            />
            <select 
              value={filterRisk} 
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Risks</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Resource</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Region</TableHead>
                <TableHead className="text-muted-foreground">Risk Score</TableHead>
                <TableHead className="text-muted-foreground">Risk Level</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No resources found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredResources.map((resource) => (
                  <TableRow 
                    key={resource.resource_id} 
                    className="border-border hover:bg-muted/5 cursor-pointer transition-colors"
                    onClick={() => onResourceSelect(resource)}
                  >
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(resource.type)}</span>
                        {resource.resource_id}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{resource.type}</TableCell>
                    <TableCell className="text-foreground">{resource.region}</TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          resource.risk_score >= 70 ? 'text-loss' : 
                          resource.risk_score >= 40 ? 'text-neutral' : 'text-profit'
                        }`}>
                          {resource.risk_score.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground text-sm">/ 100</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getRiskBadgeColor(resource.risk_level)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getRiskIcon(resource.risk_level)}
                        {resource.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {resource.public_access && (
                          <Badge variant="destructive" className="text-xs w-fit">Public</Badge>
                        )}
                        {resource.encryption === false && (
                          <Badge variant="outline" className="text-xs w-fit">Unencrypted</Badge>
                        )}
                        {resource.ports && resource.ports.length > 0 && (
                          <Badge variant="secondary" className="text-xs w-fit">
                            {resource.ports.length} Ports
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border border-border">
                          <DropdownMenuLabel className="text-popover-foreground">Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onResourceSelect(resource);
                            }}
                            className="flex items-center gap-2 text-popover-foreground hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemediate(resource.resource_id);
                            }}
                            className="flex items-center gap-2 text-popover-foreground hover:bg-accent"
                            disabled={resource.risk_level === 'Low'}
                          >
                            <Wrench className="h-4 w-4" />
                            Auto Remediate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredResources.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
        )}
      </CardContent>
    </Card>
  );
};