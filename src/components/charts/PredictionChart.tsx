
import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Loader } from "lucide-react";
import { formatPrice } from "@/services/stockService";

interface PredictionChartProps {
  predictions: Array<{
    date: string;
    price: number;
    lower: number;
    upper: number;
  }>;
  currentPrice?: number;
  isLoading?: boolean;
}

const PredictionChart = ({ 
  predictions, 
  currentPrice = 0,
  isLoading = false
}: PredictionChartProps) => {
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
      console.log("Prediction data loaded:", formattedData.length, "days of predictions");
      
      // Add a small delay to ensure smooth loading transition
      const timer = setTimeout(() => {
        setDataLoaded(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      console.log("No prediction data available");
    }
  }, [predictions, isLoading]);

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

  // Handle loading state with skeleton
  if (isLoading || !dataLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p>Loading prediction data...</p>
        </div>
      </div>
    );
  }

  // Handle empty chart data
  if (!chartData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p>No prediction data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
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
              {currentPrice > 0 && (
                <ReferenceLine 
                  y={currentPrice} 
                  label="Current Price" 
                  stroke="#888888" 
                  strokeDasharray="3 3"
                />
              )}
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
      
      {/* Summary section */}
      <div className="flex justify-between items-center mt-4 pt-2 border-t">
        <div>
          <div className="text-sm text-muted-foreground">Start Price</div>
          <div className="font-bold">{formatPrice(currentPrice || 0)}</div>
        </div>
        
        <div className="border-t-2 border-dashed flex-1 mx-4 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-900 px-2">
            <span className={`text-sm ${chartData.length && chartData[chartData.length - 1].price > (currentPrice || 0) ? 'text-green-600' : 'text-red-600'}`}>
              {currentPrice && chartData.length ? (((chartData[chartData.length - 1].price / currentPrice) - 1) * 100).toFixed(2) : '0'}%
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground">End Prediction</div>
          <div className="font-bold">
            {chartData.length ? formatPrice(chartData[chartData.length - 1].price) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
