
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, RefreshCw, Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FuturePredictionChartProps {
  predictions: Array<{
    date: string;
    price: number;
    lower: number;
    upper: number;
  }>;
  symbol: string;
  isLoading?: boolean;
}

const FuturePredictionChart = ({ predictions, symbol, isLoading = false }: FuturePredictionChartProps) => {
  // For zooming functionality
  const [left, setLeft] = useState<string | number>('dataMin');
  const [right, setRight] = useState<string | number>('dataMax');
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [isZooming, setIsZooming] = useState(false);
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

  const handleZoomStart = (e: any) => {
    if (!isZooming || !e) return;
    const { activeLabel } = e;
    setRefAreaLeft(activeLabel);
  };

  const handleZoomMove = (e: any) => {
    if (!isZooming || !refAreaLeft || !e) return;
    const { activeLabel } = e;
    setRefAreaRight(activeLabel);
  };

  const handleZoomEnd = () => {
    if (!isZooming || !refAreaLeft || !refAreaRight) {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    // Ensure left is always less than right
    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    // Find indices in data array for zooming
    const leftIndex = chartData.findIndex(d => d.date === refAreaLeft);
    const rightIndex = chartData.findIndex(d => d.date === refAreaRight);
    
    if (leftIndex === -1 || rightIndex === -1) {
      console.log("Could not find indices for zoom", { refAreaLeft, refAreaRight });
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }
    
    const startIndex = Math.min(leftIndex, rightIndex);
    const endIndex = Math.max(leftIndex, rightIndex);

    console.log("Zooming to indices:", { startIndex, endIndex });
    setLeft(startIndex);
    setRight(endIndex);

    setRefAreaLeft('');
    setRefAreaRight('');
    setIsZooming(false);
  };

  const handleResetZoom = () => {
    setLeft('dataMin');
    setRight('dataMax');
  };

  const toggleZoom = () => {
    setIsZooming(!isZooming);
    if (isZooming) {
      setRefAreaLeft('');
      setRefAreaRight('');
    }
  };

  // Add touch/drag to zoom gesture instruction
  const zoomInstructions = (
    <div className="text-xs text-muted-foreground text-center mt-1">
      {isZooming ? "Click and drag to select zoom area" : "Click Zoom button to enable zoom selection"}
    </div>
  );

  // Handle loading state with skeleton
  if (isLoading || !dataLoaded) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex justify-end gap-2 mb-2">
          <Button variant="outline" size="sm" disabled>
            <ZoomIn className="h-4 w-4 mr-1" />
            Zoom
          </Button>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-1">Loading chart data...</div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p>Loading forecast data...</p>
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
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm">
          <span className="font-medium">{chartData.length}</span> days of predictions
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleZoom}
            className={isZooming ? "bg-blue-100" : ""}
          >
            <ZoomIn className="h-4 w-4 mr-1" />
            {isZooming ? "Cancel" : "Zoom"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetZoom}
            disabled={left === 'dataMin' && right === 'dataMax'}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
      {zoomInstructions}
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
              onMouseDown={handleZoomStart}
              onMouseMove={handleZoomMove}
              onMouseUp={handleZoomEnd}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                allowDataOverflow
                domain={[left, right]}
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
                allowDataOverflow
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
              
              {refAreaLeft && refAreaRight && isZooming ? (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default FuturePredictionChart;
