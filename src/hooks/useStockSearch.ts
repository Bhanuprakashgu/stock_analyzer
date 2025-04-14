
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchStocks } from "@/services/stockService";
import { toast } from "@/components/ui/use-toast";

export interface StockSearchResult {
  symbol: string;
  name: string;
}

export const useStockSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchStocks(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length === 0) return;

    if (searchResults.length > 0) {
      // Navigate to the first result
      navigate(`/stock/${searchResults[0].symbol}`);
      setSearchQuery("");
    } else if (searchQuery.trim().length >= 2) {
      // Try to navigate directly if it might be a valid symbol
      let symbol = searchQuery.toUpperCase();
      if (!symbol.endsWith(".NS")) {
        symbol = `${symbol}.NS`;
      }
      navigate(`/stock/${symbol}`);
      setSearchQuery("");
    } else {
      toast({
        title: "Search Error",
        description: "Please enter at least 2 characters to search",
        variant: "destructive",
      });
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearchSubmit,
  };
};
