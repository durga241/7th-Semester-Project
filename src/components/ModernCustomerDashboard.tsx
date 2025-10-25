import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, LogOut, Bell, Home as HomeIcon, Package, User,
  Search, Heart, Star, Plus, Minus, X, Trash2, CreditCard, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { calculateDiscountedPrice, getEffectivePrice } from '@/lib/priceUtils';

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
  stock: number;
  discount?: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: string;
  products: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered';
  paymentStatus: 'Pending' | 'Paid';
  date: string;
  orderId: string;
}

interface ModernCustomerDashboardProps {
  customer: any;
  onLogout: () => void;
}

const ModernCustomerDashboard = ({ customer, onLogout }: ModernCustomerDashboardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active section from URL
  const getActiveSectionFromURL = () => {
    const path = location.pathname;
    if (path.includes('/cart')) return 'cart';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/wishlist')) return 'wishlist';
    if (path.includes('/products')) return 'products';
    return 'home';
  };
  
  const [activeSection, setActiveSection] = useState<'home' | 'products' | 'cart' | 'orders' | 'profile' | 'wishlist' | 'about' | 'contact'>(getActiveSectionFromURL());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Update active section when URL changes
  useEffect(() => {
    setActiveSection(getActiveSectionFromURL());
  }, [location.pathname]);
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const userName = customer?.name || customer?.email?.split('@')[0] || 'Customer';

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { fetchProducts } = await import('@/services/productService');
        const products = await fetchProducts();
        const mapped: Product[] = (products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          farmer: p.farmer || 'Farmer',
          location: p.location || 'India',
          category: p.category,
          price: p.price,
          unit: p.unit || 'kg',
          rating: p.rating || 4.5,
          image: p.image,
          description: p.description || `Fresh ${p.name}`,
          stock: p.stock || 0,
          discount: p.discount || 0
        }));
        setAllProducts(mapped);
        console.log('[CUSTOMER] Loaded products:', mapped.length);
      } catch (error) {
        console.error('[CUSTOMER] Error loading products:', error);
        setAllProducts([]);
      }
    };
    loadProducts();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${customer?.email}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [customer]);

  // Save cart to localStorage
  useEffect(() => {
    if (customer?.email) {
      localStorage.setItem(`cart_${customer.email}`, JSON.stringify(cart));
    }
  }, [cart, customer]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

  // Filter products
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success(`Increased quantity of ${product.name}`);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success(`${product.name} added to cart!`);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => {
      const effectivePrice = getEffectivePrice(item.price, item.discount);
      return total + (effectivePrice * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Checkout function
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    try {
      // TODO: Integrate Razorpay here
      toast.info('Payment integration coming soon!');
      
      // For now, create order without payment
      const newOrder: Order = {
        id: Date.now().toString(),
        products: [...cart],
        totalAmount: getTotalAmount(),
        status: 'Pending',
        paymentStatus: 'Pending',
        date: new Date().toLocaleDateString(),
        orderId: `ORD${Date.now()}`
      };
      
      setOrders([newOrder, ...orders]);
      setCart([]);
      setActiveSection('orders');
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order');
    }
  };

  // Categories
  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy', 'Other'];

  // Render Home Section (Same as main home page)
  const renderHome = () => (
    <div className="space-y-0">
      {/* Hero Section - Same as home page */}
      <div 
        className="relative bg-cover bg-center h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: "url('/farmers-market (1).jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            Connecting Farmers & Customers Directly
          </h1>
          <p className="text-xl mb-8 font-['Poppins']">Fresh produce from farm to your table</p>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search fresh produce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white text-gray-900 rounded-lg border-0 shadow-sm text-base font-['Poppins']"
              />
            </div>
            <Button 
              onClick={() => setActiveSection('products')}
              className="h-14 px-10 bg-green-600 hover:bg-green-700 text-white font-['Poppins'] text-base rounded-lg shadow-md"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Latest & Recommended Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">Latest & Recommended</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setActiveSection('products')}
                className="text-green-600 hover:text-green-700 font-['Poppins']"
              >
                View All
              </Button>
              <button className="p-2 hover:bg-gray-200 rounded-full">
                <span>←</span>
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-full">
                <span>→</span>
              </button>
            </div>
          </div>
          
          {/* Category Filter Buttons */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {categories.map(cat => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap font-['Poppins'] ${
                  selectedCategory === cat 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or category filter</p>
                <Button 
                  onClick={() => setActiveSection('products')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              (selectedCategory === 'All' 
                ? allProducts.slice(0, 8) 
                : allProducts.filter(p => p.category === selectedCategory).slice(0, 8)
              ).map(product => (
              <Card key={product.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300">
                <CardContent className="p-4">
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                    {product.image && (product.image.startsWith('http://') || product.image.startsWith('https://') || product.image.startsWith('/')) ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) parent.innerHTML = '<div class="text-6xl">🌾</div>';
                        }}
                      />
                    ) : (
                      <div className="text-6xl">{product.image || '🌾'}</div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 font-['Poppins']">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 font-['Poppins']">{product.farmer}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.discount && product.discount > 0 ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">{product.discount}% OFF</span>
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-green-600">₹{getEffectivePrice(product.price, product.discount).toFixed(2)}</span>
                            <span className="text-sm text-gray-500">/{product.unit}</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                          <span className="text-sm text-gray-500">/{product.unit}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (wishlist.includes(product.id)) {
                          setWishlist(wishlist.filter(id => id !== product.id));
                        } else {
                          setWishlist([...wishlist, product.id]);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Heart 
                        className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                      />
                    </button>
                  </div>
                  <Button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-green-600 hover:bg-green-700 font-['Poppins']"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Products Section
  const renderProducts = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search products or farmers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
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
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <Card key={product.id} className="hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                  {product.image && (product.image.startsWith('http://') || product.image.startsWith('https://') || product.image.startsWith('/')) ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.innerHTML = '<div class="text-6xl">🌾</div>';
                      }}
                    />
                  ) : (
                    <div className="text-6xl">{product.image || '🌾'}</div>
                  )}
                </div>
                
                {/* Product Info */}
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">By {product.farmer}</p>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-gray-500 ml-2">Stock: {product.stock}</span>
                </div>
                
                {/* Price and Actions */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                    <span className="text-sm text-gray-500">/{product.unit}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (wishlist.includes(product.id)) {
                        setWishlist(wishlist.filter(id => id !== product.id));
                      } else {
                        setWishlist([...wishlist, product.id]);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Heart 
                      className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </button>
                </div>
                
                {/* Add to Cart Button */}
                <Button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  // Render Cart Section
  const renderCart = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Shopping Cart</h2>
      
      {cart.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some products to get started!</p>
            <Button onClick={() => setActiveSection('products')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="text-4xl">{item.image}</div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-gray-600 text-sm">By {item.farmer}</p>
                      <div className="mt-1">
                        {item.discount && item.discount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 line-through text-sm">₹{item.price}</span>
                            <span className="text-green-600 font-bold">₹{getEffectivePrice(item.price, item.discount).toFixed(2)}/{item.unit}</span>
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">{item.discount}% OFF</span>
                          </div>
                        ) : (
                          <p className="text-green-600 font-bold">₹{item.price}/{item.unit}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Total Price */}
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{(getEffectivePrice(item.price, item.discount) * item.quantity).toFixed(2)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({getTotalItems()})</span>
                  <span className="font-semibold">₹{getTotalAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">₹{getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  // Render Orders Section
  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">My Orders</h2>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
            <Button onClick={() => setActiveSection('products')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{order.orderId}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Placed on {order.date}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">Payment: {order.paymentStatus}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.products.map(product => (
                    <div key={product.id} className="flex items-center gap-4 border-b pb-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.image && (product.image.startsWith('http://') || product.image.startsWith('https://') || product.image.startsWith('/')) ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) parent.innerHTML = '<div class="text-2xl">🌾</div>';
                            }}
                          />
                        ) : (
                          <div className="text-2xl">{product.image || '🌾'}</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                      </div>
                      <p className="font-bold">₹{(product.price * product.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-lg font-bold">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render Profile Section
  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">My Profile</h2>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{userName}</h3>
              <p className="text-gray-600">{customer?.email}</p>
              <p className="text-sm text-gray-500 mt-1">Customer Account</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Account Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Email:</span> {customer?.email}</p>
                <p><span className="text-gray-600">Phone:</span> {customer?.phone || 'Not provided'}</p>
                <p><span className="text-gray-600">Member since:</span> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Order Statistics</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Total Orders:</span> {orders.length}</p>
                <p><span className="text-gray-600">Items in Cart:</span> {getTotalItems()}</p>
                <p><span className="text-gray-600">Wishlist Items:</span> {wishlist.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render Wishlist
  const renderWishlist = () => {
    const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));
    
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">My Wishlist</h2>
        
        {wishlistProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Add products you love to your wishlist!</p>
              <Button onClick={() => navigate('/customer/products')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map(product => (
              <Card key={product.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300">
                <CardContent className="p-4">
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                    {product.image && (product.image.startsWith('http://') || product.image.startsWith('https://') || product.image.startsWith('/')) ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) parent.innerHTML = '<div class="text-6xl">🌾</div>';
                        }}
                      />
                    ) : (
                      <div className="text-6xl">{product.image || '🌾'}</div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.farmer}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                      <span className="text-sm text-gray-500">/{product.unit}</span>
                    </div>
                    <button
                      onClick={() => setWishlist(wishlist.filter(id => id !== product.id))}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <Button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render About Us Page
  const renderAbout = () => (
    <div className="space-y-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-['Poppins']">About FarmConnect</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-['Poppins']">
          We are revolutionizing the way farmers and customers connect, ensuring fresh produce reaches your table directly from the farm.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <Card className="p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">Our Mission</h2>
          <p className="text-gray-600 mb-4 font-['Poppins']">
            To bridge the gap between farmers and consumers, ensuring fair prices for farmers and fresh, quality produce for customers.
          </p>
          <p className="text-gray-600 font-['Poppins']">
            We believe in supporting local agriculture and sustainable farming practices that benefit both the environment and our communities.
          </p>
        </Card>
        <Card className="p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">Our Vision</h2>
          <p className="text-gray-600 mb-4 font-['Poppins']">
            To create a transparent marketplace where farmers can showcase their products and customers can access the freshest produce.
          </p>
          <p className="text-gray-600 font-['Poppins']">
            We envision a future where every meal is made with ingredients that support local farmers and sustainable practices.
          </p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 text-center bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">Sustainable</h3>
          <p className="text-gray-600 font-['Poppins']">Supporting eco-friendly farming practices</p>
        </Card>
        <Card className="p-6 text-center bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">Direct</h3>
          <p className="text-gray-600 font-['Poppins']">Direct connection between farmers and customers</p>
        </Card>
        <Card className="p-6 text-center bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💚</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">Fresh</h3>
          <p className="text-gray-600 font-['Poppins']">Always fresh produce from farm to table</p>
        </Card>
      </div>
    </div>
  );

  // Render Contact Page
  const renderContact = () => (
    <div className="space-y-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-['Poppins']">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-['Poppins']">
          Get in touch with us for any questions or support.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Card className="p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">Our Location</h2>
          <div className="space-y-6">
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="font-semibold text-gray-900 font-['Poppins'] mb-2">FarmConnect Office</h3>
                <p className="text-gray-600 font-['Poppins'] text-sm">123 Farm Street, Agriculture City, India</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 font-['Poppins'] text-sm">Email</h3>
                  <p className="text-gray-600 font-['Poppins'] text-sm">support@farmconnect.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">📞</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 font-['Poppins'] text-sm">Phone</h3>
                  <p className="text-gray-600 font-['Poppins'] text-sm">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">Send us a Message</h2>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-['Poppins']">Name</label>
              <Input className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-['Poppins']">Email</label>
              <Input type="email" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-['Poppins']">Message</label>
              <textarea rows={4} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-['Poppins']">
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );

  // Render active section
  const renderContent = () => {
    switch (activeSection) {
      case 'home': return renderHome();
      case 'about': return renderAbout();
      case 'products': return renderProducts();
      case 'contact': return renderContact();
      case 'cart': return renderCart();
      case 'orders': return renderOrders();
      case 'wishlist': return renderWishlist();
      case 'profile': return renderProfile();
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center p-2">
              <img 
                src="/logo.png" 
                alt="FarmConnect Logo" 
                className="h-16 w-auto cursor-pointer"
                onClick={() => setActiveSection('home')}
              />
            </div>

            {/* Center - Navigation Links (Same as Home Page) */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => {
                  setActiveSection('home');
                  navigate('/customer/dashboard');
                }}
                className={`text-sm font-medium transition-colors font-['Poppins'] ${
                  activeSection === 'home' ? 'text-green-800' : 'text-gray-700 hover:text-green-800'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveSection('about')}
                className={`text-sm font-medium transition-colors font-['Poppins'] ${
                  activeSection === 'about' ? 'text-green-800' : 'text-gray-700 hover:text-green-800'
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => {
                  setActiveSection('products');
                  navigate('/customer/products');
                }}
                className={`text-sm font-medium transition-colors font-['Poppins'] ${
                  activeSection === 'products' ? 'text-green-800' : 'text-gray-700 hover:text-green-800'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveSection('contact')}
                className={`text-sm font-medium transition-colors font-['Poppins'] ${
                  activeSection === 'contact' ? 'text-green-800' : 'text-gray-700 hover:text-green-800'
                }`}
              >
                Contact
              </button>
            </div>

            {/* Right Side - Avatar Only */}
            <div className="flex items-center gap-4">
              {/* User Avatar Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-green-700 transition-colors"
                >
                  {userName.charAt(0).toUpperCase()}
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/customer/cart');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">My Cart</p>
                        </div>
                        {cart.length > 0 && (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            {cart.length}
                          </span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/customer/orders');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Package className="w-5 h-5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">My Orders</p>
                        </div>
                        {orders.length > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {orders.length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/customer/wishlist');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Heart className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Wishlist</span>
                        {wishlist.length > 0 && (
                          <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                            {wishlist.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={activeSection === 'home' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}>
        {renderContent()}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="FarmConnect Logo" 
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-400 mb-4 font-['Poppins']">
                Connecting farmers directly with customers for fresh, organic produce. 
                Supporting local agriculture and sustainable farming practices.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                  <span className="sr-only">Instagram</span>
                  📷
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 font-['Poppins']">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="text-gray-400 hover:text-green-600 transition-colors font-['Poppins']"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('products')}
                    className="text-gray-400 hover:text-green-600 transition-colors font-['Poppins']"
                  >
                    Products
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="text-gray-400 hover:text-green-600 transition-colors font-['Poppins']"
                  >
                    Farmers
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="text-gray-400 hover:text-green-600 transition-colors font-['Poppins']"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 font-['Poppins']">Support</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="text-gray-400 hover:text-green-600 transition-colors font-['Poppins']"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="text-gray-400 hover:text-green-600 transition-colors font-['Poppins']"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="text-gray-400 hover:text-green-600 transition-colors font-['Poppins']"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="text-gray-400 hover:text-green-600 transition-colors font-['Poppins']"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 font-['Poppins']">
              © 2024 FarmConnect. All rights reserved. Made with ❤️ for farmers and customers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernCustomerDashboard;
