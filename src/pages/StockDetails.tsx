
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { fetchStockData, fetchStockDetails, predictStockPrices, formatPrice } from "@/services/stockService";
import StockPriceChart from "@/components/StockPriceChart";
import PredictionChart from "@/components/charts/PredictionChart";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

const StockDetails = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [period, setPeriod] = useState("1y");
  const [predictionDays, setPredictionDays] = useState(30);
  
  // Fetch stock data with React Query
  const { 
    data: stockData, 
    isLoading: isLoadingStockData,
    error: stockDataError
  } = useQuery({
    queryKey: ["stockData", symbol, period],
    queryFn: () => fetchStockData(symbol || ""),
  });
  
  // Fetch stock details
  const { 
    data: stockDetails, 
    isLoading: isLoadingDetails
  } = useQuery({
    queryKey: ["stockDetails", symbol],
    queryFn: () => fetchStockDetails(symbol || ""),
  });
  
  // Generate predictions
  const {
    data: predictions,
    isLoading: isLoadingPredictions
  } = useQuery({
    queryKey: ["predictions", symbol, predictionDays],
    queryFn: () => predictStockPrices(stockData || [], predictionDays),
    enabled: !!stockData && stockData.length > 0,
  });
  
  // Handle errors
  useEffect(() => {
    if (stockDataError) {
      toast({
        title: "Error loading stock data",
        description: "Could not load stock data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [stockDataError]);
  
  // Prepare data for charts
  const actualData = stockData ? stockData.map(day => ({
    date: day.date,
    price: day.close,
  })) : [];
  
  const predictedData = predictions?.predictions || [];
  const futurePredictions = predictions?.futurePredictions || [];
  
  // Get latest price and change
  const latestPrice = stockData && stockData.length > 0 ? stockData[stockData.length - 1].close : null;
  const previousPrice = stockData && stockData.length > 1 ? stockData[stockData.length - 2].close : null;
  const priceChange = latestPrice && previousPrice ? latestPrice - previousPrice : null;
  const percentChange = latestPrice && previousPrice ? (priceChange / previousPrice) * 100 : null;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {isLoadingDetails ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <>
                  {stockDetails?.symbol.replace(".NS", "")}
                  <span className="text-lg font-normal text-muted-foreground">(NSE)</span>
                </>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLoadingDetails ? (
                <Skeleton className="h-4 w-64" />
              ) : (
                stockDetails?.name
              )}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          {isLoadingStockData ? (
            <>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </>
          ) : latestPrice ? (
            <>
              <span className="text-2xl font-bold">{formatPrice(latestPrice)}</span>
              <div className={`flex items-center ${priceChange && priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange && priceChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm">
                  {priceChange ? formatPrice(priceChange) : "--"} ({percentChange ? percentChange.toFixed(2) : "--"}%)
                </span>
              </div>
            </>
          ) : (
            <span className="text-2xl font-bold">Price unavailable</span>
          )}
        </div>
      </div>
      
      <Card className="h-[500px]">
        <CardHeader className="pb-2">
          <CardTitle>Price Chart</CardTitle>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant={period === "1m" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPeriod("1m")}
              >
                1M
              </Button>
              <Button 
                variant={period === "3m" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPeriod("3m")}
              >
                3M
              </Button>
              <Button 
                variant={period === "6m" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPeriod("6m")}
              >
                6M
              </Button>
              <Button 
                variant={period === "1y" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPeriod("1y")}
              >
                1Y
              </Button>
              <Button 
                variant={period === "5y" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPeriod("5y")}
              >
                5Y
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-100px)]">
          <StockPriceChart 
            actualData={actualData}
            predictedData={predictedData}
            symbol={symbol || ""}
            isLoading={isLoadingStockData || isLoadingPredictions}
          />
        </CardContent>
      </Card>
      
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Price Predictions</CardTitle>
          <CardDescription>
            AI-powered price forecasts for the next {predictionDays} days
          </CardDescription>
          <div className="flex gap-2 mt-2">
            <Button 
              variant={predictionDays === 7 ? "default" : "outline"} 
              size="sm"
              onClick={() => setPredictionDays(7)}
            >
              7 Days
            </Button>
            <Button 
              variant={predictionDays === 14 ? "default" : "outline"} 
              size="sm"
              onClick={() => setPredictionDays(14)}
            >
              14 Days
            </Button>
            <Button 
              variant={predictionDays === 30 ? "default" : "outline"} 
              size="sm"
              onClick={() => setPredictionDays(30)}
            >
              30 Days
            </Button>
            <Button 
              variant={predictionDays === 90 ? "default" : "outline"} 
              size="sm"
              onClick={() => setPredictionDays(90)}
            >
              90 Days
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-130px)]">
          <PredictionChart
            predictions={futurePredictions}
            currentPrice={latestPrice || 0}
            isLoading={isLoadingPredictions}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StockDetails;
