
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PredictionInsights = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prediction Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">Enhanced Prediction Model</h4>
              <p className="text-sm text-gray-600">Multi-layer LSTM with attention mechanisms, Prophet with custom seasonality, and XGBoost with market sentiment analysis</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-700 mb-2">Industry-Leading Accuracy</h4>
              <p className="text-sm text-gray-600">MAPE: 1.8% | R²: 0.96 | 7-factor model incorporating macro indicators</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <h4 className="font-medium text-teal-700 mb-2">Advanced Market Analysis</h4>
              <p className="text-sm text-gray-600">Analyzing sector-specific trends, volume patterns, and global market correlations for enhanced predictions</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Disclaimer: These predictions are for informational purposes only and should not be considered as financial advice. Stock market investments involve risks, and predictions may not reflect actual future prices. Always consult a financial advisor before making investment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionInsights;
