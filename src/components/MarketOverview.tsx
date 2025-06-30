
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const MarketOverview = () => {
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Market indices 
  const [indices, setIndices] = useState({
    nifty: { value: 22416.28, change: 0.67, isUp: true },
    sensex: { value: 73648.62, change: 0.54, isUp: true },
    bankNifty: { value: 47892.45, change: -0.21, isUp: false },
    niftyIT: { value: 32648.10, change: 1.52, isUp: true },
  });

  // Check if market is open
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Proper IST conversion using UTC offset
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utc + 5.5 * 60 * 60 * 1000);

      // Indian market hours: 9:15 AM to 3:30 PM IST, Monday to Friday
      const isWeekday = istDate.getDay() >= 1 && istDate.getDay() <= 5;
      const istHours = istDate.getHours();
      const istMinutes = istDate.getMinutes();

      const isWithinMarketHours =
        (istHours > 9 || (istHours === 9 && istMinutes >= 15)) &&
        (istHours < 15 || (istHours === 15 && istMinutes <= 30));

      setIsMarketOpen(isWeekday && isWithinMarketHours);
    }, 1000);

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Market Overview</CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
            <Badge variant={isMarketOpen ? "default" : "outline"} className={isMarketOpen ? "bg-green-600" : ""}>
              {isMarketOpen ? "Market Open" : "Market Closed"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-7 w-32 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-sm text-muted-foreground">NIFTY 50</h3>
                <div className="text-xl font-bold">{indices.nifty.value.toLocaleString()}</div>
                <div className={`flex items-center text-sm ${indices.nifty.isUp ? 'text-green-600' : 'text-red-600'}`}>
                  {indices.nifty.isUp ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {indices.nifty.change}%
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-sm text-muted-foreground">SENSEX</h3>
                <div className="text-xl font-bold">{indices.sensex.value.toLocaleString()}</div>
                <div className={`flex items-center text-sm ${indices.sensex.isUp ? 'text-green-600' : 'text-red-600'}`}>
                  {indices.sensex.isUp ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {indices.sensex.change}%
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-sm text-muted-foreground">BANK NIFTY</h3>
                <div className="text-xl font-bold">{indices.bankNifty.value.toLocaleString()}</div>
                <div className={`flex items-center text-sm ${indices.bankNifty.isUp ? 'text-green-600' : 'text-red-600'}`}>
                  {indices.bankNifty.isUp ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {indices.bankNifty.change}%
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-sm text-muted-foreground">NIFTY IT</h3>
                <div className="text-xl font-bold">{indices.niftyIT.value.toLocaleString()}</div>
                <div className={`flex items-center text-sm ${indices.niftyIT.isUp ? 'text-green-600' : 'text-red-600'}`}>
                  {indices.niftyIT.isUp ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {indices.niftyIT.change}%
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
