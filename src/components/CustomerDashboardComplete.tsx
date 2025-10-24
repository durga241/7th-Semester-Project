import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Heart, Package, Bell, HelpCircle, 
  TrendingUp, Search, Filter, MapPin, Star, 
  CreditCard, Download, MessageCircle, LogOut,
  Home, Store, GitCompare, History, User, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CustomerDashboardProps {
  userName: string;
  onLogout: () => void;
}

type ViewType = 'overview' | 'marketplace' | 'compare' | 'cart' | 'orders' | 'wishlist' | 'notifications' | 'support';

export default function CustomerDashboardComplete({ userName, onLogout }: CustomerDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const categories = ['All', 'Fruits', 'Vegetables', 'Grains', 'Dairy', 'Organic'];

  // Sample data - replace with API calls
  const sampleProducts = [
    { id: 1, name: 'Fresh Tomatoes', price: 40, unit: 'kg', farmer: 'Ravi Kumar', rating: 4.5, image: '🍅', category: 'Vegetables' },
    { id: 2, name: 'Organic Apples', price: 120, unit: 'kg', farmer: 'Sunita Devi', rating: 4.8, image: '🍎', category: 'Fruits' },
    { id: 3, name: 'Fresh Milk', price: 60, unit: 'liter', farmer: 'Mohan Singh', rating: 4.6, image: '🥛', category: 'Dairy' },
  ];

  const sampleOrders = [
    { id: 'ORD001', product: 'Fresh Tomatoes', quantity: 5, price: 200, status: 'Delivered', date: '2025-01-10' },
    { id: 'ORD002', product: 'Organic Apples', quantity: 3, price: 360, status: 'In Transit', date: '2025-01-12' },
  ];

  const sampleNotifications = [
    { id: 1, message: 'Your order #ORD002 has been shipped', time: '2 hours ago', read: false },
    { id: 2, message: 'New offer: 20% off on organic products', time: '1 day ago', read: false },
  ];

  // Dashboard Overview
  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
        <Button onClick={onLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <Package className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">{wishlist.length}</p>
              </div>
              <Heart className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cart Items</p>
                <p className="text-2xl font-bold text-gray-900">{cart.length}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹1,250</p>
              </div>
              <Wallet className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => setCurrentView('marketplace')}
          className="h-24 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
        >
          <div className="flex flex-col items-center gap-2">
            <Store className="w-8 h-8" />
            <span className="text-lg">Explore Products</span>
          </div>
        </Button>

        <Button 
          onClick={() => setCurrentView('compare')}
          className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <div className="flex flex-col items-center gap-2">
            <GitCompare className="w-8 h-8" />
            <span className="text-lg">Compare Prices</span>
          </div>
        </Button>

        <Button 
          onClick={() => setCurrentView('orders')}
          className="h-24 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <div className="flex flex-col items-center gap-2">
            <History className="w-8 h-8" />
            <span className="text-lg">View Orders</span>
          </div>
        </Button>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleOrders.slice(0, 3).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{order.product}</p>
                  <p className="text-sm text-gray-600">Order #{order.id} • {order.date}</p>
                </div>
                <Badge className={order.status === 'Delivered' ? 'bg-green-500' : 'bg-blue-500'}>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trending Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleProducts.map(product => (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-4xl">
                  {product.image}
                </div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">by {product.farmer}</p>
                <p className="text-lg font-bold text-green-600 mt-2">₹{product.price}/{product.unit}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{product.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Marketplace View
  const MarketplaceView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Sort by Price
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat)}
            className="whitespace-nowrap"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sampleProducts.map(product => (
          <Card key={product.id} className="hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-5xl">
                {product.image}
              </div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-gray-600">by {product.farmer}</p>
              <div className="flex items-center gap-1 my-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{product.rating}</span>
              </div>
              <p className="text-xl font-bold text-green-600">₹{product.price}/{product.unit}</p>
              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1"
                  onClick={() => setCart([...cart, product])}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setWishlist([...wishlist, product])}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Compare Prices View
  const ComparePricesView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Compare Prices</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Tomatoes - Price Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { farmer: 'Ravi Kumar', price: 40, location: 'Pune', rating: 4.5, distance: '5 km' },
              { farmer: 'Amit Patil', price: 38, location: 'Mumbai', rating: 4.7, distance: '12 km' },
              { farmer: 'Sunita Devi', price: 42, location: 'Nashik', rating: 4.3, distance: '8 km' },
              { farmer: 'Mohan Singh', price: 35, location: 'Pune', rating: 4.8, distance: '3 km' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-semibold">{item.farmer}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {item.location} • {item.distance}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{item.price}/kg</p>
                  <Button className="mt-2">Select</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Cart & Checkout View
  const CartView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

      {cart.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
            <Button onClick={() => setCurrentView('marketplace')} className="mt-4">
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="p-4 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">by {item.farmer}</p>
                    <p className="text-lg font-bold text-green-600">₹{item.price}/{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">-</Button>
                    <span className="w-12 text-center">1</span>
                    <Button variant="outline" size="sm">+</Button>
                  </div>
                  <Button variant="destructive" size="sm">Remove</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{cart.reduce((sum, item) => sum + item.price, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold">₹40</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">₹{cart.reduce((sum, item) => sum + item.price, 0) + 40}</span>
                </div>
                <Input placeholder="Enter coupon code" />
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  // Orders View
  const OrdersView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

      <div className="space-y-4">
        {sampleOrders.map(order => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-lg">{order.product}</p>
                      <p className="text-sm text-gray-600">Order #{order.id} • {order.date}</p>
                      <p className="text-sm text-gray-600">Quantity: {order.quantity} kg</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">₹{order.price}</p>
                  <Badge className={order.status === 'Delivered' ? 'bg-green-500 mt-2' : 'bg-blue-500 mt-2'}>
                    {order.status}
                  </Badge>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="w-4 h-4 mr-2" />
                      Rate
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Wishlist View
  const WishlistView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Your wishlist is empty</p>
            <Button onClick={() => setCurrentView('marketplace')} className="mt-4">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">by {product.farmer}</p>
                <p className="text-xl font-bold text-green-600 mt-2">₹{product.price}/{product.unit}</p>
                <Button className="w-full mt-4" onClick={() => setCart([...cart, product])}>
                  Move to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Notifications View
  const NotificationsView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>

      <div className="space-y-3">
        {sampleNotifications.map(notif => (
          <Card key={notif.id} className={!notif.read ? 'border-l-4 border-l-green-600' : ''}>
            <CardContent className="p-4 flex items-start gap-4">
              <Bell className="w-5 h-5 text-green-600 mt-1" />
              <div className="flex-1">
                <p className="font-medium">{notif.message}</p>
                <p className="text-sm text-gray-600 mt-1">{notif.time}</p>
              </div>
              {!notif.read && <Badge>New</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Support View
  const SupportView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Support & Help</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Your Name" />
            <Input placeholder="Email" type="email" />
            <textarea 
              className="w-full border rounded-lg p-3 min-h-[120px]" 
              placeholder="Describe your issue..."
            />
            <Button className="w-full">Send Message</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              FAQs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { q: 'How do I track my order?', a: 'Go to My Orders and click on the order to see tracking details.' },
              { q: 'What is the refund policy?', a: 'Full refund within 7 days if product is damaged or incorrect.' },
              { q: 'How do I contact a farmer?', a: 'Click on the farmer name on any product to send a message.' },
            ].map((faq, idx) => (
              <div key={idx} className="border-b pb-3">
                <p className="font-semibold">{faq.q}</p>
                <p className="text-sm text-gray-600 mt-1">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="FarmConnect" className="h-10" />
              <span className="font-bold text-xl">FarmConnect</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="relative"
                onClick={() => setCurrentView('notifications')}
              >
                <Bell className="w-5 h-5" />
                {sampleNotifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setCurrentView('cart')}
                className="relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-24">
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Dashboard', icon: Home },
                { id: 'marketplace', label: 'Browse Products', icon: Store },
                { id: 'compare', label: 'Compare Prices', icon: GitCompare },
                { id: 'cart', label: 'Cart', icon: ShoppingCart },
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'support', label: 'Support', icon: HelpCircle },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as ViewType)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {currentView === 'overview' && <DashboardOverview />}
            {currentView === 'marketplace' && <MarketplaceView />}
            {currentView === 'compare' && <ComparePricesView />}
            {currentView === 'cart' && <CartView />}
            {currentView === 'orders' && <OrdersView />}
            {currentView === 'wishlist' && <WishlistView />}
            {currentView === 'notifications' && <NotificationsView />}
            {currentView === 'support' && <SupportView />}
          </main>
        </div>
      </div>
    </div>
  );
}
