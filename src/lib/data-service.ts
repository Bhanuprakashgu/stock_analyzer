
export interface SalesData {
  month: string;
  sales: number;
  expenses: number;
  profit: number;
}

export interface CustomerData {
  region: string;
  count: number;
}

export interface ProductData {
  category: string;
  revenue: number;
}

export interface PerformanceData {
  day: string;
  performance: number;
  target: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  change: number;
  description: string;
}

export const salesData: SalesData[] = [
  { month: "Jan", sales: 5000, expenses: 3200, profit: 1800 },
  { month: "Feb", sales: 5500, expenses: 3400, profit: 2100 },
  { month: "Mar", sales: 6000, expenses: 3700, profit: 2300 },
  { month: "Apr", sales: 7200, expenses: 4200, profit: 3000 },
  { month: "May", sales: 7800, expenses: 4500, profit: 3300 },
  { month: "Jun", sales: 8300, expenses: 4800, profit: 3500 },
  { month: "Jul", sales: 9100, expenses: 5200, profit: 3900 },
  { month: "Aug", sales: 9500, expenses: 5400, profit: 4100 },
  { month: "Sep", sales: 9800, expenses: 5600, profit: 4200 },
  { month: "Oct", sales: 10200, expenses: 5800, profit: 4400 },
  { month: "Nov", sales: 11000, expenses: 6200, profit: 4800 },
  { month: "Dec", sales: 12000, expenses: 6800, profit: 5200 },
];

export const customerData: CustomerData[] = [
  { region: "North America", count: 1420 },
  { region: "Europe", count: 940 },
  { region: "Asia", count: 1080 },
  { region: "South America", count: 580 },
  { region: "Africa", count: 320 },
  { region: "Oceania", count: 240 },
];

export const productData: ProductData[] = [
  { category: "Electronics", revenue: 45200 },
  { category: "Clothing", revenue: 28500 },
  { category: "Home Goods", revenue: 19800 },
  { category: "Beauty", revenue: 17600 },
  { category: "Sports", revenue: 12400 },
  { category: "Books", revenue: 8700 },
];

export const performanceData: PerformanceData[] = [
  { day: "Mon", performance: 82, target: 80 },
  { day: "Tue", performance: 78, target: 80 },
  { day: "Wed", performance: 85, target: 80 },
  { day: "Thu", performance: 89, target: 80 },
  { day: "Fri", performance: 92, target: 80 },
  { day: "Sat", performance: 76, target: 75 },
  { day: "Sun", performance: 72, target: 75 },
];

export const statCards: StatCard[] = [
  {
    title: "Total Revenue",
    value: "$124,500",
    change: 12.5,
    description: "Compared to last month",
  },
  {
    title: "New Customers",
    value: 584,
    change: 8.2,
    description: "New sign-ups this month",
  },
  {
    title: "Conversion Rate",
    value: "24.8%",
    change: -2.4,
    description: "Website visitors to customers",
  },
  {
    title: "Avg. Order Value",
    value: "$213",
    change: 5.6,
    description: "Average purchase amount",
  },
];

// Helper function to calculate statistics
export const calculateStats = (data: number[]) => {
  if (data.length === 0) return { min: 0, max: 0, avg: 0, median: 0 };
  
  const sortedData = [...data].sort((a, b) => a - b);
  const min = sortedData[0];
  const max = sortedData[sortedData.length - 1];
  const sum = sortedData.reduce((acc, val) => acc + val, 0);
  const avg = sum / sortedData.length;
  
  let median;
  const mid = Math.floor(sortedData.length / 2);
  if (sortedData.length % 2 === 0) {
    median = (sortedData[mid - 1] + sortedData[mid]) / 2;
  } else {
    median = sortedData[mid];
  }
  
  return { min, max, avg, median };
};

// Generate sales statistics
export const getSalesStats = () => {
  const salesValues = salesData.map(item => item.sales);
  return calculateStats(salesValues);
};

// Generate profit statistics
export const getProfitStats = () => {
  const profitValues = salesData.map(item => item.profit);
  return calculateStats(profitValues);
};
