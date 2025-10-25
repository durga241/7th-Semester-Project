import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, ChevronLeft, ChevronRight, Heart, Menu, X, UserCircle, Star, ShoppingBag, LogOut, Camera, Upload, Trash2, AlertTriangle, Sprout } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import banner1 from '../assets/depositphotos_428702092-stock-photo-assortment-fresh-organic-vegetables-fruits.jpg';
import banner2 from '../assets/Screenshot 2025-10-20 114953.png';
import banner3 from '../assets/Screenshot 2025-10-21 153357.png';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { useToast } from './ui/use-toast';
import ModernCustomerDashboard from './ModernCustomerDashboard';
import ComprehensiveFarmerDashboard from './ComprehensiveFarmerDashboard';
import AuthModal from './AuthModal';
import CustomerLoginModal from './CustomerLoginModal';
import FarmerAuthModal from './FarmerAuthModal';

interface Product {
  id: number;
  _id?: string;
  name: string;
  price: number;
  farmer: string;
  category: string;
  image: string;
  stock: number;
  rating: number;
  discount?: number;
}

const FarmConnectMarketplace = () => {
  const [userRole, setUserRole] = useState<'farmer' | 'customer' | null>(null);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{[key: string]: {product: Product, quantity: number}}>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [showFarmerAuth, setShowFarmerAuth] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('Please login to access the cart.');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState<'home' | 'myorders' | 'wishlist' | 'editprofile'>('home');
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [profileData, setProfileData] = useState({
    name: userName,
    email: userName + '@example.com',
    phone: '',
    profilePicture: ''
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { toast } = useToast();

  // Fetch user profile from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('fc_jwt');
      if (!token || !userRole) return;

      try {
        const response = await fetch('http://localhost:3001/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.user) {
            setProfileData({
              name: data.user.name || userName,
              email: data.user.email || '',
              phone: data.user.phone || '',
              profilePicture: data.user.profilePicture || ''
            });
            if (data.user.profilePicture) {
              setProfilePicturePreview(data.user.profilePicture);
            }
          }
        }
      } catch (error) {
        console.error('[PROFILE] Error fetching profile:', error);
      }
    };

    if (userRole) {
      fetchUserProfile();
    }
  }, [userRole, userName]);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('fc_jwt');
      const userId = localStorage.getItem('fc_user_id');
      
      // Only fetch if user is logged in
      if (!token || !userId) return;
      
      try {
        console.log('[ORDERS] Fetching orders for user:', userId);
        const response = await fetch(`http://localhost:3001/api/orders/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.ok && result.orders) {
            console.log('[ORDERS] Fetched', result.orders.length, 'orders from backend');
            setOrders(result.orders);
          }
        } else {
          console.log('[ORDERS] Failed to fetch, status:', response.status);
        }
      } catch (error) {
        console.error('[ORDERS] Error fetching orders:', error);
        // Don't crash the app, just log the error
      }
    };
    
    // Fetch on mount, when viewing orders, or when user logs in
    fetchOrders();
  }, [activeView, userRole]); // Refetch when activeView changes or user logs in

  // Note: Orders are now stored in the backend database only
  // No need to sync to localStorage to avoid quota issues

  // Sync activeView and activeSection with URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/myorders') {
      setActiveView('myorders');
      setActiveSection('home');
    } else if (path === '/wishlist') {
      setActiveView('wishlist');
      setActiveSection('home');
    } else if (path === '/editprofile') {
      setActiveView('editprofile');
      setActiveSection('home');
    } else if (path === '/products') {
      setActiveView('home');
      setActiveSection('products');
    } else if (path === '/contact') {
      setActiveView('home');
      setActiveSection('contact');
    } else {
      setActiveView('home');
      setActiveSection('home');
    }
  }, [location.pathname]);

  const banners = [
    { id: 1, image: banner1, alt: 'Fresh Vegetables Banner' },
    { id: 2, image: banner2, alt: 'Farm Produce Banner' },
    { id: 3, image: banner3, alt: 'Fresh Organic Vegetables and Fruits' }
  ];

  // Load cart from localStorage on component mount and set up event listeners
  useEffect(() => {
    const savedRole = localStorage.getItem('farmconnect_userRole') as 'farmer' | 'customer' | null;
    const savedName = localStorage.getItem('farmconnect_userName');

    if (savedRole && savedName) {
      setUserRole(savedRole);
      setUserName(savedName);
    }

    // Load cart
    const savedCart = localStorage.getItem('fc_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {}
    }

    // Listen for clearCart event from PaymentSuccess page
    const handleClearCart = () => {
      console.log('Clearing cart from event');
      setCart({});
      localStorage.removeItem('fc_cart');
    };

    window.addEventListener('clearCart', handleClearCart as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('clearCart', handleClearCart as EventListener);
    };
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (Object.keys(cart).length > 0) {
      localStorage.setItem('fc_cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Auto-rotate banner carousel
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index: number) => {
    setCurrentBannerIndex(index);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      console.log('[PRODUCTS] Fetched from API:', data.products?.length || 0, 'products');
      if (data.ok && data.products) {
        const mappedProducts = data.products.map((p: any) => {
          // Get farmer name from populated farmerId or use default
          const farmerName = p.farmerId?.name || p.farmerName || userName || 'Farmer';
          console.log('[PRODUCT]', p.title, '- Farmer:', farmerName, '- Discount:', p.discount, '- Image:', p.imageUrl);
          return {
            id: p._id,
            name: p.title,
            price: p.price,
            farmer: farmerName,
            category: p.category || 'Other',
            image: p.imageUrl || '🌾',
            stock: p.quantity || p.stock || 100,
            rating: 4.5,
            status: p.status || 'available',
            discount: p.discount || 0  // ✅ ADD DISCOUNT FIELD!
          };
        });
        console.log('[PRODUCTS] Mapped products:', mappedProducts.length);
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // No default products - will show empty state
      setProducts([]);
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName('');
    setCart({});
    localStorage.removeItem('farmconnect_userRole');
    localStorage.removeItem('farmconnect_userName');
    localStorage.removeItem('fc_cart');
    localStorage.removeItem('fc_jwt');
    localStorage.removeItem('fc_user_id');
    // Don't remove orders - they should persist
    // localStorage.removeItem('fc_orders');
    navigate('/'); // Redirect to homepage
    toast({ title: 'Logged out successfully' });
  };

  const handleLoginSuccess = (role: 'farmer' | 'customer', name: string) => {
    setUserRole(role);
    setUserName(name);
    localStorage.setItem('farmconnect_userRole', role);
    localStorage.setItem('farmconnect_userName', name);
    setShowAuthModal(false);
    setShowCustomerLogin(false);
    setShowFarmerAuth(false);
    setActiveSection('home');
    toast({ title: `Welcome ${name}!` });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      // Validate form
      if (!contactForm.name || !contactForm.email || !contactForm.phone || !contactForm.message) {
        toast({
          title: 'Missing Fields',
          description: 'Please fill in all fields',
          variant: 'destructive'
        });
        setIsSubmittingContact(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactForm.email)) {
        toast({
          title: 'Invalid Email',
          description: 'Please enter a valid email address',
          variant: 'destructive'
        });
        setIsSubmittingContact(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: '✅ Message Sent!',
          description: data.message || 'We will get back to you soon.'
        });

        // Clear form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: 'Failed to Send',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      const token = localStorage.getItem('fc_jwt');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please login to delete account',
          variant: 'destructive'
        });
        setIsDeletingAccount(false);
        setShowDeleteConfirm(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/user/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // Clear all local storage
        localStorage.removeItem('fc_jwt');
        localStorage.removeItem('farmconnect_userRole');
        localStorage.removeItem('farmconnect_userName');
        localStorage.removeItem('fc_cart');

        // Reset state
        setUserRole(null);
        setUserName('');
        setCart({});
        
        // Show success message
        toast({
          title: 'Account Deleted Successfully',
          description: 'Your account has been permanently deleted',
          duration: 3000
        });

        // Close dialog
        setShowDeleteConfirm(false);

        // Redirect to home after 2 seconds
        setTimeout(() => {
          setActiveView('home');
          setActiveSection('home');
          navigate('/');
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: 'Failed to Delete Account',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!userRole) {
      setLoginPromptMessage('Please login to add items to cart.');
      setShowLoginPrompt(true);
      return;
    }
    
    if (userRole !== 'customer') {
      toast({ title: 'Only customers can add to cart', variant: 'destructive' });
      return;
    }

    const productKey = product.id.toString();
    setCart(prev => {
      const existing = prev[productKey];
      return {
        ...prev,
        [productKey]: {
          product,
          quantity: existing ? existing.quantity + quantity : quantity
        }
      };
    });

    toast({ title: '✅ Added to cart!', description: `${product.name} (${quantity} kg)` });
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show farmer dashboard if logged in as farmer
  if (userRole === 'farmer') {
    return (
      <ComprehensiveFarmerDashboard
        userName={userName}
        products={products}
        setProducts={setProducts}
        onLogout={handleLogout}
      />
    );
  }

  // Main homepage for non-logged-in users
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 shadow-sm sticky top-0 z-40">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo - Left */}
            <div className="flex items-center flex-shrink-0 mr-6">
              <img 
                src="/logo.png" 
                alt="FarmConnect Logo" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Search Bar - Center (wider) */}
            <div className="hidden md:flex flex-1 mx-0">
              <div className="w-full flex items-center bg-white rounded-md overflow-hidden border border-gray-300 shadow-sm">
                <input
                  type="text"
                  placeholder="Search for vegetables, fruits, grains, dairy products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm outline-none bg-white"
                />
                <button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 transition-colors flex items-center justify-center flex-shrink-0"
                  onClick={() => {/* Add search logic */}}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation & Actions - Right */}
            <div className="flex items-center gap-6 flex-shrink-0 ml-6">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => navigate('/')}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === '/' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => navigate('/products')}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === '/products' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
                  }`}
                >
                  Products
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === '/contact' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
                  }`}
                >
                  Contact
                </button>
              </nav>

              {/* User Actions */}
              <div className="flex items-center gap-4">
                {/* Shopping Cart */}
                <button
                  onClick={() => setShowCart(true)}
                  className="relative hover:text-orange-500 transition-colors"
                >
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  )}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all font-semibold text-lg shadow-md overflow-hidden"
                  >
                    {userRole ? (
                      profilePicturePreview ? (
                        <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        userName.charAt(0).toUpperCase()
                      )
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </button>
                {showUserDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
                      {userRole ? (
                        <>
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              {profilePicturePreview ? (
                                <img 
                                  src={profilePicturePreview} 
                                  alt="Profile" 
                                  className="w-10 h-10 rounded-full object-cover border-2 border-green-200"
                                />
                              ) : (
                                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold text-lg">
                                  {userName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                setActiveSection('home');
                                navigate('/myorders');
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                            >
                              <ShoppingBag className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                              <span className="text-gray-700 text-sm font-medium">My Orders</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                setActiveSection('home');
                                navigate('/wishlist');
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                            >
                              <Heart className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                              <span className="text-gray-700 text-sm font-medium">Wishlist</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                setActiveSection('home');
                                navigate('/editprofile');
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                            >
                              <User className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                              <span className="text-gray-700 text-sm font-medium">Edit Profile</span>
                            </button>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                handleLogout();
                              }}
                              className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                            >
                              <LogOut className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" />
                              <span className="font-medium text-sm">Logout</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="font-semibold text-gray-800 text-sm">Login:</p>
                          </div>
                          <button
                            onClick={() => {
                              setShowFarmerAuth(true);
                              setShowUserDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                          >
                            <Sprout className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                            <span className="text-gray-700 text-sm font-medium">Farmer Login</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowCustomerLogin(true);
                              setShowUserDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                          >
                            <User className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                            <span className="text-gray-700 text-sm font-medium">Customer Login</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2"
              >
                {showMobileMenu ? <X /> : <Menu />}
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t bg-gray-50 shadow-inner">
            {/* Mobile Search Bar */}
            <div className="px-4 pt-4">
              <div className="w-full flex items-center bg-white rounded-md overflow-hidden border border-gray-300 shadow-sm">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm outline-none bg-white"
                />
                <button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 transition-colors flex items-center justify-center flex-shrink-0"
                  onClick={() => {/* Add search logic */}}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="px-4 py-4 space-y-1">
              <button onClick={() => { setActiveSection('home'); setShowMobileMenu(false); }} className="block py-3 px-3 text-gray-700 hover:text-orange-500 hover:bg-white rounded-md w-full text-left font-medium transition-colors">Home</button>
              <button onClick={() => { setActiveSection('products'); setShowMobileMenu(false); }} className="block py-3 px-3 text-gray-700 hover:text-orange-500 hover:bg-white rounded-md w-full text-left font-medium transition-colors">Products</button>
              <button onClick={() => { setActiveSection('contact'); setShowMobileMenu(false); }} className="block py-3 px-3 text-gray-700 hover:text-orange-500 hover:bg-white rounded-md w-full text-left font-medium transition-colors">Contact</button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Banner Carousel - Only on Home Page */}
      {activeSection === 'home' && activeView === 'home' && (
      <section 
        className="relative h-[420px] md:h-[450px] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Banner Images */}
        <div className="relative h-full">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentBannerIndex 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
              style={{
                backgroundImage: `url(${banner.image})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: index === 2 ? 'center 30%' : 'center',
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>
          ))}
        </div>

        {/* Banner Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
          {currentBannerIndex === 0 && (
            <>
              {/* Badge */}
              <div className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase mb-4">
                Great Prices
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Fruits & Vegetables - Great Prices
              </h1>

              {/* Features */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-green-400 text-lg">✓</span>
                  </div>
                  <span className="font-medium">Farm Fresh</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-green-400 text-lg">✓</span>
                  </div>
                  <span className="font-medium">Clean & Hygienic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-green-400 text-lg">✓</span>
                  </div>
                  <span className="font-medium">Safe</span>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={() => {
                  if (!userRole) {
                    setLoginPromptMessage('Please login to shop now.');
                    setShowLoginPrompt(true);
                  } else {
                    setActiveSection('products');
                  }
                }}
                className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-8 py-3 rounded-md transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
              >
                Order now
                <span className="text-sm">▶</span>
              </button>
            </>
          )}

          {currentBannerIndex === 1 && (
            <>
              {/* CTA Button positioned below combos text */}
              <div className="mt-64 md:mt-72">
                <button 
                  onClick={() => {
                    if (!userRole) {
                      setLoginPromptMessage('Please login to shop now.');
                      setShowLoginPrompt(true);
                    } else {
                      setActiveSection('products');
                    }
                  }}
                  className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-8 py-3 rounded-md transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  Shop Now
                  <span className="text-sm">▶</span>
                </button>
              </div>
            </>
          )}

          {currentBannerIndex === 2 && (
            <>
              {/* CTA Button positioned below all text */}
              <div className="mt-64 md:mt-72">
                <button 
                  onClick={() => {
                    if (!userRole) {
                      setLoginPromptMessage('Please login to explore deals.');
                      setShowLoginPrompt(true);
                    } else {
                      setActiveSection('products');
                    }
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-md transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  Explore Deals
                  <span className="text-sm">▶</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Previous banner"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Next banner"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToBanner(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentBannerIndex
                  ? 'bg-white w-8 h-3'
                  : 'bg-white/50 hover:bg-white/75 w-3 h-3'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </section>
      )}

      {/* Fruits and Vegetables Category Section */}
      {activeSection === 'home' && activeView === 'home' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Fruits and Vegetables</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Fresh Vegetables */}
            <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-200">
              <div className="h-48 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
                <img 
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" 
                  alt="Fresh Vegetables" 
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Fresh Vegetables</h3>
                <p className="text-2xl font-bold text-red-600">MIN 27% OFF</p>
              </div>
            </div>

            {/* Fresh Fruits */}
            <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-200">
              <div className="h-48 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
                <img 
                  src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop" 
                  alt="Fresh Fruits" 
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Fresh Fruits</h3>
                <p className="text-2xl font-bold text-red-600">MIN 27% OFF</p>
              </div>
            </div>

            {/* Cuts & Exotics */}
            <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-200">
              <div className="h-48 bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-4">
                <img 
                  src="https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&h=300&fit=crop" 
                  alt="Cuts & Exotics" 
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Cuts & Exotics</h3>
                <p className="text-2xl font-bold text-red-600">MIN 27% OFF</p>
              </div>
            </div>

            {/* Herbs & Seasonings */}
            <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-200">
              <div className="h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
                <img 
                  src="https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&h=300&fit=crop" 
                  alt="Herbs & Seasonings" 
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Herbs & Seasonings</h3>
                <p className="text-2xl font-bold text-red-600">MIN 27% OFF</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Conditional Section Rendering */}
      {activeSection === 'home' && activeView === 'home' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Find What You Need</h2>
          <button
            onClick={() => setActiveSection('products')}
            className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
          >
            View All
          </button>
        </div>

        {/* Product Grid - Show only 4 products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 4).map(product => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
                  {product.image && (product.image.startsWith('http://') || product.image.startsWith('https://') || product.image.startsWith('/')) ? (
                    <img 
                      src={product.image.startsWith('/') ? `http://localhost:3001${product.image}` : product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<div class="text-6xl">${product.image || '🌾'}</div>`;
                      }}
                    />
                  ) : (
                    <div className="text-6xl">{product.image || '🌾'}</div>
                  )}
                  {/* Discount Badge */}
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg z-10">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">By {product.farmer}</p>
                
                {/* Discount Display */}
                {product.discount && product.discount > 0 ? (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-400 line-through">₹{product.price}/kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{Math.round(product.price * (1 - product.discount / 100))}
                        </span>
                        <span className="text-sm text-gray-500">/kg</span>
                      </div>
                      <span className="text-xs text-gray-500">Stock: {product.stock} kg</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                      <span className="text-sm text-gray-500">/kg</span>
                    </div>
                    <span className="text-xs text-gray-500">Stock: {product.stock} kg</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => {
                      if (!userRole) {
                        setLoginPromptMessage('Please login to add to wishlist.');
                        setShowLoginPrompt(true);
                      } else {
                        // Add to wishlist
                        const isAlreadyInWishlist = wishlistItems.some(item => item.id === product.id);
                        if (!isAlreadyInWishlist) {
                          setWishlistItems([...wishlistItems, product]);
                          toast({ title: 'Added to wishlist!', duration: 3000 });
                        } else {
                          toast({ title: 'Already in wishlist!', duration: 3000 });
                        }
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Heart className={`w-5 h-5 ${wishlistItems.some(item => item.id === product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  <Button
                    onClick={() => addToCart(product, 1)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </section>
      )}

      {/* Products Section (Full Catalog) */}
      {activeSection === 'products' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">All Products</h2>
          
          {/* Category Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy', 'Other'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
                    {product.image && (product.image.startsWith('http://') || product.image.startsWith('https://') || product.image.startsWith('/')) ? (
                      <img 
                        src={product.image.startsWith('/') ? `http://localhost:3001${product.image}` : product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<div class="text-6xl">${product.image || '🌾'}</div>`;
                        }}
                      />
                    ) : (
                      <div className="text-6xl">{product.image || '🌾'}</div>
                    )}
                    {/* Discount Badge */}
                    {product.discount && product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg z-10">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">By {product.farmer}</p>
                  
                  {/* Discount Display */}
                  {product.discount && product.discount > 0 ? (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-400 line-through">₹{product.price}/kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{Math.round(product.price * (1 - product.discount / 100))}
                          </span>
                          <span className="text-sm text-gray-500">/kg</span>
                        </div>
                        <span className="text-xs text-gray-500">Stock: {product.stock} kg</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                        <span className="text-sm text-gray-500">/kg</span>
                      </div>
                      <span className="text-xs text-gray-500">Stock: {product.stock} kg</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => {
                        if (!userRole) {
                          setLoginPromptMessage('Please login to add to wishlist.');
                          setShowLoginPrompt(true);
                        } else {
                          // Add to wishlist
                          const isAlreadyInWishlist = wishlistItems.some(item => item.id === product.id);
                          if (!isAlreadyInWishlist) {
                            setWishlistItems([...wishlistItems, product]);
                            toast({ title: 'Added to wishlist!', duration: 3000 });
                          } else {
                            toast({ title: 'Already in wishlist!', duration: 3000 });
                          }
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Heart className={`w-5 h-5 ${wishlistItems.some(item => item.id === product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                    <Button
                      onClick={() => addToCart(product, 1)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          )}
        </section>
      )}

      {/* Contact Section */}
      {activeSection === 'contact' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-xl text-gray-600">We'd love to hear from you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <Input 
                    placeholder="Your name" 
                    className="w-full" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="w-full" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input 
                    type="tel" 
                    placeholder="+91 9876543210" 
                    className="w-full" 
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                    placeholder="How can we help you?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                  ></textarea>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmittingContact}
                >
                  {isSubmittingContact ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>

            {/* Map and Contact Info */}
            <div className="space-y-6">
              {/* Embedded Map */}
              <Card className="p-0 overflow-hidden">
                <div className="w-full h-64 bg-gray-200 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3160407253!2d78.24323209999999!3d17.412608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="FarmConnect Location"
                  ></iframe>
                </div>
              </Card>

              {/* Contact Details */}
              <div className="grid grid-cols-1 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📍</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Address</h4>
                      <p className="text-sm text-gray-600">123 Farm Street, Hyderabad, Telangana 500001</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Email</h4>
                      <p className="text-sm text-gray-600">support@farmconnect.com</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📞</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Phone</h4>
                      <p className="text-sm text-gray-600">+91 9876543210</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-green-50">
                  <h4 className="font-bold text-sm mb-2">Business Hours</h4>
                  <div className="space-y-1 text-xs text-gray-700">
                    <p><strong>Mon - Fri:</strong> 9:00 AM - 6:00 PM</p>
                    <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
                    <p><strong>Sunday:</strong> Closed</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
            onClick={() => setShowCart(false)}
          />
          
          {/* Cart Drawer */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-4 border-b bg-orange-500 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Shopping Cart ({getCartCount()})
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="hover:bg-orange-600 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {Object.keys(cart).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingCart className="w-20 h-20 mb-4" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mb-4">Add items to get started</p>
                  <button
                    onClick={() => {
                      setActiveView('home');
                      setActiveSection('products');
                      navigate('/products');
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([key, item]) => (
                    <div key={key} className="flex gap-3 border-b pb-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.product.image && (item.product.image.startsWith('http://') || item.product.image.startsWith('https://') || item.product.image.startsWith('/')) ? (
                          <img 
                            src={item.product.image.startsWith('/') ? `http://localhost:3001${item.product.image}` : item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `<div class="text-3xl">${item.product.image || '🌾'}</div>`;
                            }}
                          />
                        ) : (
                          <div className="text-3xl">{item.product.image || '🌾'}</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.product.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">By {item.product.farmer}</p>
                        {item.product.discount && item.product.discount > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                              {item.product.discount}% OFF
                            </span>
                            <span className="text-xs text-gray-400 line-through">₹{item.product.price}/kg</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  setCart(prev => ({
                                    ...prev,
                                    [key]: { ...item, quantity: item.quantity - 1 }
                                  }));
                                } else {
                                  setCart(prev => {
                                    const newCart = { ...prev };
                                    delete newCart[key];
                                    return newCart;
                                  });
                                }
                              }}
                              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium">{item.quantity} kg</span>
                            <button
                              onClick={() => {
                                setCart(prev => ({
                                  ...prev,
                                  [key]: { ...item, quantity: item.quantity + 1 }
                                }));
                              }}
                              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            {item.product.discount && item.product.discount > 0 ? (
                              <div>
                                <p className="font-bold text-green-600">₹{Math.round(item.product.price * (1 - item.product.discount / 100) * item.quantity)}</p>
                                <p className="text-xs text-gray-400 line-through">₹{item.product.price * item.quantity}</p>
                              </div>
                            ) : (
                              <p className="font-bold text-orange-600">₹{item.product.price * item.quantity}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {Object.keys(cart).length > 0 && (
              <div className="border-t p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{Object.values(cart).reduce((sum, item) => {
                      const discount = item.product.discount || 0;
                      const finalPrice = item.product.price * (1 - discount / 100);
                      return sum + (finalPrice * item.quantity);
                    }, 0).toFixed(0)}
                  </span>
                </div>
                {Object.values(cart).some(item => item.product.discount && item.product.discount > 0) && (
                  <div className="text-xs text-gray-600 mb-2 text-right">
                    <span className="line-through">₹{Object.values(cart).reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}</span>
                    <span className="text-green-600 font-semibold ml-2">
                      You save ₹{(Object.values(cart).reduce((sum, item) => sum + (item.product.price * item.quantity), 0) - 
                        Object.values(cart).reduce((sum, item) => {
                          const discount = item.product.discount || 0;
                          const finalPrice = item.product.price * (1 - discount / 100);
                          return sum + (finalPrice * item.quantity);
                        }, 0)).toFixed(0)}!
                    </span>
                  </div>
                )}
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                >
                  Proceed to Checkout
                </Button>
                <button
                  onClick={() => {
                    setCart({});
                    localStorage.removeItem('fc_cart');
                    toast({ title: 'Cart cleared' });
                  }}
                  className="w-full mt-2 text-red-600 hover:text-red-700 py-2 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Login Prompt Side Panel */}
      {showLoginPrompt && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowLoginPrompt(false)}
          />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="bg-orange-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-6 h-6" />
                <h2 className="text-xl font-bold">Login Required</h2>
              </div>
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="hover:bg-orange-600 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h3>
              <p className="text-gray-600 mb-8">
                {loginPromptMessage}
              </p>
              
              <div className="w-full space-y-4">
                <Button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    setShowCustomerLogin(true);
                  }}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 text-lg font-semibold rounded-lg"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Auth Modals */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Login</h2>
              <button onClick={() => setShowAuthModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <Button
                onClick={() => {
                  setShowAuthModal(false);
                  setShowCustomerLogin(true);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
              >
                Login as Customer
              </Button>
              <Button
                onClick={() => {
                  setShowAuthModal(false);
                  setShowFarmerAuth(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              >
                Login as Farmer
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCustomerLogin && (
        <CustomerLoginModal
          isOpen={showCustomerLogin}
          onClose={() => setShowCustomerLogin(false)}
          onLogin={(userData) => handleLoginSuccess('customer', userData.name)}
        />
      )}

      {showFarmerAuth && (
        <FarmerAuthModal
          isOpen={showFarmerAuth}
          onClose={() => setShowFarmerAuth(false)}
          onLogin={(userData) => handleLoginSuccess('farmer', userData.name)}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Checkout</h2>
                <button onClick={() => setShowCheckout(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {Object.entries(cart).map(([key, item]) => {
                    const discount = item.product.discount || 0;
                    const finalPrice = item.product.price * (1 - discount / 100);
                    return (
                      <div key={key} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <span>{item.product.name} x {item.quantity}kg</span>
                          {discount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {discount > 0 ? (
                            <div>
                              <span className="font-medium text-green-600">₹{Math.round(finalPrice * item.quantity)}</span>
                              <span className="text-xs text-gray-400 line-through ml-2">₹{item.product.price * item.quantity}</span>
                            </div>
                          ) : (
                            <span className="font-medium">₹{item.product.price * item.quantity}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">₹{Math.round(Object.values(cart).reduce((sum, item) => {
                      const discount = item.product.discount || 0;
                      const finalPrice = item.product.price * (1 - discount / 100);
                      return sum + (finalPrice * item.quantity);
                    }, 0))}</span>
                  </div>
                  {Object.values(cart).some(item => item.product.discount && item.product.discount > 0) && (
                    <div className="text-xs text-green-600 font-semibold text-right">
                      You save ₹{Math.round(Object.values(cart).reduce((sum, item) => sum + (item.product.price * item.quantity), 0) - 
                        Object.values(cart).reduce((sum, item) => {
                          const discount = item.product.discount || 0;
                          const finalPrice = item.product.price * (1 - discount / 100);
                          return sum + (finalPrice * item.quantity);
                        }, 0))}!
                    </div>
                  )}
                  {Object.values(cart).reduce((sum, item) => {
                    const discount = item.product.discount || 0;
                    const finalPrice = item.product.price * (1 - discount / 100);
                    return sum + (finalPrice * item.quantity);
                  }, 0) < 50 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      ⚠️ Minimum order amount is ₹50 for online payment. Please add more items.
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address Form */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Delivery Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={deliveryAddress.name}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={deliveryAddress.phone}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address *</label>
                    <textarea
                      value={deliveryAddress.address}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, address: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows={3}
                      placeholder="House no, Street, Landmark"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City *</label>
                      <input
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State *</label>
                      <input
                        type="text"
                        value={deliveryAddress.state}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={deliveryAddress.pincode}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section - Stripe */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Payment Method</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-800">Secure Card Payment via Stripe</p>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Pay securely with your credit or debit card</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-blue-500">🔒 SSL Encrypted</span>
                    <span className="text-xs text-blue-500">• Test Mode</span>
                  </div>
                </div>
              </div>

              {/* Proceed to Payment Button */}
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold shadow-lg"
                onClick={async () => {
                  if (!deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
                    toast({ title: 'Error', description: 'Please fill all address fields', variant: 'destructive' });
                    return;
                  }
                  
                  // Check if user is logged in
                  const token = localStorage.getItem('fc_jwt');
                  if (!userRole || userRole !== 'customer') {
                    toast({ title: 'Error', description: 'Please login as customer to place order', variant: 'destructive' });
                    return;
                  }
                  
                  if (!token) {
                    toast({ title: 'Error', description: 'Session expired. Please login again', variant: 'destructive' });
                    return;
                  }
                  
                  // Calculate total amount with discounts
                  const totalAmount = Math.round(Object.values(cart).reduce((sum, item) => {
                    const discount = item.product.discount || 0;
                    const finalPrice = item.product.price * (1 - discount / 100);
                    return sum + (finalPrice * item.quantity);
                  }, 0));
                  
                  // Check Stripe minimum amount (₹50 = approximately $0.60)
                  if (totalAmount < 50) {
                    toast({ 
                      title: 'Minimum Order Amount', 
                      description: `Minimum order amount is ₹50 for online payment. Your cart total is ₹${totalAmount}. Please add more items.`, 
                      variant: 'destructive' 
                    });
                    return;
                  }
                  
                  // Prepare cart items for Stripe
                  const items = Object.values(cart).map(item => ({
                    productId: item.product._id || item.product.id,
                    quantity: item.quantity,
                    price: item.product.price
                  }));
                  
                  const shippingAddress = {
                    name: deliveryAddress.name,
                    phone: deliveryAddress.phone,
                    address: deliveryAddress.address,
                    city: deliveryAddress.city,
                    state: deliveryAddress.state,
                    pincode: deliveryAddress.pincode
                  };
                  
                  try {
                    console.log('🔄 Creating Stripe checkout session...');
                    const response = await fetch('http://localhost:3001/api/stripe/create-checkout-session', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        items,
                        shippingAddress
                      })
                    });
                    
                    const result = await response.json();
                    console.log('📦 Stripe response:', result);
                    
                    if (response.ok && result.ok && result.sessionUrl) {
                      console.log('✅ Redirecting to Stripe checkout...');
                      // Redirect to Stripe checkout page
                      window.location.href = result.sessionUrl;
                    } else {
                      console.error('⚠️ Stripe session creation failed:', result.error);
                      toast({ 
                        title: 'Payment Error', 
                        description: result.error || 'Failed to create payment session', 
                        variant: 'destructive' 
                      });
                    }
                  } catch (error) {
                    console.error('❌ Error creating Stripe session:', error);
                    toast({ 
                      title: 'Error', 
                      description: 'Failed to initiate payment. Please try again.', 
                      variant: 'destructive' 
                    });
                  }
                }}
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Proceed to Secure Payment
              </Button>
              
              <p className="text-xs text-center text-gray-500 mt-3">
                🔒 Secure payment powered by Stripe • Test Mode
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been placed successfully. You will receive updates on your registered email.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  setShowOrderConfirmation(false);
                  navigate('/myorders');
                }}
              >
                View My Orders
              </Button>
              <button
                onClick={() => setShowOrderConfirmation(false)}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page-based Views - Show below header */}
      {activeView !== 'home' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
          {/* Back Button and Title */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {activeView === 'myorders' && 'My Orders'}
              {activeView === 'wishlist' && 'My Wishlist'}
              {activeView === 'editprofile' && 'Edit Profile'}
            </h1>
          </div>

          {/* Content Area */}
          <div>
            {/* My Orders View */}
            {activeView === 'myorders' && (
              orders.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No orders yet</p>
                  <p className="text-gray-400 text-sm mt-2">Start shopping to place your first order!</p>
                  <Button
                    className="mt-6 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => navigate('/')}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                      {/* Order Header */}
                      <div className="flex justify-between items-start mb-4 pb-4 border-b">
                        <div>
                          <p className="font-bold text-xl">Order ID: {(order.orderId || order.id).replace(/-/g, '')}</p>
                          <p className="text-sm text-gray-500">Placed on {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">₹{order.total}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-6">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 py-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item?.product?.image && (item.product.image.startsWith('http://') || item.product.image.startsWith('https://') || item.product.image.startsWith('/')) ? (
                                <img 
                                  src={item.product.image.startsWith('/') ? `http://localhost:3001${item.product.image}` : item.product.image}
                                  alt={item?.product?.name || 'Product'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-3xl">{item?.product?.image || '🌾'}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{item?.product?.name || 'Product'}</p>
                              <p className="text-sm text-gray-500">Quantity: {item?.quantity || 0} kg × ₹{item?.product?.price || 0}</p>
                            </div>
                            <p className="font-bold">₹{(item?.product?.price || 0) * (item?.quantity || 0)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold mb-2">Delivery Address</h4>
                        <p className="text-sm text-gray-700">{order.address?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-700">{order.address?.address || 'N/A'}</p>
                        <p className="text-sm text-gray-700">
                          {order.address?.city || 'N/A'}
                          {order.address?.state ? `, ${order.address.state}` : ''} - {order.address?.pincode || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700">Phone: {order.address?.phone || 'N/A'}</p>
                      </div>

                      {/* Payment Method */}
                      <div className="mb-6">
                        <p className="text-sm"><span className="font-semibold">Payment Method:</span> {order.paymentMethod}</p>
                      </div>

                      {/* Order Status Tracker */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                        <h4 className="font-semibold mb-4">Order Status</h4>
                        <div className="relative">
                          {/* Progress Line */}
                          {(() => {
                            const statusOrder = ['confirmed', 'packed', 'dispatched', 'shipped', 'out for delivery', 'delivered'];
                            const currentStatusLower = (order.status || '').toLowerCase();
                            const currentIndex = statusOrder.indexOf(currentStatusLower);
                            const progressWidth = currentIndex >= 0 ? ((currentIndex + 1) / 6) * 100 : 16.66;
                            
                            return (
                              <>
                                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                                  <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${progressWidth}%`}}></div>
                                </div>
                                
                                {/* Status Steps */}
                                <div className="relative flex justify-between">
                                  {[
                                    { label: 'Order Confirmed', icon: '✓', status: 'confirmed' },
                                    { label: 'Packed', icon: '📦', status: 'packed' },
                                    { label: 'Dispatched', icon: '🚚', status: 'dispatched' },
                                    { label: 'Shipped', icon: '✈️', status: 'shipped' },
                                    { label: 'Out for Delivery', icon: '🏍️', status: 'out for delivery' },
                                    { label: 'Delivered', icon: '🎉', status: 'delivered' }
                                  ].map((step, idx) => {
                                    const stepIndex = statusOrder.indexOf(step.status);
                                    const isActive = currentIndex >= stepIndex;
                                    
                                    return (
                                      <div key={idx} className="flex flex-col items-center" style={{width: '16.66%'}}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 ${
                                          isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                          {step.icon}
                                        </div>
                                        <p className={`text-xs text-center ${isActive ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                                          {step.label}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Feedback Form - Only for delivered orders */}
                      {order.status?.toLowerCase() === 'delivered' && (
                        <div className="mt-6 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-600" />
                            {order.feedback?.rating ? 'Your Feedback' : 'Rate Your Experience'}
                          </h4>
                          
                          {order.feedback?.rating ? (
                            // Show existing feedback
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-5 h-5 ${i < order.feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <p className="text-gray-700">{order.feedback.comment || 'No comment provided'}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                Submitted on {new Date(order.feedback.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            // Show feedback form
                            <div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Rating *</label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => {
                                        const rating = star;
                                        const comment = prompt('Please share your feedback (optional):') || '';
                                        
                                        // Submit feedback
                                        const token = localStorage.getItem('fc_jwt');
                                        const orderIdToUse = order.orderId || order.id;
                                        
                                        console.log('[FEEDBACK] Submitting for order:', orderIdToUse);
                                        
                                        fetch(`http://localhost:3001/api/orders/${orderIdToUse}/feedback`, {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                          },
                                          body: JSON.stringify({ rating, comment })
                                        })
                                        .then(async res => {
                                          const data = await res.json();
                                          console.log('[FEEDBACK] Response:', res.status, data);
                                          
                                          if (res.ok && data.ok) {
                                            toast({ 
                                              title: 'Success', 
                                              description: 'Thank you for your feedback!',
                                              duration: 3000 
                                            });
                                            // Refresh orders
                                            setTimeout(() => window.location.reload(), 1000);
                                          } else {
                                            toast({ 
                                              title: 'Error', 
                                              description: data.error || 'Failed to submit feedback',
                                              duration: 3000 
                                            });
                                          }
                                        })
                                        .catch(error => {
                                          console.error('[FEEDBACK] Error:', error);
                                          toast({ 
                                            title: 'Error', 
                                            description: 'Failed to submit feedback',
                                            duration: 3000 
                                          });
                                        });
                                      }}
                                      className="text-3xl hover:scale-110 transition-transform"
                                    >
                                      ⭐
                                    </button>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Click on a star to rate (1-5 stars)</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Wishlist View */}
            {activeView === 'wishlist' && (
              <div className="bg-white rounded-xl p-8">
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Your wishlist is empty</p>
                    <p className="text-gray-400 text-sm mt-2">Add products you love to your wishlist!</p>
                    <Button
                      className="mt-6 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => {
                        setActiveView('home');
                        setActiveSection('products');
                        navigate('/products');
                      }}
                    >
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                            {item.image && (item.image.startsWith('http://') || item.image.startsWith('https://') || item.image.startsWith('/')) ? (
                              <img 
                                src={item.image.startsWith('/') ? `http://localhost:3001${item.image}` : item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-6xl">
                                {item.image || '🌾'}
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-green-600">₹{item.price}</span>
                            <span className="text-sm text-gray-500">/{item.unit || 'kg'}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                addToCart(item, 1);
                                toast({ title: 'Added to cart!', duration: 3000 });
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              Add to Cart
                            </Button>
                            <Button
                              onClick={() => {
                                setWishlistItems(wishlistItems.filter(w => w.id !== item.id));
                                toast({ title: 'Removed from wishlist', duration: 3000 });
                              }}
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Edit Profile View */}
            {activeView === 'editprofile' && (
              <div className="bg-white rounded-xl p-8 max-w-3xl mx-auto">
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b">
                    <div className="relative group">
                      {profilePicturePreview ? (
                        <img 
                          src={profilePicturePreview} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-green-600 text-white rounded-full flex items-center justify-center text-4xl font-bold border-4 border-green-100">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label 
                        htmlFor="profile-upload" 
                        className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all transform hover:scale-110"
                      >
                        <Camera className="w-4 h-4" />
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Validate file type
                            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                            if (!validTypes.includes(file.type)) {
                              toast({
                                title: 'Invalid File Type',
                                description: 'Please upload a valid image file (JPG, PNG, or WebP)',
                                variant: 'destructive',
                                duration: 3000
                              });
                              return;
                            }

                            // Validate file size (5MB max)
                            if (file.size > 5 * 1024 * 1024) {
                              toast({
                                title: 'File Too Large',
                                description: 'Image size must be less than 5MB',
                                variant: 'destructive',
                                duration: 3000
                              });
                              return;
                            }

                            // Show preview immediately
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfilePicturePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);

                            // Upload to server
                            setIsUploadingImage(true);
                            const token = localStorage.getItem('fc_jwt');
                            if (!token) {
                              toast({
                                title: 'Error',
                                description: 'Please login to upload profile picture',
                                variant: 'destructive',
                                duration: 3000
                              });
                              setIsUploadingImage(false);
                              return;
                            }

                            try {
                              const formData = new FormData();
                              formData.append('profileImage', file);

                              const response = await fetch('http://localhost:3001/api/user/profile-picture', {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                },
                                body: formData
                              });

                              const data = await response.json();

                              if (response.ok && data.ok) {
                                setProfilePicturePreview(data.profilePicture);
                                setProfileData(prev => ({
                                  ...prev,
                                  profilePicture: data.profilePicture
                                }));
                                toast({
                                  title: 'Success!',
                                  description: 'Profile picture updated successfully',
                                  duration: 3000
                                });
                              } else {
                                throw new Error(data.error || 'Failed to upload image');
                              }
                            } catch (error: any) {
                              console.error('[PROFILE] Error uploading image:', error);
                              toast({
                                title: 'Upload Failed',
                                description: error.message || 'Failed to upload image. Please try again.',
                                variant: 'destructive',
                                duration: 3000
                              });
                              // Revert preview on error
                              setProfilePicturePreview(profileData.profilePicture || null);
                            } finally {
                              setIsUploadingImage(false);
                              // Reset input
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-semibold">{userName}</h3>
                      <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                      <p className="text-xs text-gray-400 mt-2">Click the camera icon to upload a new profile picture</p>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                          placeholder="Enter current password"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">New Password</label>
                          <input
                            type="password"
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Confirm Password</label>
                          <input
                            type="password"
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone - Delete Account */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
                    <p className="text-sm text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <Button 
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button 
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={async () => {
                        const token = localStorage.getItem('fc_jwt');
                        if (!token) {
                          toast({ 
                            title: 'Error', 
                            description: 'Please login to update profile',
                            duration: 3000 
                          });
                          return;
                        }

                        // Check if any changes were made
                        const passwordChanged = passwordData.current || passwordData.new || passwordData.confirm;
                        
                        // Validate password if changing
                        if (passwordChanged) {
                          if (!passwordData.current) {
                            toast({ 
                              title: 'Error', 
                              description: 'Please enter current password',
                              duration: 3000 
                            });
                            return;
                          }
                          if (passwordData.new !== passwordData.confirm) {
                            toast({ 
                              title: 'Error', 
                              description: 'New passwords do not match',
                              duration: 3000 
                            });
                            return;
                          }
                          if (passwordData.new.length < 6) {
                            toast({ 
                              title: 'Error', 
                              description: 'Password must be at least 6 characters',
                              duration: 3000 
                            });
                            return;
                          }
                        }
                        
                        try {
                          // Update profile
                          const profileResponse = await fetch('http://localhost:3001/api/user/profile', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              name: profileData.name,
                              email: profileData.email,
                              phone: profileData.phone
                            })
                          });

                          const profileResult = await profileResponse.json();
                          
                          if (!profileResponse.ok) {
                            toast({ 
                              title: 'Error', 
                              description: profileResult.error || 'Failed to update profile',
                              duration: 3000 
                            });
                            return;
                          }

                          // Update password if changed
                          if (passwordChanged) {
                            const passwordResponse = await fetch('http://localhost:3001/api/user/change-password', {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                currentPassword: passwordData.current,
                                newPassword: passwordData.new
                              })
                            });

                            const passwordResult = await passwordResponse.json();
                            
                            if (!passwordResponse.ok) {
                              toast({ 
                                title: 'Error', 
                                description: passwordResult.error || 'Failed to change password',
                                duration: 3000 
                              });
                              return;
                            }
                          }

                          // Success
                          toast({ 
                            title: 'Success', 
                            description: 'Profile updated successfully!',
                            duration: 3000 
                          });
                          
                          // Reset password fields
                          setPasswordData({ current: '', new: '', confirm: '' });
                          
                          // Redirect to home page after 1 second
                          setTimeout(() => {
                            setActiveView('home');
                            navigate('/');
                          }, 1000);
                        } catch (error) {
                          console.error('[PROFILE] Error saving:', error);
                          toast({ 
                            title: 'Error', 
                            description: 'Failed to update profile',
                            duration: 3000 
                          });
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate('/')}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete your account? This will permanently remove:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 ml-2">
                <li>Your profile and personal information</li>
                <li>All your orders and order history</li>
                {userRole === 'farmer' && <li>All your products and listings</li>}
                <li>Access to your account</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingAccount}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About FarmConnect */}
            <div>
              <h3 className="text-xl font-bold mb-4">About FarmConnect</h3>
              <p className="text-gray-300 mb-4">
                FarmConnect bridges the gap between farmers and consumers, providing a direct marketplace for fresh, locally-sourced agricultural products. We empower farmers to reach customers directly while ensuring consumers get the freshest produce at fair prices.
              </p>
              <p className="text-gray-300">
                Our platform supports sustainable farming practices and helps build stronger local food systems.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => navigate('/')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/products')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Products
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/contact')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <span className="font-semibold">Email:</span> support@farmconnect.com
                </li>
                <li>
                  <span className="font-semibold">Phone:</span> +91 1234567890
                </li>
                <li>
                  <span className="font-semibold">Address:</span> Farm Market, India
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 FarmConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FarmConnectMarketplace;
