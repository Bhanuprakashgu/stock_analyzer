
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice } from "@/services/stockService";

interface StockPriceCardProps {
  stock: {
    symbol: string;
    name: string;
  };
  price?: number;
  priceChange?: number;
  isLoading?: boolean;
}

const StockPriceCard = ({
  stock,
  price,
  priceChange,
  isLoading = false
}: StockPriceCardProps) => {
  return (
    <Link to={`/stock/${stock.symbol}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold">{stock.symbol.replace(".NS", "")}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{stock.name}</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className={`flex items-center ${priceChange && priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange && priceChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {priceChange ? (priceChange / (price || 1) * 100).toFixed(2) : "0.00"}%
                </span>
              </div>
            )}
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-lg font-bold">
                {price ? formatPrice(price) : "₹--"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default StockPriceCard;
