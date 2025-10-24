import { useEffect, useState } from 'react';
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
  image: string; // emoji or URL
  description: string;
  available: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CustomerDashboardProps {
  customer: any;
  currentLocation: { state: string; district: string };
}

const CustomerDashboard = ({ customer, currentLocation }: CustomerDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { fetchProducts } = await import('@/services/productService');
        const live = await fetchProducts();
        const mapped: Product[] = (live || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          farmer: p.farmer || 'Farmer',
          location: p.location || '',
          category: p.category,
          price: p.price,
          unit: p.unit || 'kg',
          rating: p.rating || 4.5,
          image: p.image,
          description: p.description || '',
          available: p.stock || 0
        }));
        setAllProducts(mapped);
      } catch {
        setAllProducts([]);
      }
    };
    load();
  }, []);

  // Filter products based on search and filters
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    const matchesPrice = !priceRange || 
                        (priceRange === "low" && product.price <= 40) ||
                        (priceRange === "medium" && product.price > 40 && product.price <= 80) ||
                        (priceRange === "high" && product.price > 80);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {customer.name}! 🛒
            </h1>
            <p className="text-muted-foreground">
              {currentLocation.state ? `Browsing products in ${currentLocation.district}, ${currentLocation.state}` : 'Browse fresh products from local farmers'}
            </p>
          </div>
          
          <Button 
            onClick={() => setShowCart(true)}
            className="btn-accent relative mt-4 md:mt-0"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart ({getTotalItems()})
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {getTotalItems()}
              </span>
            )}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="card-gradient mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products or farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-farm pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="input-farm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Leafy Greens">Leafy Greens</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="input-farm">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Prices</SelectItem>
                  <SelectItem value="low">Under ₹40/kg</SelectItem>
                  <SelectItem value="medium">₹40-80/kg</SelectItem>
                  <SelectItem value="high">Above ₹80/kg</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setPriceRange("");
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="card-gradient hover:scale-105 transition-transform">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  {/^https?:\/\//.test(product.image) ? (
                    <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded" />
                  ) : (
                    <div className="text-4xl mb-3">{product.image}</div>
                  )}
                  <h3 className="text-xl font-semibold text-foreground mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                    <span className="text-muted-foreground">per {product.unit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                      {product.rating}
                    </div>
                    <span>{product.available} {product.unit} available</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {product.farmer} • {product.location}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>

                <div className="flex items-center justify-between">
                  {cart.find(item => item.id === product.id) ? (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-semibold min-w-[2rem] text-center">
                        {cart.find(item => item.id === product.id)?.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToCart(product)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => addToCart(product)}
                      className="btn-accent"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Shopping Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white max-h-[80vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCart(false)}
                  >
                    ✕
                  </Button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.image}</span>
                            <div>
                              <h4 className="font-semibold text-foreground">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">₹{item.price}/{item.unit}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-xl font-bold text-foreground mb-4">
                        <span>Total:</span>
                        <span>₹{getTotalPrice()}</span>
                      </div>
                      
                      <Button 
                        className="w-full btn-hero"
                        onClick={() => {
                          alert(`Order placed successfully! Total: ₹${getTotalPrice()}`);
                          setCart([]);
                          setShowCart(false);
                        }}
                      >
                        Checkout
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;