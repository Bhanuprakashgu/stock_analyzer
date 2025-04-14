
#!/usr/bin/env python3
"""
Runner script for the FinForecast Flask application
Includes periodic tasks for automatic updates of stocks and predictions
"""
import os
import sys
import time
import threading
from datetime import datetime, timedelta

def background_health_check():
    """Simple background thread to periodically check app health"""
    import requests
    import time
    
    while True:
        try:
            response = requests.get("http://localhost:5000/health")
            if response.status_code == 200:
                print(f"[{datetime.now()}] Application is healthy.")
            else:
                print(f"[{datetime.now()}] Warning: Application health check failed: {response.status_code}")
        except Exception as e:
            print(f"[{datetime.now()}] Error: Could not connect to application: {str(e)}")
        
        # Sleep for 30 minutes
        time.sleep(30 * 60)

def run_flask_app():
    """Run the Flask application"""
    # Set the Python path to include the backend directory
    backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
    sys.path.insert(0, backend_path)
    
    # Execute the app
    os.chdir(backend_path)  # Change to the backend directory
    from app import app
    
    # Get the port from environment variable or use default 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Start health check thread
    health_thread = threading.Thread(target=background_health_check, daemon=True)
    health_thread.start()
    
    print(f"[{datetime.now()}] Starting FinForecast application on port {port}")
    print(f"[{datetime.now()}] Stock data will be updated automatically every 24 hours")
    print(f"[{datetime.now()}] Prediction cache will be updated automatically every 12 hours")
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=True)

if __name__ == '__main__':
    run_flask_app()

