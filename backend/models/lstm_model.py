
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input, Conv1D, MaxPooling1D, Attention, concatenate, UpSampling1D
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
import tensorflow as tf
import joblib
import os

class LSTMModel:
    def __init__(self, window_size=60, epochs=100, batch_size=32, attention=True, n_layers=3):
        self.window_size = window_size
        self.epochs = epochs
        self.batch_size = batch_size
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model_path = 'saved_models/lstm_model'
        self.scaler_path = 'saved_models/lstm_scaler.pkl'
        self.use_attention = attention
        self.n_layers = n_layers
        
        # Try to load pretrained model if exists
        self._load_or_create_model()

    def _load_or_create_model(self):
        try:
            self.model = tf.keras.models.load_model(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            print("Loaded pretrained LSTM model")
        except (OSError, IOError):
            print("Creating new LSTM model")
            self.model = self._build_model()
    
    def _build_model(self):
        if self.use_attention:
            return self._build_attention_model()
        else:
            return self._build_vanilla_model()
    
    def _build_vanilla_model(self):
        """Build a standard LSTM model"""
        model = Sequential()
        model.add(LSTM(units=100, return_sequences=True, input_shape=(self.window_size, 4)))
        model.add(Dropout(0.2))
        model.add(LSTM(units=100, return_sequences=True))
        model.add(Dropout(0.2))
        model.add(LSTM(units=100))
        model.add(Dropout(0.2))
        model.add(Dense(units=1))
        
        optimizer = Adam(learning_rate=0.001)
        model.compile(optimizer=optimizer, loss='mean_squared_error', metrics=['mae'])
        return model
    
    def _build_attention_model(self):
        """Build an advanced LSTM model with attention mechanism for improved accuracy"""
        # Input layer
        input_layer = Input(shape=(self.window_size, 4))
        
        # LSTM layers
        lstm1 = LSTM(units=100, return_sequences=True)(input_layer)
        lstm1 = Dropout(0.2)(lstm1)
        
        # Parallel Conv1D path
        conv1 = Conv1D(filters=64, kernel_size=3, activation='relu', padding='same')(input_layer)
        conv1 = MaxPooling1D(pool_size=2)(conv1)
        conv1 = UpSampling1D(size=2)(conv1)
        conv1 = Dropout(0.2)(conv1)
        
        # Combine paths
        concat = concatenate([lstm1, conv1])
        
        # More LSTM layers
        lstm2 = LSTM(units=100, return_sequences=True)(concat)
        lstm2 = Dropout(0.2)(lstm2)
        
        # Attention mechanism
        attn = Attention()([lstm2, lstm2])
        
        # Final LSTM layer
        lstm3 = LSTM(units=100)(attn)
        lstm3 = Dropout(0.2)(lstm3)
        
        # Output layer
        output = Dense(units=1)(lstm3)
        
        # Create model
        model = Model(inputs=input_layer, outputs=output)
        
        # Compile model
        optimizer = Adam(learning_rate=0.001)
        model.compile(optimizer=optimizer, loss='mean_squared_error', metrics=['mae'])
        
        return model
    
    def _prepare_features(self, data):
        """Prepare features for model training - enhanced with technical indicators"""
        # Start with the Close price
        features = data['Close'].values.reshape(-1, 1)
        
        if 'Volume' in data.columns:
            # Normalize volume separately
            volume_scaler = MinMaxScaler()
            volume = volume_scaler.fit_transform(data['Volume'].values.reshape(-1, 1))
            features = np.hstack((features, volume))
        
        # Add technical indicators if they exist
        for indicator in ['RSI', 'MACD']:
            if indicator in data.columns:
                # Handle NaN values
                indicator_data = data[indicator].fillna(0).values.reshape(-1, 1)
                indicator_scaler = MinMaxScaler()
                indicator_data = indicator_scaler.fit_transform(indicator_data)
                features = np.hstack((features, indicator_data))
        
        # Scale all features
        scaled_features = self.scaler.fit_transform(features)
        
        return scaled_features
    
    def train(self, data):
        """Train the LSTM model with stock price data and technical indicators"""
        # Prepare multi-feature input
        scaled_data = self._prepare_features(data)
        
        # Create training sequences
        X_train, y_train = [], []
        
        for i in range(self.window_size, len(scaled_data)):
            X_train.append(scaled_data[i-self.window_size:i])
            # Target is always the first column (Close price)
            y_train.append(scaled_data[i, 0])
            
        X_train, y_train = np.array(X_train), np.array(y_train)
        
        # Define callbacks for better training
        callbacks = [
            EarlyStopping(patience=20, monitor='val_loss', restore_best_weights=True),
            ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=0.0001)
        ]
        
        # Train the model with validation split
        self.model.fit(
            X_train, y_train, 
            epochs=self.epochs, 
            batch_size=self.batch_size, 
            validation_split=0.2,
            callbacks=callbacks,
            verbose=1
        )
        
        # Save the model and scaler
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        self.model.save(self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        
        return self.model
    
    def predict(self, data, prediction_days=30):
        """Generate predictions for the next prediction_days using the trained model"""
        if self.model is None:
            raise ValueError("Model not trained yet. Call train() first.")
        
        # Prepare features with enhanced indicators
        features = self._prepare_features(data)
        
        # Get the last window_size days of data for initial prediction
        input_data = features[-self.window_size:]
        
        # Make future predictions
        predictions = []
        current_batch = input_data.reshape(1, self.window_size, features.shape[1])
        
        for _ in range(prediction_days):
            # Predict the next day
            next_pred = self.model.predict(current_batch, verbose=0)[0, 0]
            predictions.append(next_pred)
            
            # Create next feature set (most features will be impossible to predict accurately)
            # So we'll make a simple assumption for the additional features
            next_features = np.zeros((1, features.shape[1]))
            next_features[0, 0] = next_pred  # Close price
            
            # For other features, just use the last known values
            for j in range(1, features.shape[1]):
                next_features[0, j] = current_batch[0, -1, j]
            
            # Update the batch to include the new prediction
            current_batch = np.append(current_batch[:, 1:, :], next_features.reshape(1, 1, features.shape[1]), axis=1)
        
        # Convert predictions back to original scale (focusing on Close price column)
        # Create an array with zeros for all columns except Close price
        inverse_predictions = np.zeros((len(predictions), features.shape[1]))
        inverse_predictions[:, 0] = predictions  # Set Close price column
        
        # Inverse transform to get actual prices
        predicted_prices = self.scaler.inverse_transform(inverse_predictions)[:, 0]
        
        # Create dates for predictions (assuming business days)
        last_date = pd.to_datetime(data.index[-1])
        future_dates = pd.bdate_range(start=last_date + pd.Timedelta(days=1), periods=prediction_days)
        
        # Calculate confidence intervals based on prediction distance
        conf_intervals = [0.02 + (day * 0.001) for day in range(prediction_days)]
        lower_bounds = [price * (1 - interval) for price, interval in zip(predicted_prices, conf_intervals)]
        upper_bounds = [price * (1 + interval) for price, interval in zip(predicted_prices, conf_intervals)]
        
        # Create a DataFrame with predictions and confidence intervals
        predictions_df = pd.DataFrame({
            'Date': future_dates,
            'Price': predicted_prices,
            'Lower': lower_bounds,
            'Upper': upper_bounds,
            'Model': 'LSTM-Attention'
        })
        
        return predictions_df.to_dict(orient='records')
