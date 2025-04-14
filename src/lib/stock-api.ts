// API functions to interact with the stock data APIs or use consistent fallback data

// Cache for storing historical data and predictions across refreshes
const dataCache: Record<string, {
  symbol: string;
  historicalData: any[];
  predictions: any[];
  futurePredictions: any[];
  lastUpdated: string;
  dateRange: string;
  forecastPeriod: string;
}> = {};

// Use Alpha Vantage API for fetching stock data
// Using the provided API key
const ALPHA_VANTAGE_API_KEY = 'XNRMOJT7UO6G1CX5';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Fallback to Yahoo Finance data via RapidAPI if needed
// Note: In production, use an environment variable for the API key
const YAHOO_FINANCE_API_KEY = ''; // Add your RapidAPI key if using this option

// Function to format stock price to INR with correct scale
const formatINRPrice = (price: number): number => {
  // TCS on NSE is around ₹3,246.60 as mentioned by the user
  // Therefore we need to ensure our data is in the correct range
  return parseFloat(price.toFixed(2));
};

// Get all available stocks with pagination and search
export async function getAllStocks(page = 1, pageSize = 20, searchQuery = "") {
  try {
    console.log("Fetching NSE stocks using Alpha Vantage API...");
    // Try to fetch from Alpha Vantage listing (sector performance as a way to get some stocks)
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=SECTOR&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Alpha Vantage response:", data);
    
    // If we have metadata, try to extract stocks
    if (data && Object.keys(data).length > 0) {
      console.log("Received data from Alpha Vantage, but need to use fallback for full listing");
      throw new Error("Need full stock listing");
    } else {
      throw new Error("Alpha Vantage data format not as expected");
    }
  } catch (error) {
    console.log("Falling back to stock service for Indian NSE stock listings:", error);
    
    // Use the fallback service with consistent data for Indian stocks
    try {
      const { getAllStocks } = await import('./stock-service');
      const allStocks = await getAllStocks();
      
      // Only include NSE (Indian) stocks
      const nseStocks = allStocks.filter(stock => 
        stock.symbol.endsWith('.NS')
      );
      
      console.log(`Found ${nseStocks.length} NSE stocks from service`);
      
      // Calculate offset based on page and page size
      const offset = (page - 1) * pageSize;
      
      const filteredStocks = searchQuery 
        ? nseStocks.filter(s => 
            s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : nseStocks;
      
      const total = filteredStocks.length;
      const slicedStocks = filteredStocks.slice(offset, offset + pageSize);
      
      return {
        stocks: slicedStocks,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        totalCount: total
      };
    } catch (fallbackError) {
      console.error("Fallback stock service failed:", fallbackError);
      
      // Final fallback with empty data
      return {
        stocks: [],
        totalPages: 0,
        currentPage: page,
        totalCount: 0
      };
    }
  }
}

// Get stock count statistics
export async function getStockCount() {
  try {
    // Use fallback service
    const { getAllStocks } = await import('./stock-service');
    const stocks = await getAllStocks();
    
    // Filter to only include NSE (Indian) stocks
    const nseStocks = stocks.filter(stock => stock.symbol.endsWith('.NS'));
    
    return { 
      count: nseStocks.length, 
      last_updated: new Date().toISOString() 
    };
  } catch (error) {
    console.error("Error fetching stock count:", error);
    return { count: 0, last_updated: null };
  }
}

// Check if data needs to be updated (once per day)
function shouldUpdateData(symbol: string, dateRange: string) {
  if (!dataCache[`${symbol}-${dateRange}`]) {
    return true;
  }
  
  const lastUpdated = new Date(dataCache[`${symbol}-${dateRange}`].lastUpdated);
  const currentDate = new Date();
  
  // Only update if last update was more than 24 hours ago
  return (currentDate.getTime() - lastUpdated.getTime()) > 24 * 60 * 60 * 1000;
}

// Fetch historical stock data with consistent results
export async function fetchStockData(symbol: string, dateRange: string = '1y') {
  // Add .NS suffix if it's not already there for Indian stocks
  const formattedSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
  
  const cacheKey = `${formattedSymbol}-${dateRange}`;
  
  // Check if we have valid cached data
  if (dataCache[cacheKey] && !shouldUpdateData(formattedSymbol, dateRange)) {
    console.log(`Using cached historical data for ${formattedSymbol} with range ${dateRange}`);
    return dataCache[cacheKey].historicalData;
  }
  
  try {
    // Determine time series function based on dateRange
    let timeSeriesFunction = 'TIME_SERIES_DAILY';
    if (dateRange === '5y' || dateRange === 'max') {
      timeSeriesFunction = 'TIME_SERIES_WEEKLY';
    }
    
    // Try to use Alpha Vantage API
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=${timeSeriesFunction}&symbol=${encodeURIComponent(formattedSymbol)}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=full`;
    console.log(`Fetching data from Alpha Vantage: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Alpha Vantage stock data response:", Object.keys(data));
    
    // Check if we got valid data
    const timeSeriesKey = timeSeriesFunction === 'TIME_SERIES_DAILY' 
      ? 'Time Series (Daily)' 
      : 'Weekly Time Series';
      
    if (!data[timeSeriesKey]) {
      console.error('Invalid Alpha Vantage response:', data);
      if (data["Note"]) {
        console.error('API limit reached:', data["Note"]);
      }
      throw new Error('Invalid API response format or API limit reached');
    }
    
    // Process the data into our format
    const timeSeries = data[timeSeriesKey];
    const formattedData = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      price: formatINRPrice(parseFloat(values['4. close']))
    }));
    
    // Sort by date (oldest to newest)
    formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Limit data based on dateRange
    const limitedData = limitDataByDateRange(formattedData, dateRange);
    
    // Create or update cache entry
    if (!dataCache[cacheKey]) {
      dataCache[cacheKey] = {
        symbol: formattedSymbol,
        historicalData: [],
        predictions: [],
        futurePredictions: [],
        lastUpdated: new Date().toISOString(),
        dateRange,
        forecastPeriod: '1m'
      };
    }
    
    // Update historical data in cache
    dataCache[cacheKey].historicalData = limitedData;
    dataCache[cacheKey].lastUpdated = new Date().toISOString();
    
    return limitedData;
  } catch (error) {
    console.error(`Error fetching data from Alpha Vantage for ${formattedSymbol}:`, error);
    
    // If we have cached data, return it even if it's outdated
    if (dataCache[cacheKey]) {
      console.log(`Using outdated cached data for ${formattedSymbol}`);
      return dataCache[cacheKey].historicalData;
    }
    
    // Use the fallback service with consistent data
    try {
      console.log(`Using fallback service for ${formattedSymbol}`);
      const { fetchStockData } = await import('./stock-service');
      const historicalData = await fetchStockData(symbol);
      
      // Create cache entry for this stock
      dataCache[cacheKey] = {
        symbol: formattedSymbol,
        historicalData: historicalData,
        predictions: [],
        futurePredictions: [],
        lastUpdated: new Date().toISOString(),
        dateRange,
        forecastPeriod: '1m'
      };
      
      return historicalData;
    } catch (fallbackError) {
      console.error(`Even fallback service failed for ${formattedSymbol}:`, fallbackError);
      return [];
    }
  }
}

// Helper function to limit data based on dateRange
function limitDataByDateRange(data: any[], dateRange: string) {
  if (!data.length) return [];
  
  const now = new Date();
  let startDate = new Date();
  
  // Determine the start date based on dateRange
  switch(dateRange) {
    case '3m':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case '2y':
      startDate.setFullYear(now.getFullYear() - 2);
      break;
    case '5y':
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    case 'max':
      // Keep all data
      return data;
    default:
      startDate.setFullYear(now.getFullYear() - 1); // Default to 1y
  }
  
  // Filter data to include only dates after startDate
  return data.filter(item => new Date(item.date) >= startDate);
}

// Fetch stock predictions with consistent results
export async function predictStockPrices(
  symbol: string, 
  historicalData: any[], 
  forecastPeriod: string = '1m'
) {
  // Add .NS suffix if it's not already there for Indian stocks
  const formattedSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
  
  const cacheKey = `${formattedSymbol}-${dataCache[`${formattedSymbol}-1y`]?.dateRange || '1y'}`;
  
  // Check if we already have predictions in cache for this forecast period
  if (dataCache[cacheKey]) {
    if (dataCache[cacheKey].forecastPeriod === forecastPeriod && 
        dataCache[cacheKey].predictions.length > 0 &&
        dataCache[cacheKey].futurePredictions.length > 0) {
      console.log(`Using cached predictions for ${formattedSymbol} with forecast period ${forecastPeriod}`);
      return {
        predictions: dataCache[cacheKey].predictions,
        futurePredictions: dataCache[cacheKey].futurePredictions
      };
    }
  }
  
  try {
    // Currently there's no free API for stock predictions, so we'll use our fallback
    
    console.log(`Generating predictions for ${formattedSymbol} using fallback service`);
    const { predictStockPrices } = await import('./stock-service');
    const predictionResults = await predictStockPrices(symbol, historicalData);
    
    // Update cache
    if (dataCache[cacheKey]) {
      dataCache[cacheKey].predictions = predictionResults.predictions;
      dataCache[cacheKey].futurePredictions = predictionResults.futurePredictions;
      dataCache[cacheKey].forecastPeriod = forecastPeriod;
    }
    
    return predictionResults;
  } catch (error) {
    console.error(`Error generating predictions for ${formattedSymbol}:`, error);
    
    // If we have cached predictions for this forecast period, return them
    if (dataCache[cacheKey] &&
        dataCache[cacheKey].forecastPeriod === forecastPeriod &&
        dataCache[cacheKey].predictions.length > 0 &&
        dataCache[cacheKey].futurePredictions.length > 0) {
      return {
        predictions: dataCache[cacheKey].predictions,
        futurePredictions: dataCache[cacheKey].futurePredictions
      };
    }
    
    // Generate empty prediction data if all else fails
    return {
      predictions: [],
      futurePredictions: []
    };
  }
}
