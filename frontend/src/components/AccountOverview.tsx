import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

interface AccountData {
  balance: number;
  equity: number;
  profit: number;
}

interface AccountOverviewProps {
  data: AccountData | null;
  loading: boolean;
}

export const AccountOverview = ({ data, loading }: AccountOverviewProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gradient-card shadow-card animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24 mb-2"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const isProfit = data.profit >= 0;
  const profitPercentage = ((data.profit / data.balance) * 100).toFixed(2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-card shadow-card transition-smooth hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Account Balance
          </CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Available funds
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card transition-smooth hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Equity
          </CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${data.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Balance + unrealized P&L
          </p>
        </CardContent>
      </Card>

      <Card className={`shadow-card transition-smooth hover:shadow-lg ${
        isProfit 
          ? 'bg-gradient-profit shadow-profit' 
          : 'bg-gradient-loss shadow-loss'
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">
            Total P&L
          </CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-white" />
          ) : (
            <TrendingDown className="h-4 w-4 text-white" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {isProfit ? '+' : ''}${data.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-white/70">
            {isProfit ? '+' : ''}{profitPercentage}% of balance
          </p>
        </CardContent>
      </Card>
    </div>
  );
};