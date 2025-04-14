
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  salesData, performanceData, customerData, productData, 
  statCards, getSalesStats, getProfitStats 
} from "@/lib/data-service";
import StatCard from "@/components/StatCard";
import BarChart from "@/components/BarChart";
import LineChart from "@/components/LineChart";
import PieChart from "@/components/PieChart";
import StatisticsCard from "@/components/StatisticsCard";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ChartLine } from "lucide-react";

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Data Refreshed",
      description: "The dashboard data has been updated.",
      duration: 3000,
    });
  };

  return (
    <div className="container py-10 animate-fade-in">
      <Header 
        title="Data Science Dashboard" 
        subtitle="Analyze your business performance with interactive visualizations"
        onRefresh={handleRefresh}
      />
      
      <div className="mb-6 flex justify-end">
        <Link to="/stock-predictor">
          <Button className="flex items-center gap-2">
            <ChartLine className="h-4 w-4" />
            <span>Stock Price Predictor</span>
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => (
          <StatCard key={`${index}-${refreshKey}`} data={card} />
        ))}
      </div>
      
      <Tabs defaultValue="sales" className="mb-8">
        <TabsList>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BarChart data={salesData} title="Monthly Sales Performance" />
            </div>
            <div className="lg:col-span-1 grid grid-cols-1 gap-6">
              <StatisticsCard title="Sales Statistics" stats={getSalesStats()} />
              <StatisticsCard title="Profit Statistics" stats={getProfitStats()} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart data={performanceData} title="Weekly Performance vs Target" />
            <PieChart 
              data={productData} 
              title="Revenue by Product Category" 
              dataKey="revenue" 
              nameKey="category" 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChart 
              data={customerData} 
              title="Customer Distribution by Region" 
              dataKey="count" 
              nameKey="region" 
            />
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-4">Customer Insights</h3>
              <ul className="space-y-4">
                <li className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Customers</span>
                    <span>4,580</span>
                  </div>
                </li>
                <li className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Average Lifetime Value</span>
                    <span>$1,240</span>
                  </div>
                </li>
                <li className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Retention Rate</span>
                    <span>76.4%</span>
                  </div>
                </li>
                <li className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">New vs Returning</span>
                    <span>32% / 68%</span>
                  </div>
                </li>
                <li className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Most Active Region</span>
                    <span>North America</span>
                  </div>
                </li>
                <li>
                  <div className="flex justify-between">
                    <span className="font-medium">Customer Growth</span>
                    <span className="text-data-green">+18.2% YoY</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Customer Segmentation Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-data-blue mb-2">High Value</h4>
                <p className="text-sm text-gray-600 mb-2">15% of customer base</p>
                <p className="text-sm">Customers with AOV &gt; $500 and purchase frequency &gt; 12/year</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-data-purple mb-2">Regular</h4>
                <p className="text-sm text-gray-600 mb-2">45% of customer base</p>
                <p className="text-sm">Customers with AOV $100-$500 and purchase frequency 4-12/year</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-medium text-data-teal mb-2">Occasional</h4>
                <p className="text-sm text-gray-600 mb-2">40% of customer base</p>
                <p className="text-sm">Customers with AOV &lt; $100 and purchase frequency &lt; 4/year</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
