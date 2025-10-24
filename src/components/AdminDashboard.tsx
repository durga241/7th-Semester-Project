import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserManagement from '@/components/admin/UserManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import Analytics from '@/components/admin/Analytics';

interface AdminDashboardProps {
  admin: any;
  onLogout: () => void;
}

const AdminDashboard = ({ admin, onLogout }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsers: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'products', label: 'Product Management', icon: Package },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {admin?.name || 'Admin'}! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="card-gradient">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.activeUsers} active
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Listed on platform
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.pendingOrders} pending
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-3xl font-bold text-foreground">₹{stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All time earnings
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveSection('users')}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Manage Users</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveSection('products')}
                  >
                    <Package className="w-6 h-6" />
                    <span className="text-sm">Manage Products</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveSection('orders')}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span className="text-sm">View Orders</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveSection('analytics')}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'users':
        return <UserManagement />;

      case 'products':
        return <ProductManagement />;

      case 'orders':
        return <OrderManagement />;

      case 'analytics':
        return <Analytics />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
