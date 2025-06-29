Stock Price Prediction 

This is a Flask-based application for stock price prediction using machine learning. It uses a combination of LSTM neural networks and Prophet forecasting models to predict future stock prices.

## Features

- Historical stock price visualization
- Future price predictions with confidence intervals
- Technical indicators and analysis
- Risk assessment and investment insights
- Support for both Indian and US stocks

## Installation

1. Clone the repository
2. Install the required packages:

```bash
pip install -r backend/requirements.txt
```

3. Run the Flask application:

```bash
python run_flask_app.py
```

4. Open your browser and go to `http://localhost:5000`

## Models

The application uses three models:

1. **LSTM Model**: A deep learning model with attention mechanism for time-series forecasting
2. **Prophet Model**: Facebook's time series forecasting model
3. **Ensemble Model**: A combination of both models for improved accuracy

## Usage

1. Enter a stock symbol in the search box (e.g., 'RELIANCE.NS' for Reliance Industries, 'AAPL' for Apple)
2. View historical price chart with technical indicators
3. Analyze future price predictions with confidence intervals
4. Change prediction timeframe (10, 30, 60, or 90 days)
5. Review investment insights and risk assessment

## Project Structure

```
.
├── backend/
│   ├── app.py                # Main Flask application
│   ├── data/                 # Data handling modules
│   │   ├── fetcher.py        # Stock data fetching
│   │   └── preprocessor.py   # Data preprocessing
│   ├── models/               # ML models
│   │   ├── lstm_model.py     # LSTM neural network
│   │   ├── prophet_model.py  # Prophet forecasting
│   │   └── ensemble.py       # Ensemble model
│   ├── utils/                # Utility functions
│   ├── templates/            # HTML templates
│   └── static/               # Static assets
└── run_flask_app.py          # Runner script
```

## Dependencies

- Flask
- Pandas
- NumPy
- yfinance
- TensorFlow
- Prophet
- Plotly
- Scikit-learn

## Running in Production

For production deployment, you may want to use Gunicorn:

```bash
gunicorn -w 4 -b 0.0.0.0:8000 backend.app:app
```

## License

This project is open source and available under the MIT License.
