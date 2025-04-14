
import pandas as pd
from prophet import Prophet
import joblib
import os
from datetime import datetime
import numpy as np

class ProphetModel:
    def __init__(self):
        self.model = None
        self.model_path = 'saved_models/prophet_model.pkl'
        self.scaler_data = None
        self._load_or_create_model()
        
    def _load_or_create_model(self):
        try:
            self.model = joblib.load(self.model_path)
            print("Loaded pretrained Prophet model")
        except (OSError, IOError):
            print("Will create new Prophet model when training")
            self.model = None
    
    def train(self, data):
        """Train the Prophet model with stock price data and advanced seasonality"""
        # Prepare data for Prophet (requires 'ds' for dates and 'y' for values)
        df = pd.DataFrame()
        df['ds'] = data.index
        df['y'] = data['Close'].values
        
        # Add additional regressors if available
        if 'Volume' in data.columns:
            df['volume'] = data['Volume'].values
        
        # Check for technical indicators
        if 'RSI' in data.columns:
            df['rsi'] = data['RSI'].fillna(50).values
        
        if 'MACD' in data.columns:
            df['macd'] = data['MACD'].fillna(0).values
        
        # Initialize and train the model with advanced settings for higher accuracy
        self.model = Prophet(
            daily_seasonality=True, 
            weekly_seasonality=True,
            yearly_seasonality=True,
            changepoint_prior_scale=0.03,  # Optimal value for stock data
            seasonality_prior_scale=15.0,  # Stronger seasonality patterns
            holidays_prior_scale=10.0,  # Important for market holidays
            changepoint_range=0.95,  # Allow changes closer to the end of the data
            interval_width=0.95  # 95% confidence interval
        )
        
        # Add country-specific holidays - especially important for Indian markets
        # Indian stock market holidays
        indian_holidays = pd.DataFrame({
            'holiday': 'diwali',
            'ds': pd.to_datetime(['2023-11-12', '2024-11-01', '2025-10-21']),
            'lower_window': 0,
            'upper_window': 1,
        })
        
        # Add more Indian holidays
        more_indian_holidays = pd.DataFrame([
            {'holiday': 'republic_day', 'ds': '2023-01-26', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'republic_day', 'ds': '2024-01-26', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'republic_day', 'ds': '2025-01-26', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'independence_day', 'ds': '2023-08-15', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'independence_day', 'ds': '2024-08-15', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'independence_day', 'ds': '2025-08-15', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'holi', 'ds': '2023-03-08', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'holi', 'ds': '2024-03-25', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'holi', 'ds': '2025-03-14', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'gandhi_jayanti', 'ds': '2023-10-02', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'gandhi_jayanti', 'ds': '2024-10-02', 'lower_window': 0, 'upper_window': 0},
            {'holiday': 'gandhi_jayanti', 'ds': '2025-10-02', 'lower_window': 0, 'upper_window': 0},
        ])
        
        # Combine all holidays
        all_holidays = pd.concat([indian_holidays, more_indian_holidays])
        self.model.add_country_holidays(country_name='IN')
        self.model.holidays = pd.concat([self.model.holidays, all_holidays])
        
        # Add Fourier series for better seasonality modeling
        self.model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        self.model.add_seasonality(name='quarterly', period=91.25, fourier_order=10)
        
        # Add extra regressors if we have them
        if 'volume' in df.columns:
            self.model.add_regressor('volume', mode='multiplicative')
        
        if 'rsi' in df.columns:
            self.model.add_regressor('rsi', mode='additive')
        
        if 'macd' in df.columns:
            self.model.add_regressor('macd', mode='additive')
        
        # Fit the model with more iterations for convergence
        self.model.fit(df)
        
        # Save the model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        
        # Save the last values of regressors to use in future predictions
        self.scaler_data = {
            'last_volume': df['volume'].iloc[-1] if 'volume' in df.columns else None,
            'last_rsi': df['rsi'].iloc[-1] if 'rsi' in df.columns else None,
            'last_macd': df['macd'].iloc[-1] if 'macd' in df.columns else None
        }
        
        return self.model
    
    def predict(self, data, prediction_days=30):
        """Generate predictions for the next prediction_days using the trained model"""
        # Check if model exists or train it
        if self.model is None:
            self.train(data)
        
        # Create future dataframe with more detailed parameters
        future = self.model.make_future_dataframe(periods=prediction_days, freq='D')
        
        # Add regressors to future dataframe if they were used in training
        if self.scaler_data:
            if self.scaler_data['last_volume'] is not None:
                # Project volume with some trend continuation rather than flat value
                future['volume'] = self.scaler_data['last_volume']
                # Add slight volume trend variability
                future['volume'] = future['volume'] * (1 + np.arange(len(future)) * 0.0005)
            
            if self.scaler_data['last_rsi'] is not None:
                # More realistic RSI projection - mean reverting around 50
                rsi_last = self.scaler_data['last_rsi']
                rsi_values = np.array([rsi_last])
                for i in range(1, len(future)):
                    # Mean-reverting RSI
                    next_rsi = rsi_values[-1] + (50 - rsi_values[-1]) * 0.05 + np.random.normal(0, 3)
                    # Constrain RSI between 0 and 100
                    next_rsi = max(0, min(100, next_rsi))
                    rsi_values = np.append(rsi_values, next_rsi)
                
                future['rsi'] = rsi_values
            
            if self.scaler_data['last_macd'] is not None:
                # Mean-reverting MACD
                macd_last = self.scaler_data['last_macd']
                macd_values = np.array([macd_last])
                for i in range(1, len(future)):
                    # Mean-reverting MACD with cyclical component
                    next_macd = macd_values[-1] * 0.9 + np.sin(i/20) * 0.5 + np.random.normal(0, 0.5)
                    macd_values = np.append(macd_values, next_macd)
                
                future['macd'] = macd_values
        
        # Make predictions with improved modeling
        forecast = self.model.predict(future)
        
        # Get only the future predictions
        last_date = data.index[-1]
        future_predictions = forecast[forecast['ds'] > last_date]
        
        # Extract prediction and confidence intervals
        predictions_df = pd.DataFrame({
            'Date': future_predictions['ds'],
            'Price': future_predictions['yhat'],
            'Lower': future_predictions['yhat_lower'],
            'Upper': future_predictions['yhat_upper'],
            'Model': 'Prophet'
        })
        
        return predictions_df.to_dict(orient='records')
