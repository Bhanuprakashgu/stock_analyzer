
import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Loader } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ForecastChartProps {
  predictions: Array<{
    date: string;
    price: number;
    lower: number;
    upper: number;
  }>;
  symbol: string;
  isLoading?: boolean;
  onForecastPeriodChange?: (period: string) => void;
  selectedForecastPeriod?: string;
}

const ForecastChart = ({ 
  predictions, 
  symbol, 
  isLoading = false,
  onForecastPeriodChange,
  selectedForecastPeriod = "1m"
}: ForecastChartProps) => {
  // Chart states
  const [chartData, setChartData] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Format data for chart on component mount or predictions change
  useEffect(() => {
    if (isLoading) {
      setDataLoaded(false);
      return;
    }

    if (predictions && predictions.length > 0) {
      const formattedData = predictions.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        price: item.price,
        lower: item.lower,
        upper: item.upper
      }));
      
      setChartData(formattedData);
      console.log("Future prediction data loaded:", formattedData.length, "days of predictions");
      
      // Add a small delay to ensure smooth loading transition
      const timer = setTimeout(() => {
        setDataLoaded(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      console.log("No prediction data available");
    }
  }, [predictions, isLoading]);

  // Calculate starting price for reference line
  const startingPrice = chartData.length > 0 ? chartData[0]?.price || 0 : 0;

  const chartConfig = {
    price: {
      label: "Predicted Price",
      color: "#8b5cf6"
    },
    lower: {
      label: "Lower Bound",
      color: "#f97316"
    },
    upper: {
      label: "Upper Bound",
      color: "#0ea5e9"
    }
  };

  const handleForecastPeriodChange = (value: string) => {
    if (onForecastPeriodChange) {
      onForecastPeriodChange(value);
    }
  };

  // Handle loading state with skeleton
  if (isLoading || !dataLoaded) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <Select 
            value={selectedForecastPeriod} 
            onValueChange={handleForecastPeriodChange}
            disabled={true}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Forecast" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm opacity-50">
            Loading forecast data...
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p>Loading price forecast data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty chart data
  if (!chartData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p>No forecast data available for {symbol}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <Select 
          value={selectedForecastPeriod} 
          onValueChange={handleForecastPeriodChange}
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Forecast" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-sm">
          <span className="font-medium">{chartData.length}</span> days forecasted
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
              <ReferenceLine 
                y={startingPrice} 
                label="Starting Price" 
                stroke="#888888" 
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="price"
                name="Predicted Price"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="lower"
                name="Lower Bound (95% CI)"
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="upper"
                name="Upper Bound (95% CI)"
                stroke="#0ea5e9"
                strokeWidth={1.5}
                strokeDasharray="3 3"
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

export default ForecastChart;
