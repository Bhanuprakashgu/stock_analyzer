
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
import os
import joblib

class EnsembleModel:
    def __init__(self, models, weights=None):
        """
        Initialize the ensemble model with a list of models.
        
        Args:
            models: List of model objects that have predict method
            weights: Optional weights for each model (defaults to equal weights)
        """
        self.models = models
        self.meta_model = None
        self.meta_model_path = 'saved_models/ensemble_meta_model.pkl'
        
        # Try to load the meta-model if it exists
        try:
            self.meta_model = joblib.load(self.meta_model_path)
            print("Loaded ensemble meta-model")
        except (OSError, IOError):
            print("Will create new ensemble meta-model during training")
        
        if weights is None:
            # Equal weights if not specified
            self.weights = [1/len(models)] * len(models)
        else:
            # Normalize weights to sum to 1
            total = sum(weights)
            self.weights = [w/total for w in weights]
    
    def train(self, data):
        """
        Train all models in the ensemble plus a meta-model for improved accuracy
        """
        # Train base models
        model_predictions = []
        validation_start = int(len(data) * 0.8)  # Use last 20% for validation
        
        train_data = data.iloc[:validation_start]
        valid_data = data.iloc[validation_start:]
        
        # Train each base model and collect their predictions on validation data
        for model in self.models:
            model.train(train_data)
            preds = model.predict(train_data, prediction_days=len(valid_data))
            model_predictions.append(pd.DataFrame(preds)['Price'].values)
        
        # Stack predictions as features
        meta_features = np.column_stack(model_predictions)
        
        # Target for meta-model is the actual prices
        meta_target = valid_data['Close'].values
        
        # Train a meta-model (XGBoost) to learn optimal combination
        self.meta_model = XGBRegressor(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=4,
            random_state=42
        )
        
        self.meta_model.fit(meta_features, meta_target)
        
        # Save the meta-model
        os.makedirs(os.path.dirname(self.meta_model_path), exist_ok=True)
        joblib.dump(self.meta_model, self.meta_model_path)
        
        return self
    
    def predict(self, data, prediction_days=30):
        """
        Generate predictions using ensemble of models with smart weighting
        
        Args:
            data: Historical stock price data
            prediction_days: Number of days to predict
            
        Returns:
            Dictionary with predictions
        """
        # First, get individual model predictions
        model_predictions = []
        meta_input = None
        
        # Get predictions from each model
        for i, model in enumerate(self.models):
            model_preds = model.predict(data, prediction_days)
            model_predictions.append(pd.DataFrame(model_preds))
            
            # Extract prices for meta-model input
            if meta_input is None:
                meta_input = np.array(pd.DataFrame(model_preds)['Price'].values).reshape(-1, 1)
            else:
                meta_input = np.hstack((
                    meta_input, 
                    np.array(pd.DataFrame(model_preds)['Price'].values).reshape(-1, 1)
                ))
        
        # If no models returned predictions
        if not model_predictions:
            return []
        
        # Get dates from the first model (assuming all models predict for same dates)
        dates = model_predictions[0]['Date']
        
        # Determine final predictions based on strategy
        if self.meta_model is not None:
            # Use meta-model for final predictions
            ensemble_prices = self.meta_model.predict(meta_input)
        else:
            # Use weighted average as fallback
            ensemble_prices = np.zeros(len(dates))
            for i, predictions_df in enumerate(model_predictions):
                ensemble_prices += predictions_df['Price'].values * self.weights[i]
        
        # Calculate confidence intervals (tighter than individual models)
        # Use the standard deviation of base model predictions as uncertainty measure
        model_prices = np.column_stack([df['Price'].values for df in model_predictions])
        prediction_std = np.std(model_prices, axis=1)
        
        lower_bounds = ensemble_prices - 1.96 * prediction_std
        upper_bounds = ensemble_prices + 1.96 * prediction_std
        
        # Create final predictions dataframe
        ensemble_predictions = pd.DataFrame({
            'Date': dates,
            'Price': ensemble_prices,
            'Lower': lower_bounds,
            'Upper': upper_bounds,
            'Model': 'Advanced Ensemble'
        })
        
        # Log prediction quality metrics
        self._log_prediction_quality(model_prices, ensemble_prices)
        
        return ensemble_predictions.to_dict(orient='records')
    
    def _log_prediction_quality(self, model_predictions, ensemble_predictions):
        """Log metrics about prediction quality and model agreement"""
        # Calculate agreement between models (standard deviation as % of mean)
        mean_prices = np.mean(model_predictions, axis=1)
        std_prices = np.std(model_predictions, axis=1)
        cv = np.mean(std_prices / mean_prices) * 100  # Coefficient of variation
        
        print(f"Model Agreement: {'High' if cv < 5 else 'Medium' if cv < 10 else 'Low'}")
        print(f"Average Variation: {cv:.2f}%")
        print(f"Max Prediction Difference: {np.max(std_prices)/np.mean(mean_prices)*100:.2f}%")
