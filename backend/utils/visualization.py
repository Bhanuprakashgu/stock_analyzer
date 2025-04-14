
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from matplotlib.dates import DateFormatter
import seaborn as sns
import io
import base64

class Visualizer:
    def __init__(self, theme='darkgrid', currency='INR'):
        """Initialize the visualizer with a theme and currency"""
        sns.set_theme(style=theme)
        plt.rcParams['figure.figsize'] = (12, 6)
        self.currency = currency
        self.currency_symbol = '₹' if currency == 'INR' else '$'
    
    def plot_stock_history(self, data, symbol, ma_periods=None, include_volume=False):
        """
        Plot historical stock prices with moving averages and enhanced visuals
        
        Args:
            data: DataFrame with stock data
            symbol: Stock symbol for the title
            ma_periods: List of periods for moving averages (e.g., [20, 50, 200])
            include_volume: Whether to include volume subplot
            
        Returns:
            Base64 encoded PNG image
        """
        # Determine if we need a volume subplot
        if include_volume and 'Volume' in data.columns:
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), gridspec_kw={'height_ratios': [3, 1], 'hspace': 0.2})
        else:
            fig, ax1 = plt.subplots(figsize=(14, 8))
            ax2 = None
            
        # Plot closing price on the main axis
        ax1.plot(data.index, data['Close'], label='Close Price', linewidth=2, color='#0d6efd')
        
        # Add moving averages with improved visibility
        colors = ['#6610f2', '#d63384', '#fd7e14']
        if ma_periods:
            for i, period in enumerate(ma_periods):
                color = colors[i % len(colors)]
                if f'MA{period}' in data.columns:
                    ax1.plot(data.index, data[f'MA{period}'], 
                           label=f'{period}-day MA', color=color, alpha=0.8, linewidth=1.5)
                else:
                    ma = data['Close'].rolling(window=period).mean()
                    ax1.plot(data.index, ma, label=f'{period}-day MA', 
                           color=color, alpha=0.8, linewidth=1.5)
        
        # Set labels and title with improved formatting
        ax1.set_title(f'{symbol} Stock Price History (All Available Data)', fontsize=18, fontweight='bold')
        ax1.set_xlabel('Date', fontsize=14)
        ax1.set_ylabel(f'Price ({self.currency_symbol})', fontsize=14)
        ax1.grid(True, alpha=0.3)
        
        # Highlight key periods like bull/bear markets if data spans multiple years
        if (data.index[-1] - data.index[0]).days > 730:  # More than 2 years of data
            # Find significant bull and bear periods (simplified example)
            # In a real implementation, we would identify actual bull/bear markets
            rolling_returns = data['Close'].pct_change(252).fillna(0)  # Annual rolling returns
            bull_periods = (rolling_returns > 0.2)  # Periods with >20% annual returns
            bear_periods = (rolling_returns < -0.2)  # Periods with <-20% annual returns
            
            # Highlight bull periods in light green
            if bull_periods.any():
                bull_starts = data.index[bull_periods & ~bull_periods.shift(1, fill_value=False)]
                bull_ends = data.index[bull_periods & ~bull_periods.shift(-1, fill_value=False)]
                
                for start, end in zip(bull_starts, bull_ends):
                    if (end - start).days > 30:  # Only highlight periods longer than a month
                        ax1.axvspan(start, end, alpha=0.2, color='green', label='_nolegend_')
            
            # Highlight bear periods in light red
            if bear_periods.any():
                bear_starts = data.index[bear_periods & ~bear_periods.shift(1, fill_value=False)]
                bear_ends = data.index[bear_periods & ~bear_periods.shift(-1, fill_value=False)]
                
                for start, end in zip(bear_starts, bear_ends):
                    if (end - start).days > 30:  # Only highlight periods longer than a month
                        ax1.axvspan(start, end, alpha=0.2, color='red', label='_nolegend_')
        
        # Format x-axis dates
        date_format = DateFormatter('%Y-%m')
        ax1.xaxis.set_major_formatter(date_format)
        plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        # Format y-axis with currency
        ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{self.currency_symbol}{x:,.2f}'))
        
        # Add volume subplot if requested
        if ax2 is not None and 'Volume' in data.columns:
            # Plot volume as a bar chart
            ax2.bar(data.index, data['Volume'], alpha=0.3, color='#6c757d')
            ax2.set_ylabel('Volume', fontsize=12)
            ax2.set_xlabel('Date', fontsize=14)
            ax2.grid(True, alpha=0.3)
            
            # Format x-axis dates on volume subplot
            ax2.xaxis.set_major_formatter(date_format)
            plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
            
            # Format y-axis with thousands/millions/billions
            def volume_formatter(x, pos):
                if x >= 1e9:
                    return f'{x*1e-9:.1f}B'
                elif x >= 1e6:
                    return f'{x*1e-6:.1f}M'
                elif x >= 1e3:
                    return f'{x*1e-3:.1f}K'
                else:
                    return f'{x:.0f}'
            
            ax2.yaxis.set_major_formatter(plt.FuncFormatter(volume_formatter))
        
        # Add legend with improved styling
        ax1.legend(loc='upper left', frameon=True, framealpha=0.9, fontsize=12)
        
        # Add interactive features note
        fig.text(0.5, 0.01, "Interactive features: Pan, Zoom, Box Select available in web interface", 
                 ha='center', fontsize=10, style='italic', alpha=0.7)
        
        # Adjust layout
        plt.tight_layout()
        
        # Convert plot to base64 image
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=120)
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        
        return base64.b64encode(image_png).decode()
    
    def plot_predictions(self, historical_data, predictions_df, symbol, include_sentiment=False):
        """
        Plot historical data and future predictions with enhanced visualization
        
        Args:
            historical_data: DataFrame with historical stock data
            predictions_df: DataFrame with predictions
            symbol: Stock symbol for the title
            include_sentiment: Whether to include sentiment indicators
            
        Returns:
            Base64 encoded PNG image
        """
        fig, ax = plt.subplots(figsize=(14, 8))
        
        # Convert prediction dates to datetime if they aren't already
        if not pd.api.types.is_datetime64_any_dtype(predictions_df['Date']):
            predictions_df['Date'] = pd.to_datetime(predictions_df['Date'])
        
        # Plot historical data - focus on last 90 days for clarity
        ax.plot(historical_data.index[-90:], historical_data['Close'][-90:], 
               label='Historical', color='#0d6efd', linewidth=2.5)
        
        # Get unique models in predictions
        models = predictions_df['Model'].unique()
        colors = plt.cm.tab10.colors[:len(models)]
        
        # Plot predictions for each model with improved styling
        for i, model in enumerate(models):
            model_preds = predictions_df[predictions_df['Model'] == model]
            ax.plot(model_preds['Date'], model_preds['Price'], 
                   label=f'{model} Prediction',
                   color=colors[i], linewidth=2.5, linestyle='--')
            
            # Add confidence intervals with better styling
            if 'Lower' in model_preds.columns and 'Upper' in model_preds.columns:
                ax.fill_between(model_preds['Date'], 
                               model_preds['Lower'],
                               model_preds['Upper'],
                               color=colors[i], alpha=0.15,
                               label=f'{model} 95% Confidence Interval')
        
        # Add vertical line separating history from predictions with label
        ax.axvline(x=historical_data.index[-1], color='black', linestyle='--', alpha=0.7)
        ax.text(historical_data.index[-1], ax.get_ylim()[0] + (ax.get_ylim()[1] - ax.get_ylim()[0])*0.05, 
                'Prediction Start', rotation=90, verticalalignment='bottom', fontsize=10)
        
        # Add sentiment indicators if requested (simplified example)
        if include_sentiment:
            # In a real implementation, this would use actual sentiment analysis
            # For this example, we'll just add some simulated market sentiment zones
            sentiment_level = np.random.choice(['Positive', 'Neutral', 'Negative'])
            sentiment_color = {'Positive': 'green', 'Neutral': 'gray', 'Negative': 'red'}[sentiment_level]
            
            # Add a text box with the sentiment
            props = dict(boxstyle='round', facecolor='white', alpha=0.8)
            ax.text(0.05, 0.95, f'Market Sentiment: {sentiment_level}', transform=ax.transAxes, 
                    fontsize=12, verticalalignment='top', bbox=props, color=sentiment_color)
        
        # Set labels and title with improved formatting
        ax.set_title(f'{symbol} Stock Price Prediction - 30 Day Forecast', fontsize=18, fontweight='bold')
        ax.set_xlabel('Date', fontsize=14)
        ax.set_ylabel(f'Price ({self.currency_symbol})', fontsize=14)
        ax.grid(True, alpha=0.3)
        
        # Format x-axis dates
        date_format = DateFormatter('%Y-%m-%d')
        ax.xaxis.set_major_formatter(date_format)
        plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        # Format y-axis with currency
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{self.currency_symbol}{x:,.2f}'))
        
        # Add legend with better styling
        ax.legend(loc='upper left', frameon=True, framealpha=0.9, fontsize=12)
        
        # Add drag and zoom instruction
        fig.text(0.5, 0.01, "Interactive features: Pan, Zoom, Box Select available in web interface", 
                 ha='center', fontsize=10, style='italic', alpha=0.7)
        
        # Adjust layout
        plt.tight_layout()
        
        # Convert plot to base64 image
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=120)
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        
        return base64.b64encode(image_png).decode()
    
    def plot_model_comparison(self, actual, predictions_dict, title="Model Performance Comparison"):
        """
        Compare multiple prediction models visually
        
        Args:
            actual: Array of actual values
            predictions_dict: Dictionary with model names as keys and predictions as values
            title: Plot title
            
        Returns:
            Base64 encoded PNG image
        """
        fig, ax = plt.subplots(figsize=(14, 8))
        
        # Plot actual values
        ax.plot(actual, label='Actual', color='black', linewidth=2.5)
        
        # Plot predictions from each model
        colors = plt.cm.tab10.colors
        for i, (model_name, predictions) in enumerate(predictions_dict.items()):
            ax.plot(predictions, label=model_name, color=colors[i % len(colors)], 
                   linewidth=2, linestyle='--', alpha=0.8)
        
        # Calculate and display error metrics
        mape_values = {}
        for model_name, predictions in predictions_dict.items():
            # Calculate MAPE
            mape = np.mean(np.abs((actual - predictions) / actual)) * 100
            mape_values[model_name] = mape
        
        # Add a text box with MAPE values
        mape_text = '\n'.join([f'{model}: MAPE = {mape:.2f}%' for model, mape in mape_values.items()])
        props = dict(boxstyle='round', facecolor='white', alpha=0.8)
        ax.text(0.05, 0.95, mape_text, transform=ax.transAxes, 
                fontsize=10, verticalalignment='top', bbox=props)
        
        # Set labels and title
        ax.set_title(title, fontsize=16, fontweight='bold')
        ax.set_xlabel('Time', fontsize=12)
        ax.set_ylabel(f'Price ({self.currency_symbol})', fontsize=12)
        ax.grid(True, alpha=0.3)
        
        # Add legend
        ax.legend(loc='upper left', frameon=True, framealpha=0.9)
        
        # Convert plot to base64 image
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100)
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        
        return base64.b64encode(image_png).decode()
