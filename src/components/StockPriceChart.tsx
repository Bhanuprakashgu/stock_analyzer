
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceArea
} from "recharts";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, RefreshCw, Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/services/stockService";

interface StockPriceChartProps {
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
}

const StockPriceChart = ({ 
  actualData, 
  predictedData, 
  symbol, 
  isLoading = false 
}: StockPriceChartProps) => {
  // For zooming functionality
  const [left, setLeft] = useState<string | number>('dataMin');
  const [right, setRight] = useState<string | number>('dataMax');
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [isZooming, setIsZooming] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [combinedData, setCombinedData] = useState<any[]>([]);

  // Handle data loading and processing
  useEffect(() => {
    if (isLoading) {
      setDataLoaded(false);
      return;
    }

    if (actualData && actualData.length > 0) {
      // Combine actual and predicted data for the chart
      const processedData = actualData.map(actual => {
        const predicted = predictedData.find(pred => pred.date === actual.date);
        return {
          date: new Date(actual.date).toLocaleDateString(),
          actual: actual.price,
          predicted: predicted?.price || null
        };
      });
      
      setCombinedData(processedData);
      
      console.log("Combined data loaded:", processedData.length, "days of data");
      console.log("Prediction data available:", predictedData.length, "days");
      
      // Add a small delay to ensure smooth loading transition
      const timer = setTimeout(() => {
        setDataLoaded(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [actualData, predictedData, isLoading]);

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
    const leftIndex = combinedData.findIndex(d => d.date === refAreaLeft);
    const rightIndex = combinedData.findIndex(d => d.date === refAreaRight);
    
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

  // Custom tooltip formatter
  const customTooltipFormatter = (value: any, name: string) => {
    if (name === "actual") {
      return [formatPrice(value), "Actual Price"];
    } else if (name === "predicted") {
      return [formatPrice(value), "Predicted Price"];
    }
    return [value, name];
  };

  // If loading or no data, show loading state
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
            <p>Loading historical vs predicted data...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no data after loading, show empty state
  if (!combinedData.length) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p>No data available for {symbol}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm">
          <span className="font-medium">{combinedData.length}</span> days of data
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedData}
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
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
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
            <Tooltip 
              formatter={customTooltipFormatter}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "6px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "1px solid #e2e8f0"
              }}
            />
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
      </div>
    </div>
  );
};

export default StockPriceChart;
