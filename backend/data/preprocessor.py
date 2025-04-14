
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

class DataPreprocessor:
    def __init__(self):
        """Initialize the data preprocessor"""
        self.scaler = MinMaxScaler(feature_range=(0, 1))
    
    def preprocess(self, data, add_technical=True):
        """
        Preprocess stock data for model training
        
        Args:
            data: Pandas DataFrame with stock data from yfinance
            add_technical: Whether to add technical indicators
            
        Returns:
            Preprocessed DataFrame ready for model training
        """
        # Make a copy to avoid modifying the original
        df = data.copy()
        
        # Handle missing values
        df.fillna(method='ffill', inplace=True)
        
        # Add technical indicators if requested
        if add_technical:
            self._add_technical_indicators(df)
        
        # Handle any remaining missing values that might have been introduced
        df.dropna(inplace=True)
        
        return df
    
    def _add_technical_indicators(self, df):
        """Add technical indicators to the dataframe"""
        # Moving averages
        df['MA5'] = df['Close'].rolling(window=5).mean()
        df['MA20'] = df['Close'].rolling(window=20).mean()
        df['MA50'] = df['Close'].rolling(window=50).mean()
        
        # Relative Strength Index (RSI)
        delta = df['Close'].diff()
        gain = delta.where(delta > 0, 0).rolling(window=14).mean()
        loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        # MACD (Moving Average Convergence Divergence)
        ema12 = df['Close'].ewm(span=12, adjust=False).mean()
        ema26 = df['Close'].ewm(span=26, adjust=False).mean()
        df['MACD'] = ema12 - ema26
        df['MACD_signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
        
        # Bollinger Bands
        df['MA20_std'] = df['Close'].rolling(window=20).std()
        df['upper_band'] = df['MA20'] + (df['MA20_std'] * 2)
        df['lower_band'] = df['MA20'] - (df['MA20_std'] * 2)
        
        # Volume indicators
        df['Volume_1d_change'] = df['Volume'].pct_change()
        
        # Price momentum
        df['Price_1d_change'] = df['Close'].pct_change()
        df['Price_5d_change'] = df['Close'].pct_change(periods=5)
        
        return df
    
    def split_data(self, df, test_size=0.2):
        """Split data into training and testing sets"""
        train_size = int(len(df) * (1 - test_size))
        train_data = df.iloc[:train_size]
        test_data = df.iloc[train_size:]
        return train_data, test_data
    
    def scale_data(self, data, feature_columns=None):
        """Scale numerical features to [0,1] range"""
        if feature_columns is None:
            feature_columns = data.columns
            
        data_scaled = data.copy()
        data_scaled[feature_columns] = self.scaler.fit_transform(data[feature_columns])
        return data_scaled
    
    def create_sequences(self, data, target_col='Close', sequence_length=60):
        """Create sequences for time series prediction"""
        sequences = []
        targets = []
        
        for i in range(len(data) - sequence_length):
            seq = data.iloc[i:i+sequence_length]
            target = data.iloc[i+sequence_length][target_col]
            sequences.append(seq.values)
            targets.append(target)
            
        return np.array(sequences), np.array(targets)
