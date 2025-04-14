
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatisticsCardProps {
  title: string;
  stats: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
}

const StatisticsCard = ({ title, stats }: StatisticsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">Minimum</span>
            <span className="text-lg font-semibold">{stats.min.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">Maximum</span>
            <span className="text-lg font-semibold">{stats.max.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">Average</span>
            <span className="text-lg font-semibold">{stats.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">Median</span>
            <span className="text-lg font-semibold">{stats.median.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
