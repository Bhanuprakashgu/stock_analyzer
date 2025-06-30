// src/pages/AllStocks.tsx
import { useEffect, useState } from "react";
import { getAllStocks } from "../lib/stock-service";

type Stock = {
  symbol: string;
  name: string;
};

export default function AllStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllStocks().then((data) => {
      setStocks(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Stocks</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="p-4 border rounded-xl shadow hover:shadow-lg transition"
            >
              <p className="text-lg font-semibold">{stock.symbol}</p>
              <p className="text-gray-600">{stock.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
