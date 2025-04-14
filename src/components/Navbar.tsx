
import { Link } from "react-router-dom";
import { TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStockSearch } from "@/hooks/useStockSearch";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const { searchQuery, setSearchQuery, searchResults, isSearching, handleSearchSubmit } = useStockSearch();

  return (
    <nav className="border-b dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary h-6 w-6" />
          <Link to="/" className="font-bold text-xl">StockTracker</Link>
        </div>
        
        <div className="hidden md:flex w-full max-w-sm items-center space-x-2 mx-4">
          <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search stocks (e.g., TCS, RELIANCE)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-900 shadow-lg rounded-md border dark:border-slate-800 z-50">
                  <ul className="py-1">
                    {searchResults.map((stock) => (
                      <li key={stock.symbol}>
                        <Link
                          to={`/stock/${stock.symbol}`}
                          className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => setSearchQuery("")}
                        >
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{stock.name}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Popular Stocks</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[400px] gap-3 p-4 grid-cols-2">
                  {[
                    { symbol: "TCS.NS", name: "Tata Consultancy Services" },
                    { symbol: "RELIANCE.NS", name: "Reliance Industries" },
                    { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
                    { symbol: "INFY.NS", name: "Infosys" },
                  ].map((stock) => (
                    <Link
                      key={stock.symbol}
                      to={`/stock/${stock.symbol}`}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                    >
                      <div className="text-sm font-medium leading-none">{stock.symbol.replace(".NS", "")}</div>
                      <p className="line-clamp-2 text-xs leading-snug text-slate-500 dark:text-slate-400">
                        {stock.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
};

export default Navbar;
