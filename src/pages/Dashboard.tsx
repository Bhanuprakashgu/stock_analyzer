
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { INDIAN_STOCKS, fetchStockData, formatPrice } from "@/services/stockService";
import StockPriceCard from "@/components/StockPriceCard";
import MarketOverview from "@/components/MarketOverview";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState(INDIAN_STOCKS.slice(0, 8));
  const [stockPrices, setStockPrices] = useState<Record<string, { price: number, change: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Load stock prices for popular stocks
  useEffect(() => {
    const loadTopStocks = async () => {
      setIsLoading(true);
      
      // Get the top 8 stocks to display
      const topStocks = INDIAN_STOCKS.slice(0, 8);
      
      // Create a new object to store prices
      const prices: Record<string, { price: number, change: number }> = {};
      
      // Load prices for each stock
      for (const stock of topStocks) {
        try {
          const data = await fetchStockData(stock.symbol);
          
          if (data && data.length > 1) {
            const lastPrice = data[data.length - 1].close;
            const prevPrice = data[data.length - 2].close;
            const priceChange = lastPrice - prevPrice;
            
            prices[stock.symbol] = {
              price: lastPrice,
              change: priceChange
            };
          }
        } catch (error) {
          console.error(`Error loading price for ${stock.symbol}:`, error);
        }
      }
      
      setStockPrices(prices);
      setIsLoading(false);
    };
    
    loadTopStocks();
  }, []);

  // Filter stocks based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      // Show default stocks if no search
      setFilteredStocks(INDIAN_STOCKS.slice(0, 8));
    } else {
      // Filter based on query
      const filtered = INDIAN_STOCKS.filter(
        stock =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);
      
      setFilteredStocks(filtered);
    }
  }, [searchQuery]);

  // Handle category filtering
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Filter stocks based on the selected category
    let filtered;
    
    if (value === "all") {
      filtered = INDIAN_STOCKS;
    } else if (value === "it") {
      filtered = INDIAN_STOCKS.filter(stock => 
        stock.name.toLowerCase().includes("tech") || 
        stock.symbol.includes("TCS") || 
        stock.symbol.includes("INFY") || 
        stock.symbol.includes("WIPRO") ||
        stock.symbol.includes("HCLTECH")
      );
    } else if (value === "banking") {
      filtered = INDIAN_STOCKS.filter(stock => 
        stock.name.toLowerCase().includes("bank") || 
        stock.symbol.includes("HDFC") || 
        stock.symbol.includes("ICICI") || 
        stock.symbol.includes("SBI") || 
        stock.symbol.includes("KOTAKBANK")
      );
    } else if (value === "energy") {
      filtered = INDIAN_STOCKS.filter(stock => 
        stock.name.toLowerCase().includes("oil") || 
        stock.name.toLowerCase().includes("energy") || 
        stock.name.toLowerCase().includes("power") || 
        stock.symbol.includes("RELIANCE") || 
        stock.symbol.includes("ONGC") || 
        stock.symbol.includes("POWERGRID")
      );
    }
    
    setFilteredStocks(filtered?.slice(0, 8) || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Indian Stock Market Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze NSE listed stocks with real-time data
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64"
          />
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
      
      <MarketOverview />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Stocks</TabsTrigger>
            <TabsTrigger value="it">IT</TabsTrigger>
            <TabsTrigger value="banking">Banking</TabsTrigger>
            <TabsTrigger value="energy">Energy</TabsTrigger>
          </TabsList>
          
          <Link to="/stocks" className="text-sm text-primary flex items-center">
            View All Stocks <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStocks.map((stock) => (
              <StockPriceCard
                key={stock.symbol}
                stock={stock}
                price={stockPrices[stock.symbol]?.price}
                priceChange={stockPrices[stock.symbol]?.change}
                isLoading={isLoading}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="it" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStocks.map((stock) => (
              <StockPriceCard
                key={stock.symbol}
                stock={stock}
                price={stockPrices[stock.symbol]?.price}
                priceChange={stockPrices[stock.symbol]?.change}
                isLoading={isLoading}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="banking" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStocks.map((stock) => (
              <StockPriceCard
                key={stock.symbol}
                stock={stock}
                price={stockPrices[stock.symbol]?.price}
                priceChange={stockPrices[stock.symbol]?.change}
                isLoading={isLoading}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="energy" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStocks.map((stock) => (
              <StockPriceCard
                key={stock.symbol}
                stock={stock}
                price={stockPrices[stock.symbol]?.price}
                priceChange={stockPrices[stock.symbol]?.change}
                isLoading={isLoading}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>
            Real-time analysis and predictions for Indian stock market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Top Performers</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                IT sector leading gains with TCS and Infosys showing strong momentum
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <h3 className="font-medium">Underperformers</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Banking sector faces pressure with regulatory changes affecting profitability
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Market Outlook</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Positive outlook for Indian market with strong domestic growth and favorable policies
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
