
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard as StatCardType } from "@/lib/data-service";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  data: StatCardType;
}

const StatCard = ({ data }: StatCardProps) => {
  const { title, value, change, description } = data;
  const isPositive = change >= 0;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-data-green" />
        ) : (
          <TrendingDown className="h-4 w-4 text-data-red" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={isPositive ? "text-data-green" : "text-data-red"}>
            {isPositive ? "+" : ""}{change}%
          </span>{" "}
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
