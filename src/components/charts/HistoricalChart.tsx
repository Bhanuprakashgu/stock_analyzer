
import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Loader } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HistoricalChartProps {
  actualData: Array<{
    date: string;
    price: number;
  }>;
  predictedData: Array<{
    date: string;
    price: number;
  }>;
  symbol: string;
  isLoading?: boolean;
  onDateRangeChange?: (range: string) => void;
  selectedDateRange?: string;
}

const HistoricalChart = ({ 
  actualData, 
  predictedData, 
  symbol, 
  isLoading = false,
  onDateRangeChange,
  selectedDateRange = "1y"
}: HistoricalChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Format data for chart on component mount or data changes
  useEffect(() => {
    if (isLoading) {
      setDataLoaded(false);
      return;
    }

    if (actualData && actualData.length > 0 && predictedData) {
      // Combine actual and predicted data for the chart
      const processedData = actualData.map(actual => {
        const predicted = predictedData.find(pred => pred.date === actual.date);
        return {
          date: new Date(actual.date).toLocaleDateString(),
          actual: actual.price,
          predicted: predicted?.price || null
        };
      });
      
      setChartData(processedData);
      console.log("Combined data loaded:", processedData.length, "days of data");
      
      // Add a small delay to ensure smooth loading transition
      const timer = setTimeout(() => {
        setDataLoaded(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [actualData, predictedData, isLoading]);

  const chartConfig = {
    actual: {
      label: "Actual Price",
      color: "#0d9488"
    },
    predicted: {
      label: "Predicted Price",
      color: "#9333ea"
    }
  };

  const handleDateRangeChange = (value: string) => {
    if (onDateRangeChange) {
      onDateRangeChange(value);
    }
  };

  // If loading or no data, show loading state
  if (isLoading || !dataLoaded) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <Select 
            value={selectedDateRange} 
            onValueChange={handleDateRangeChange}
            disabled={true}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="2y">2 Years</SelectItem>
              <SelectItem value="5y">5 Years</SelectItem>
              <SelectItem value="max">Max</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm opacity-50">
            Loading chart data...
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p>Loading historical vs predicted data...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no data after loading, show empty state
  if (!chartData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p>No data available for {symbol}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <Select 
          value={selectedDateRange} 
          onValueChange={handleDateRangeChange}
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
            <SelectItem value="2y">2 Years</SelectItem>
            <SelectItem value="5y">5 Years</SelectItem>
            <SelectItem value="max">Max</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-sm">
          <span className="font-medium">{chartData.length}</span> days of data
        </div>
      </div>
      
      <div className="flex-grow">
        <ChartContainer 
          config={chartConfig}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${value.toFixed(2)}`}
                domain={['auto', 'auto']}
                label={{ 
                  value: `Price (₹)`, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                  dy: 90
                }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Price"
                stroke="#0d9488"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted Price"
                stroke="#9333ea"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default HistoricalChart;
