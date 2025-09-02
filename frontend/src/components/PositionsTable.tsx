import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface Position {
  symbol: string;
  type: string;
  volume: number;
  open_price: number;
  current_price: number;
  profit: number;
}

interface PositionsTableProps {
  positions: Position[];
  loading: boolean;
}

export const PositionsTable = ({ positions, loading }: PositionsTableProps) => {
  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Open Positions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-12"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: number) => 
    price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  const formatProfit = (profit: number) => {
    const formatted = profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return profit >= 0 ? `+$${formatted}` : `-$${Math.abs(profit).toFixed(2)}`;
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Open Positions</CardTitle>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {positions.length} {positions.length === 1 ? 'Position' : 'Positions'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Open Positions</h3>
            <p className="text-muted-foreground">All positions have been closed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Symbol</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground text-right">Volume</TableHead>
                  <TableHead className="text-muted-foreground text-right">Open Price</TableHead>
                  <TableHead className="text-muted-foreground text-right">Current Price</TableHead>
                  <TableHead className="text-muted-foreground text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position, index) => {
                  const isProfit = position.profit >= 0;
                  const priceChange = position.current_price - position.open_price;
                  const priceChangePercent = ((priceChange / position.open_price) * 100).toFixed(2);
                  
                  return (
                    <TableRow key={index} className="border-border hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium text-foreground">
                        {position.symbol}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={position.type === 'Buy' ? 'default' : 'secondary'}
                          className={position.type === 'Buy' ? 'bg-profit text-profit-foreground' : 'bg-muted text-foreground'}
                        >
                          {position.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        {position.volume.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        {formatPrice(position.open_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-foreground">{formatPrice(position.current_price)}</span>
                          {priceChange !== 0 && (
                            <div className={`flex items-center text-xs ${
                              priceChange >= 0 ? 'text-profit' : 'text-loss'
                            }`}>
                              {priceChange >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{priceChangePercent}%</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-medium flex items-center justify-end space-x-1 ${
                          isProfit ? 'text-profit' : 'text-loss'
                        }`}>
                          {isProfit ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span>{formatProfit(position.profit)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};