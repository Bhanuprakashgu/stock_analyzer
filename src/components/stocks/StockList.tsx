
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface StockListProps {
  stocks: Array<{ symbol: string; name: string }>;
  onSelect: (stock: { symbol: string; name: string }) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  totalCount?: number;
}

const StockList = ({ 
  stocks, 
  onSelect, 
  currentPage, 
  totalPages, 
  onPageChange,
  onSearch,
  isSearching = false,
  totalCount = 0
}: StockListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showingCount, setShowingCount] = useState(0);
  
  useEffect(() => {
    setShowingCount(stocks.length);
  }, [stocks]);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };
  
  return (
    <div className="w-full">
      {onSearch && (
        <div className="mb-5">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder="Search stocks by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" type="submit" disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {isSearching ? (
                "Searching..."
              ) : (
                `Showing ${showingCount} of ${totalCount} stocks`
              )}
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {stocks.map((stock) => (
          <Button 
            key={stock.symbol} 
            variant="outline"
            className="justify-start h-auto py-3 text-left"
            onClick={() => onSelect(stock)}
          >
            <div className="flex flex-col items-start">
              <span className="font-bold">{stock.symbol}</span>
              <span className="text-xs text-muted-foreground truncate w-full">{stock.name}</span>
            </div>
          </Button>
        ))}
      </div>
      
      {stocks.length === 0 && !isSearching && (
        <div className="p-8 text-center text-muted-foreground">
          No stocks found matching your search criteria
        </div>
      )}
      
      {isSearching && (
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2">Loading stocks...</p>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1 || isSearching}
            >
              Previous
            </Button>
            
            <div className="flex items-center px-4">
              <span className="text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages || totalPages === 0 || isSearching}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockList;
