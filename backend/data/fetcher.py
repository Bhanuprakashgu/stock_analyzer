
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import os
import json
import numpy as np

class StockDataFetcher:
    def __init__(self, cache_dir='data/cache', currency='INR'):
        """
        Initialize the StockDataFetcher with caching support and currency conversion
        
        Args:
            cache_dir: Directory to store cached data
            currency: Currency to convert prices to (default: 'INR')
        """
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        self.currency = currency
        
        # USD to INR conversion rate (updated periodically)
        self.usd_to_inr = 82.5
        
        # Initialize with basic symbols, but will dynamically update
        self.popular_symbols = [
            # Indian Stocks (initial set)
            'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
            'ICICIBANK.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
            # US Stocks (initial set)
            'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META'
        ]
        
        # Create stock list cache file
        self.stocks_cache_file = os.path.join(cache_dir, 'all_stocks.json')
        self._load_or_fetch_all_symbols()
    
    def _load_or_fetch_all_symbols(self):
        """Load stock symbols from cache or fetch if needed"""
        if os.path.exists(self.stocks_cache_file):
            # Check if cache is less than 24 hours old
            file_time = os.path.getmtime(self.stocks_cache_file)
            if (datetime.now() - datetime.fromtimestamp(file_time)).total_seconds() < 86400:  # 24 hours
                try:
                    with open(self.stocks_cache_file, 'r') as f:
                        stocks_data = json.load(f)
                        self.all_symbols = stocks_data.get('symbols', [])
                        self.last_update = stocks_data.get('last_update', datetime.now().isoformat())
                        print(f"Loaded {len(self.all_symbols)} symbols from cache")
                        return
                except Exception as e:
                    print(f"Error loading stocks from cache: {e}")
        
        # If cache doesn't exist or is old, fetch and update
        self.update_all_symbols()
    
    def update_all_symbols(self):
        """Update the list of all available stock symbols"""
        try:
            # Fetch Indian stocks (Nifty 500)
            nifty500 = self._fetch_nifty500_symbols()
            
            # Fetch US stocks (S&P 500)
            sp500 = self._fetch_sp500_symbols()
            
            # Combine all symbols
            self.all_symbols = list(set(nifty500 + sp500 + self.popular_symbols))
            
            # Save to cache
            stocks_data = {
                'symbols': self.all_symbols,
                'last_update': datetime.now().isoformat(),
                'count': len(self.all_symbols)
            }
            
            os.makedirs(os.path.dirname(self.stocks_cache_file), exist_ok=True)
            with open(self.stocks_cache_file, 'w') as f:
                json.dump(stocks_data, f)
            
            print(f"Updated and cached {len(self.all_symbols)} stock symbols")
        except Exception as e:
            print(f"Error updating stock symbols: {e}")
            # If failed, ensure we have at least the popular symbols
            self.all_symbols = self.popular_symbols.copy()
    
    def _fetch_nifty500_symbols(self):
        """Fetch Nifty 500 stock symbols"""
        try:
            # In production, you would scrape or use an API to get these
            # For demonstration, we'll return a set of common Indian stocks
            nifty_symbols = [
                'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
                'ICICIBANK.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
                'ITC.NS', 'LT.NS', 'HCLTECH.NS', 'ASIANPAINT.NS', 'AXISBANK.NS',
                'MARUTI.NS', 'SUNPHARMA.NS', 'TATAMOTORS.NS', 'TITAN.NS', 'BAJAJFINSV.NS',
                'WIPRO.NS', 'ADANIENT.NS', 'NTPC.NS', 'POWERGRID.NS', 'ULTRACEMCO.NS',
                'ADANIPORTS.NS', 'JSWSTEEL.NS', 'TECHM.NS', 'GRASIM.NS', 'ONGC.NS',
                'TATASTEEL.NS', 'APOLLOHOSP.NS', 'NESTLEIND.NS', 'DIVISLAB.NS', 'COALINDIA.NS',
                'HINDALCO.NS', 'BAJAJ-AUTO.NS', 'TATACONSUM.NS', 'UPL.NS', 'INDUSINDBK.NS',
                'CIPLA.NS', 'DRREDDY.NS', 'M&M.NS', 'EICHERMOT.NS', 'HEROMOTOCO.NS',
                'BRITANNIA.NS', 'VEDL.NS', 'GODREJCP.NS', 'DLF.NS', 'DABUR.NS',
                'PNB.NS', 'BANKBARODA.NS', 'INDIGO.NS', 'ZOMATO.NS', 'PAYTM.NS'
            ]
            
            # In a real implementation, fetch all Nifty 500 stocks
            # For example, scrape from NSE website or use a financial data API
            return nifty_symbols
        except Exception as e:
            print(f"Error fetching Nifty 500 symbols: {e}")
            return []
    
    def _fetch_sp500_symbols(self):
        """Fetch S&P 500 stock symbols"""
        try:
            # In production, you would use an API like yfinance to get the full S&P 500 list
            # For demonstration, we'll return a set of common US stocks
            sp500_symbols = [
                'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 
                'TSLA', 'NVDA', 'JPM', 'JNJ', 'V', 'PG',
                'UNH', 'HD', 'BAC', 'XOM', 'ADBE', 'NFLX',
                'DIS', 'CSCO', 'PFE', 'CRM', 'INTC', 'VZ',
                'PYPL', 'BABA', 'ADBE', 'CRM', 'CSCO', 'PFE',
                'JNJ', 'PG', 'XOM', 'CVX', 'HD', 'BA',
                'MCD', 'SBUX', 'NKE', 'GS', 'QCOM', 'IBM',
                'ORCL', 'TOYOTA', 'SONY', 'HSBC', 'BP'
            ]
            
            # In a real implementation, fetch all S&P 500 stocks
            # For example using pandas_datareader or yfinance
            return sp500_symbols
        except Exception as e:
            print(f"Error fetching S&P 500 symbols: {e}")
            return []
    
    def get_available_symbols(self):
        """Return list of all supported stock symbols"""
        return self.all_symbols
    
    def get_popular_symbols(self, limit=50):
        """Return list of popular stock symbols"""
        # Prioritize certain well-known stocks, then add others to reach the limit
        popular = self.popular_symbols.copy()
        
        # If we need more symbols to reach the limit, add from all_symbols
        if len(popular) < limit and hasattr(self, 'all_symbols'):
            remaining = limit - len(popular)
            for symbol in self.all_symbols:
                if symbol not in popular:
                    popular.append(symbol)
                    remaining -= 1
                    if remaining <= 0:
                        break
        
        return popular[:limit]
    
    def _convert_to_inr(self, data_frame):
        """Convert USD prices to INR"""
        if self.currency == 'INR':
            # Create a copy to avoid modifying the original
            df = data_frame.copy()
            
            # Convert price columns to INR
            for col in ['Open', 'High', 'Low', 'Close', 'Adj Close']:
                if col in df.columns:
                    df[col] = df[col] * self.usd_to_inr
            
            return df
        else:
            return data_frame
    
    def fetch_stock_data(self, symbol, period='5y', years=5, use_cache=True, force_refresh=False):
        """
        Fetch historical stock data from Yahoo Finance or cache with INR conversion
        
        Args:
            symbol: Stock symbol (e.g., 'RELIANCE.NS', 'AAPL')
            period: Time period to fetch (default: '5y' for 5 years)
            years: Alternative way to specify the period in years
            use_cache: Whether to use cached data if available
            force_refresh: Whether to force a refresh of the data
            
        Returns:
            Pandas DataFrame with historical stock data in specified currency
        """
        # If years is provided, convert to period string
        if years:
            period = f"{years}y"
            
        cache_file = os.path.join(self.cache_dir, f"{symbol}_{period}_{self.currency}.csv")
        
        # Check if we should use cached data
        if use_cache and os.path.exists(cache_file) and not force_refresh:
            # Check if cache is less than 24 hours old
            file_time = os.path.getmtime(cache_file)
            if (datetime.now() - datetime.fromtimestamp(file_time)).total_seconds() < 86400:  # 24 hours
                df = pd.read_csv(cache_file, parse_dates=['Date'])
                df.set_index('Date', inplace=True)
                return df
        
        # Fetch new data from Yahoo Finance
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            data = data.reset_index()  # Reset index to have Date as a column
            
            # Apply currency conversion if needed
            if not symbol.endswith('.NS'):  # US stocks need conversion
                for col in ['Open', 'High', 'Low', 'Close', 'Adj Close']:
                    if col in data.columns:
                        data[col] = data[col] * self.usd_to_inr
            
            # Add some technical indicators
            # Calculate moving averages
            data['MA20'] = data['Close'].rolling(window=20).mean()
            data['MA50'] = data['Close'].rolling(window=50).mean()
            data['MA200'] = data['Close'].rolling(window=200).mean()
            
            # Calculate MACD
            data['EMA12'] = data['Close'].ewm(span=12, adjust=False).mean()
            data['EMA26'] = data['Close'].ewm(span=26, adjust=False).mean()
            data['MACD'] = data['EMA12'] - data['EMA26']
            data['Signal_Line'] = data['MACD'].ewm(span=9, adjust=False).mean()
            
            # Calculate RSI
            delta = data['Close'].diff()
            gain = delta.where(delta > 0, 0)
            loss = -delta.where(delta < 0, 0)
            avg_gain = gain.rolling(window=14).mean()
            avg_loss = loss.rolling(window=14).mean()
            rs = avg_gain / avg_loss
            data['RSI'] = 100 - (100 / (1 + rs))
            
            # Save to cache
            if use_cache:
                os.makedirs(os.path.dirname(cache_file), exist_ok=True)
                data.to_csv(cache_file, index=False)
            
            # Set Date as index and return
            data.set_index('Date', inplace=True)
            return data
            
        except Exception as e:
            # If error and cache exists, use cache as fallback
            if use_cache and os.path.exists(cache_file):
                df = pd.read_csv(cache_file, parse_dates=['Date'])
                df.set_index('Date', inplace=True)
                return df
            else:
                raise Exception(f"Failed to fetch data for {symbol}: {str(e)}")
    
    def fetch_multiple_stocks(self, symbols, period='1y'):
        """Fetch data for multiple stock symbols"""
        result = {}
        for symbol in symbols:
            result[symbol] = self.fetch_stock_data(symbol, period)
        return result
    
    def get_stock_info(self, symbol):
        """Get additional information about a stock"""
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            
            # Extract relevant information
            relevant_info = {
                'shortName': info.get('shortName', ''),
                'longName': info.get('longName', symbol),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'marketCap': info.get('marketCap', 0),
                'peRatio': info.get('trailingPE', None),
                'dividendYield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
                'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh', 0),
                'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow', 0),
                'currency': info.get('currency', 'USD'),
                'exchange': info.get('exchange', ''),
                'country': info.get('country', '')
            }
            
            # Convert values to INR if needed
            if self.currency == 'INR' and relevant_info['currency'] != 'INR':
                relevant_info['marketCap'] *= self.usd_to_inr
                relevant_info['fiftyTwoWeekHigh'] *= self.usd_to_inr
                relevant_info['fiftyTwoWeekLow'] *= self.usd_to_inr
                relevant_info['currency'] = 'INR'
            
            return relevant_info
            
        except Exception as e:
            print(f"Error fetching info for {symbol}: {str(e)}")
            return {
                'shortName': symbol,
                'longName': symbol,
                'sector': 'N/A',
                'industry': 'N/A',
                'marketCap': 0,
                'peRatio': None,
                'dividendYield': 0,
                'fiftyTwoWeekHigh': 0,
                'fiftyTwoWeekLow': 0,
                'currency': 'INR',
                'exchange': '',
                'country': '',
                'error': str(e)
            }

