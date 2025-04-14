
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns

class ModelEvaluator:
    def __init__(self):
        """Initialize the model evaluator with enhanced metrics"""
        self.metrics_history = {}
    
    def evaluate_model(self, actual, predicted, symbol=None):
        """
        Evaluate model predictions using various metrics with enhanced accuracy measures
        
        Args:
            actual: Array of actual values
            predicted: Array of predicted values
            symbol: Optional stock symbol for tracking performance
            
        Returns:
            Dictionary with evaluation metrics
        """
        mse = mean_squared_error(actual, predicted)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(actual, predicted)
        r2 = r2_score(actual, predicted)
        mape = self._mean_absolute_percentage_error(actual, predicted)
        
        # Direction accuracy (up/down movement prediction)
        actual_direction = np.diff(actual) > 0
        pred_direction = np.diff(predicted) > 0
        direction_accuracy = np.mean(actual_direction == pred_direction) * 100
        
        # Calculate weighted accuracy for recent predictions (more weight to recent predictions)
        weights = np.linspace(0.5, 1.0, len(actual))
        weighted_mape = np.average(np.abs((actual - predicted) / actual) * 100, weights=weights)
        
        # Calculate volatility-adjusted metrics
        volatility = np.std(actual) / np.mean(actual)
        vol_adjusted_mape = mape / volatility if volatility > 0 else mape
        
        metrics = {
            'MSE': mse,
            'RMSE': rmse,
            'MAE': mae,
            'R2': r2,
            'MAPE': mape,
            'DirectionAccuracy': direction_accuracy,
            'WeightedMAPE': weighted_mape,
            'VolAdjustedMAPE': vol_adjusted_mape
        }
        
        # Store metrics history if symbol is provided
        if symbol:
            self.metrics_history[symbol] = metrics
        
        return metrics
    
    def _mean_absolute_percentage_error(self, actual, predicted):
        """
        Calculate Mean Absolute Percentage Error with improved handling for edge cases
        """
        actual, predicted = np.array(actual), np.array(predicted)
        # Handle division by zero and very small values
        mask = np.abs(actual) > 1e-8
        if not np.any(mask):
            return 0.0
        return np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100
    
    def compare_models(self, actual, predictions_dict):
        """
        Compare multiple models against actual values with enhanced visualization
        
        Args:
            actual: Array of actual values
            predictions_dict: Dictionary of model predictions {model_name: predictions}
            
        Returns:
            DataFrame with comparison metrics for each model
        """
        results = {}
        
        for model_name, predictions in predictions_dict.items():
            metrics = self.evaluate_model(actual, predictions)
            results[model_name] = metrics
        
        results_df = pd.DataFrame(results).T
        
        # Add a combined score column (weighted average of metrics)
        results_df['CombinedScore'] = (
            results_df['R2'] * 0.3 +
            (100 - results_df['MAPE']) / 100 * 0.4 +
            results_df['DirectionAccuracy'] / 100 * 0.3
        )
        
        # Sort by combined score
        results_df = results_df.sort_values('CombinedScore', ascending=False)
        
        return results_df
    
    def plot_forecast_accuracy(self, actual, predictions, title="Forecast Accuracy"):
        """
        Create visualization of forecast accuracy
        
        Args:
            actual: Array of actual values
            predictions: Array of predicted values
            title: Plot title
            
        Returns:
            Matplotlib figure
        """
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
        
        # Plot actual vs predicted
        ax1.plot(actual, label='Actual', linewidth=2)
        ax1.plot(predictions, label='Predicted', linewidth=2, linestyle='--')
        ax1.set_title(f"{title} - Actual vs Predicted")
        ax1.set_ylabel("Value")
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Plot error
        error = actual - predictions
        ax2.bar(range(len(error)), error)
        ax2.axhline(y=0, color='r', linestyle='-', alpha=0.3)
        ax2.set_title("Prediction Error")
        ax2.set_xlabel("Time")
        ax2.set_ylabel("Error")
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
        return fig
    
    def calculate_confidence_intervals(self, model_error, predictions, confidence=0.95):
        """
        Calculate confidence intervals based on model error distribution
        
        Args:
            model_error: Historical model error
            predictions: Predicted values
            confidence: Confidence level (default 0.95 for 95% CI)
            
        Returns:
            Tuple of (lower_bounds, upper_bounds)
        """
        # Calculate z-score for the confidence level
        z_score = {
            0.90: 1.645,
            0.95: 1.96,
            0.99: 2.576
        }.get(confidence, 1.96)
        
        # Calculate standard error
        std_error = np.std(model_error)
        
        # Calculate confidence interval
        margin = z_score * std_error
        
        # Calculate lower and upper bounds
        lower_bounds = predictions - margin
        upper_bounds = predictions + margin
        
        return lower_bounds, upper_bounds
