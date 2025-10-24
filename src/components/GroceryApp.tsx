import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, ChevronLeft, ChevronRight, Star, Heart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import SearchAutocomplete from './SearchAutocomplete';

// Dummy data for products
const smartBasketProducts = [
  {
    id: 1,
    name: "Fresh Beetroot (Loose)",
    brand: "fresho!",
    image: "🥕",
    weight: "1 kg",
    currentPrice: 54.72,
    originalPrice: 72,
    discount: 24,
    category: "vegetables"
  },
  {
    id: 2,
    name: "Capsicum - Green (Loose)",
    brand: "fresho!",
    image: "🫑",
    weight: "1 kg",
    currentPrice: 50,
    originalPrice: 87,
    discount: 43,
    category: "vegetables",
    specialOffer: "Har Din Sasta!"
  },
  {
    id: 3,
    name: "Coriander Leaves (Loose)",
    brand: "fresho!",
    image: "🌿",
    weight: "100 gm",
    currentPrice: 12,
    originalPrice: 15,
    discount: 20,
    category: "herbs"
  },
  {
    id: 4,
    name: "Ladies Finger (Loose)",
    brand: "fresho!",
    image: "🫒",
    weight: "500 gm",
    currentPrice: 25,
    originalPrice: 35,
    discount: 29,
    category: "vegetables"
  }
];

const bestSellersProducts = [
  {
    id: 5,
    name: "Bodyguard Baby Wet Wipes with Vitamin E & Aloe Vera",
    brand: "Bodyguard",
    image: "🧻",
    weight: "72 Pulls - Pack of 2",
    currentPrice: 250,
    originalPrice: 300,
    discount: 17,
    category: "baby-care"
  },
  {
    id: 6,
    name: "Dabur Baby Wipes With Moisture Lock Cap",
    brand: "Dabur",
    image: "🧻",
    weight: "480 wipes - (Pack of 6)",
    currentPrice: 859.68,
    originalPrice: 950,
    discount: 10,
    category: "baby-care"
  },
  {
    id: 7,
    name: "Huggies Baby Wipes",
    brand: "Huggies",
    image: "🧻",
    weight: "80 wipes",
    currentPrice: 180,
    originalPrice: 220,
    discount: 18,
    category: "baby-care"
  }
];

const topOffers = [
  { title: "DEALS OF THE WEEK", subtitle: "View offers" },
  { title: "BIG PACK BIGGER DISCOUNTS", subtitle: "View offers" },
  { title: "COMBOS YOU CAN'T MISS", subtitle: "View offers" },
  { title: "THE ₹30 CORNER", subtitle: "View offers" }
];

const categories = [
  {
    name: "Fruits and Vegetables",
    items: [
      { name: "Fresh Vegetables", image: "🥕", discount: "MIN 27% OFF" },
      { name: "Fresh Fruits", image: "🍎", discount: "MIN 27% OFF" },
      { name: "Cuts & Exotics", image: "🥝", discount: "MIN 27% OFF" },
      { name: "Herbs & Seasonings", image: "🌿", discount: "MIN 27% OFF" }
    ]
  },
  {
    name: "Your Daily Staples",
    items: [
      { name: "Rice & Grains", image: "🌾", discount: "UP TO 30% OFF" },
      { name: "Dal & Pulses", image: "🫘", discount: "UP TO 25% OFF" },
      { name: "Flour & Atta", image: "🌾", discount: "UP TO 20% OFF" },
      { name: "Cooking Oil", image: "🫒", discount: "UP TO 15% OFF" },
      { name: "Oats & Cereals", image: "🥣", discount: "UP TO 35% OFF" },
      { name: "Sugar & Salt", image: "🧂", discount: "UP TO 20% OFF" }
    ]
  },
  {
    name: "Beverages",
    items: [
      { name: "Tea & Coffee", image: "☕", discount: "UP TO 50% OFF" },
      { name: "Juices & Drinks", image: "🧃", discount: "UP TO 40% OFF" },
      { name: "Soft Drinks", image: "🥤", discount: "UP TO 30% OFF" },
      { name: "Energy Drinks", image: "⚡", discount: "UP TO 25% OFF" },
      { name: "Health Drinks", image: "🥛", discount: "UP TO 35% OFF" },
      { name: "Water & Soda", image: "💧", discount: "UP TO 20% OFF" }
    ]
  },
  {
    name: "Snacks Store",
    items: [
      { name: "Chips & Namkeen", image: "🍿", discount: "UP TO 50% OFF" },
      { name: "Biscuits & Cookies", image: "🍪", discount: "UP TO 40% OFF" },
      { name: "Instant Noodles", image: "🍜", discount: "UP TO 30% OFF" },
      { name: "Dry Fruits & Nuts", image: "🥜", discount: "UP TO 25% OFF" }
    ]
  },
  {
    name: "Cleaning & Household",
    items: [
      { name: "Surface Cleaners", image: "🧽", discount: "UP TO 40% OFF" },
      { name: "Detergents", image: "🧴", discount: "UP TO 50% OFF" },
      { name: "Garbage Bags", image: "🗑️", discount: "UP TO 25% OFF" },
      { name: "Air Fresheners", image: "🌸", discount: "UP TO 30% OFF" }
    ]
  },
  {
    name: "Beauty and Hygiene",
    items: [
      { name: "Shampoo & Conditioner", image: "🧴", discount: "UP TO 50% OFF" },
      { name: "Body Lotion", image: "🧴", discount: "UP TO 40% OFF" },
      { name: "Perfume & Deo", image: "💨", discount: "UP TO 35% OFF" },
      { name: "Shaving Cream", image: "🪒", discount: "UP TO 30% OFF" },
      { name: "Face Wash", image: "🧼", discount: "UP TO 25% OFF" },
      { name: "Hand Sanitizer", image: "🧴", discount: "UP TO 20% OFF" }
    ]
  },
  {
    name: "Home and Kitchen",
    items: [
      { name: "Utensils", image: "🍴", discount: "UP TO 50% OFF" },
      { name: "Cleaning Brushes", image: "🧽", discount: "MIN 25% OFF" },
      { name: "Small Appliances", image: "🔌", discount: "UP TO 40% OFF" },
      { name: "Storage Containers", image: "📦", discount: "STARTING AT ₹99" },
      { name: "Buckets & Mugs", image: "🪣", discount: "UP TO 30% OFF" },
      { name: "Kitchen Tools", image: "🔪", discount: "UP TO 35% OFF" }
    ]
  }
];

const GroceryApp = () => {
  const [cart, setCart] = useState<{[key: number]: number}>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    
    // Add cart bounce animation
    const cartElement = document.querySelector('.cart-icon');
    if (cartElement) {
      cartElement.classList.add('cart-bounce');
      setTimeout(() => {
        cartElement.classList.remove('cart-bounce');
      }, 600);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % bestSellersProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + bestSellersProducts.length) % bestSellersProducts.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GroceryMart</h1>
                <p className="text-xs text-gray-500">Fresh & Fast</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchAutocomplete 
                onProductSelect={(product) => {
                  console.log('Product selected:', product);
                  // You can add navigation to product details here
                }}
                onAddToCart={addToCart}
              />
            </div>

            {/* Cart */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="relative cart-icon">
                <ShoppingCart className="w-6 h-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {getCartCount()}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <SearchAutocomplete 
                onProductSelect={(product) => {
                  console.log('Product selected:', product);
                  setIsMenuOpen(false);
                }}
                onAddToCart={addToCart}
              />
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Smart Basket */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Smart Basket</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">View All</Button>
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {smartBasketProducts.map((product) => (
              <Card key={product.id} className="group grocery-card-hover grocery-fade-in">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <div className="text-6xl text-center mb-2">{product.image}</div>
                    <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {product.discount}% OFF
                    </div>
                    {product.specialOffer && (
                      <div className="absolute top-0 right-0 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {product.specialOffer}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
                    <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.weight}</p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">₹{product.currentPrice}</span>
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => addToCart(product.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium grocery-button-bounce"
                    >
                      Add
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">Show More</Button>
              <Button variant="ghost" size="sm" onClick={prevSlide}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={nextSlide}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestSellersProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <div className="text-6xl text-center mb-2">{product.image}</div>
                      <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {product.discount}% OFF
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
                      <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.weight}</p>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">₹{product.currentPrice}</span>
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => addToCart(product.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium grocery-button-bounce"
                      >
                        Add
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Top Offers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topOffers.map((offer, index) => (
              <Card key={index} className="bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                  <p className="text-sm opacity-90">{offer.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Category Grids */}
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {category.items.map((item, itemIndex) => (
                <Card key={itemIndex} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-3">{item.image}</div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">{item.name}</h3>
                    <p className="text-xs text-green-600 font-medium">{item.discount}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        {/* Promotional Banner */}
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex-1 mb-6 md:mb-0">
                  <h2 className="text-3xl font-bold mb-2">Tea Time Bakes</h2>
                  <p className="text-lg mb-4">Bakery, Cakes & more.</p>
                  <div className="text-2xl font-bold mb-4">UP TO 50% OFF</div>
                  <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold">
                    SHOP NOW
                  </Button>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-6xl mb-4">🍰</div>
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">GroceryMart</h3>
                  <p className="text-sm text-gray-400">Fresh & Fast</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted online grocery store delivering fresh products to your doorstep.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Support</h4>
              <div className="space-y-2">
                <p className="text-gray-400">📞 +91 9876543210</p>
                <p className="text-gray-400">✉️ support@grocerymart.com</p>
                <p className="text-gray-400">🕒 24/7 Support</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 GroceryMart. All rights reserved. | 
              <a href="#" className="hover:text-white transition-colors ml-1">Privacy Policy</a> | 
              <a href="#" className="hover:text-white transition-colors ml-1">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GroceryApp;
