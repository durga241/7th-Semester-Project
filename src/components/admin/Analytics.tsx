import { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, ShoppingCart, Download, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  userGrowth: { month: string; count: number }[];
  revenueData: { month: string; revenue: number }[];
  productPerformance: { category: string; sales: number }[];
  orderVolume: { status: string; count: number }[];
  topProducts: { name: string; sales: number }[];
  topFarmers: { name: string; revenue: number }[];
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    revenueData: [],
    productPerformance: [],
    orderVolume: [],
    topProducts: [],
    topFarmers: []
  });

  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    conversionRate: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || {});
        setKpis(data.kpis || {});
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (type: 'pdf' | 'excel') => {
    // Create CSV for Excel export
    if (type === 'excel') {
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Total Revenue', `₹${kpis.totalRevenue}`],
        ['Total Orders', kpis.totalOrders],
        ['Total Users', kpis.totalUsers],
        ['Total Products', kpis.totalProducts],
        ['Average Order Value', `₹${kpis.avgOrderValue}`],
        ['Conversion Rate', `${kpis.conversionRate}%`]
      ];

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Track performance and generate insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExportReport('excel')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">₹{kpis.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last period</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">{kpis.totalOrders}</p>
                <p className="text-xs text-green-600 mt-1">↑ 8% from last period</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{kpis.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">↑ 15% from last period</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold text-foreground">{kpis.totalProducts}</p>
                <p className="text-xs text-muted-foreground mt-1">Active listings</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-3xl font-bold text-foreground">₹{kpis.avgOrderValue.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% from last period</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold text-foreground">{kpis.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-green-600 mt-1">↑ 3% from last period</p>
              </div>
              <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-pink-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.revenueData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{
                      height: `${(item.revenue / Math.max(...analytics.revenueData.map(d => d.revenue))) * 100}%`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <p className="text-xs text-muted-foreground mt-2">{item.month}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.userGrowth.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                    style={{
                      height: `${(item.count / Math.max(...analytics.userGrowth.map(d => d.count))) * 100}%`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <p className="text-xs text-muted-foreground mt-2">{item.month}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="font-bold text-primary">{product.sales} sales</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Top Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topFarmers.map((farmer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center font-bold text-green-600">
                      {index + 1}
                    </div>
                    <span className="font-medium">{farmer.name}</span>
                  </div>
                  <span className="font-bold text-primary">₹{farmer.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Product Performance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.productPerformance.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm text-muted-foreground">{category.sales} sales</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{
                      width: `${(category.sales / Math.max(...analytics.productPerformance.map(c => c.sales))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
