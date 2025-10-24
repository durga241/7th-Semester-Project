import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, Heart, Star, Filter, LogOut, User, 
  Package, MapPin, Plus, Minus, X, ChevronDown, Leaf, Bell, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  farmer: string;
  location: string;
  category: string;
  price: number;
  unit: string;
  rating: number;
  image: string;
  description: string;
  available: number;
}

interface CartItem extends Product {
  quantity: number;
}

const CustomerDashboardNew = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Vegetables', 'Fruits', 'Grains', 'Dairy'];

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem('farmconnect_userRole');
    const userName = localStorage.getItem('farmconnect_userName');
    const userEmail = localStorage.getItem('farmconnect_userEmail');
    const jwt = localStorage.getItem('fc_jwt');

    if (!jwt || userRole !== 'customer') {
      navigate('/customer/login');
      return;
    }

    setCustomer({
      name: userName || 'Customer',
      email: userEmail || '',
      role: 'customer'
    });

    loadProducts();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const { fetchProducts } = await import('@/services/productService');
      const fetchedProducts = await fetchProducts();
      const mapped: Product[] = (fetchedProducts || []).map((p: any) => ({
        id: p.id,
        name: p.name || p.title,
        farmer: p.farmer || 'Local Farmer',
        location: p.location || 'India',
        category: p.category,
        price: p.price,
        unit: p.unit || 'kg',
        rating: p.rating || 4.5,
        image: p.image || p.imageUrl || '🌾',
        description: p.description || 'Fresh produce from local farmers',
        available: p.stock || 100
      }));
      setProducts(mapped);
      setFilteredProducts(mapped);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Price filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(p => {
        if (priceRange === 'low') return p.price <= 50;
        if (priceRange === 'medium') return p.price > 50 && p.price <= 100;
        if (priceRange === 'high') return p.price > 100;
        return true;
      });
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, priceRange, products]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    if (item.quantity + delta <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(i =>
      i.id === productId
        ? { ...i, quantity: i.quantity + delta }
        : i
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Item removed from cart');
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleLogout = () => {
    localStorage.removeItem('fc_jwt');
    localStorage.removeItem('farmconnect_userName');
    localStorage.removeItem('farmconnect_userEmail');
    localStorage.removeItem('farmconnect_userRole');
    toast.success('Logged out successfully!');
    navigate('/customer/login');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    toast.success('Order placed successfully!');
    setCart([]);
    setShowCart(false);
  };

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  CUSTOMER CONNECT
                </h1>
                <p className="text-xs text-gray-500">Fresh from Farm to Table</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-3">
                <button 
                  onClick={() => setShowCart(true)}
                  className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <span className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    Cart
                  </span>
                  {getTotalItems() > 0 && (
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
                <button className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 mr-3" />
                  {customer.name}
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {customer.name}! 🛒
          </h2>
          <p className="text-gray-600">
            Discover fresh produce and exclusive offers from local farmers
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="p-6 mb-8 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products or farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11 border-gray-300 focus:border-green-500 rounded-lg">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => c !== 'all').map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Filter */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-11 border-gray-300 focus:border-green-500 rounded-lg">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Under ₹50</SelectItem>
                <SelectItem value="medium">₹50 - ₹100</SelectItem>
                <SelectItem value="high">Above ₹100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                    {/^https?:\/\//.test(product.image) ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl">{product.image}</div>
                    )}
                  </div>
                  
                  {/* Wishlist Button */}
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>

                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Fresh
                  </div>
                </div>

                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{product.category}</p>

                  {/* Rating & Location */}
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{product.rating}</span>
                    </div>
                    <div className="flex items-center truncate max-w-[120px]">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{product.location}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline mb-3">
                    <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-500 ml-1">/{product.unit}</span>
                  </div>

                  {/* Stock Info */}
                  <p className="text-xs text-gray-500 mb-3">
                    {product.available} {product.unit} available
                  </p>

                  {/* Add to Cart Button */}
                  {cart.find(item => item.id === product.id) ? (
                    <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-1 bg-white rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="font-semibold text-gray-900">
                        {cart.find(item => item.id === product.id)?.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="p-1 bg-white rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => addToCart(product)}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Cart Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-500">Add some products to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        {/^https?:\/\//.test(item.image) ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-3xl">{item.image}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.price}/{item.unit}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 bg-white rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 bg-white rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    ₹{getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Checkout ({getTotalItems()} items)
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardNew;
