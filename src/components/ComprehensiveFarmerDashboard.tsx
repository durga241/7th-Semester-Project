import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, Warehouse, 
  MessageSquare, User, HelpCircle, Plus, Edit2, Trash2, Download,
  TrendingUp, IndianRupee, AlertCircle, Bell, Settings, LogOut,
  Eye, EyeOff, Calendar, MapPin, Phone, Mail, FileText, Upload, Send, Check,
  Home, Star, Image, CreditCard, CheckCircle, XCircle, Clock, FileDown, Camera
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComprehensiveFarmerDashboardProps {
  userName: string;
  products: any[];
  setProducts: (products: any[]) => void;
  onLogout: () => void;
}

const ComprehensiveFarmerDashboard: React.FC<ComprehensiveFarmerDashboardProps> = ({
  userName,
  products,
  setProducts,
  onLogout
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'products' | 'orders' | 'analytics' | 'feedback' | 'payments' | 'profile'>('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    unit: 'kg',
    description: '',
    image: null as File | null,
    imageUrl: '',
    isOrganic: false,
    isCertified: false,
    isSeasonal: false,
    status: 'available' as 'available' | 'unavailable',
    discount: '' as string | number // Empty by default - farmer must enter
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userName,
    email: '',
    phone: '',
    profilePicture: ''
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [hasPlayedInitialCheck, setHasPlayedInitialCheck] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lastOrderCountRef = useRef(0);
  const hasPlayedInitialCheckRef = useRef(false);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showUserMenu]);

  // Fetch notifications from database
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('fc_jwt');
      if (!token) return;

      // Get farmer ID from JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      const farmerId = payload.uid;

      const response = await fetch(`http://localhost:3001/api/notifications/farmer/${farmerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.notifications) {
          console.log('[NOTIFICATIONS] Fetched', data.notifications.length, 'notifications');
          
          // Transform notifications to match UI format
          const transformed = data.notifications.map((n: any) => ({
            id: n._id,
            type: n.type,
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleString(),
            read: n.read,
            metadata: n.metadata
          }));
          
          setNotifications(transformed);
        }
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('fc_jwt');
      if (!token) return;

      await fetch(`http://localhost:3001/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('[NOTIFICATIONS] Error marking as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('fc_jwt');
      if (!token) return;

      // Get farmer ID from JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      const farmerId = payload.uid;

      await fetch(`http://localhost:3001/api/notifications/farmer/${farmerId}/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('[NOTIFICATIONS] Error marking all as read:', error);
    }
  };

  // Fetch farmer profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('fc_jwt');
        if (!token) return;

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

    fetchProfile();
    fetchNotifications(); // Fetch notifications on mount
  }, [userName]);

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('fc_jwt');
        if (!token) return;
        
        console.log('[FARMER DASHBOARD] Fetching orders...');
        const response = await fetch('http://localhost:3001/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.ok && data.orders) {
          console.log('[FARMER DASHBOARD] Fetched', data.orders.length, 'orders');
          
          // Transform orders - keep them grouped, don't flatten
          const transformedOrders = data.orders.map((order: any) => {
            return {
              id: order.orderId || order.id || order._id,
              orderId: order.orderId || order.id || order._id,
              displayOrderId: order.orderId || order.id || order._id,
              customerName: order.customerName || order.customerId?.name || 'Customer',
              status: order.status || 'Pending',
              actualOrderId: order._id,
              address: order.address || order.shippingAddress,
              items: order.items || order.products || [],
              products: order.products || order.items || [],
              total: order.total || 0,
              amount: order.total || 0,
              feedback: order.feedback,
              createdAt: order.createdAt || order.date || new Date().toISOString()
            };
          });
          
          console.log('[FARMER DASHBOARD] Transformed orders:', transformedOrders.length);
          setOrders(transformedOrders);
          
          // Set initial order count immediately
          if (!hasPlayedInitialCheckRef.current) {
            lastOrderCountRef.current = data.orders.length;
            setLastOrderCount(data.orders.length);
            // Enable notification after 5 seconds to avoid false positives
            setTimeout(() => {
              hasPlayedInitialCheckRef.current = true;
              setHasPlayedInitialCheck(true);
              console.log('[ORDER POLLING] Notification system enabled. Baseline:', data.orders.length, 'orders');
            }, 5000);
          }
        }
      } catch (error) {
        console.error('[FARMER DASHBOARD] Error fetching orders:', error);
      }
    };

    fetchOrders();
    
    // Set up polling for new orders after initial load
    const orderPolling = setInterval(async () => {
      try {
        const token = localStorage.getItem('fc_jwt');
        if (!token) return;
        
        const response = await fetch('http://localhost:3001/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.ok && data.orders) {
          const currentOrderCount = data.orders.length;
          
          // After initial check (5 seconds after login), check for new orders
          if (hasPlayedInitialCheckRef.current && currentOrderCount > lastOrderCountRef.current) {
            // New order detected!
            const newOrdersCount = currentOrderCount - lastOrderCountRef.current;
            console.log(`[NEW ORDER] ${newOrdersCount} new order(s) detected!`);
            
            // Play beep sound
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSp90O7YgzYJHmS66+OVUhELTKXh8bllHAU2jdXuw3EnBS17ye7aggYKEmK56+mjVhMNR5zd8sFhHwU1mNPvyYgzByt6x+/bi0MLJn/F8dPz');
            audio.play().catch(e => console.log('Could not play notification sound:', e));
            
            // Fetch notifications from database (backend creates them automatically)
            fetchNotifications();
            setShowNotifications(true);
            
            // Update order count in both ref and state
            lastOrderCountRef.current = currentOrderCount;
            setLastOrderCount(currentOrderCount);
            
            // Refresh orders list
            const transformedOrders = data.orders.map((order: any) => ({
              id: order.orderId || order.id || order._id,
              orderId: order.orderId || order.id || order._id,
              displayOrderId: order.orderId || order.id || order._id,
              customerName: order.customerName || order.customerId?.name || 'Customer',
              status: order.status || 'Pending',
              actualOrderId: order._id,
              address: order.address || order.shippingAddress,
              items: order.items || order.products || [],
              products: order.products || order.items || [],
              total: order.total || 0,
              amount: order.total || 0,
              feedback: order.feedback,
              createdAt: order.createdAt || order.date || new Date().toISOString()
            }));
            setOrders(transformedOrders);
          }
        }
      } catch (error) {
        console.error('[ORDER POLLING] Error:', error);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(orderPolling);
  }, []);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('fc_jwt');
        if (!token) return;
        
        console.log('[FARMER DASHBOARD] Fetching products...');
        const response = await fetch('http://localhost:3001/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.ok && data.products) {
          console.log('[FARMER DASHBOARD] Fetched', data.products.length, 'products from API');
          const mappedProducts = data.products.map((p: any) => ({
            id: p._id,
            name: p.title,
            price: p.price,
            farmer: p.farmerId?.name || userName,
            category: p.category || 'Other',
            image: p.imageUrl || '🌾',
            stock: p.quantity || p.stock || 100,
            quantity: p.quantity || p.stock || 100,
            unit: 'kg',
            rating: 4.5,
            status: p.status || 'available',
            description: p.description || '',
            discount: p.discount || 0
          }));
          setProducts(mappedProducts);
          console.log('[FARMER DASHBOARD] Products loaded:', mappedProducts.length);
        }
      } catch (error) {
        console.error('[FARMER DASHBOARD] Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Extract feedback from orders
  useEffect(() => {
    if (orders.length > 0) {
      const feedbackList = orders
        .filter(order => order.feedback && order.feedback.rating)
        .map(order => ({
          id: order.id,
          customerName: order.customerName || 'Customer',
          productName: order.items && order.items.length > 0 
            ? order.items.map((item: any) => item.product?.name || item.name || 'Product').join(', ')
            : 'Product',
          rating: order.feedback.rating,
          comment: order.feedback.comment || 'No comment',
          date: order.feedback.createdAt 
            ? new Date(order.feedback.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        }));
      
      console.log('[FARMER DASHBOARD] Extracted feedback:', feedbackList.length);
      setFeedback(feedbackList);
    }
  }, [orders]);

  // Handle Accept Order - Progress through stages
  const handleAcceptOrder = async (order: any) => {
    // Custom status flow: pending → confirmed → packed → dispatched → shipped → out for delivery → delivered
    const statusFlow: { [key: string]: string } = {
      'pending': 'confirmed',
      'confirmed': 'packed',
      'packed': 'dispatched',
      'dispatched': 'shipped',
      'shipped': 'out for delivery',
      'out for delivery': 'delivered'
    };
    
    // Display labels for UI
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'packed': 'Packed',
      'dispatched': 'Dispatched',
      'shipped': 'Shipped',
      'out for delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };

    const currentStatus = order.status?.toLowerCase() || 'pending';
    const nextStatus = statusFlow[currentStatus];

    if (!nextStatus) {
      alert('Order is already completed or in final stage');
      return;
    }

    try {
      const token = localStorage.getItem('fc_jwt');
      const response = await fetch(`http://localhost:3001/api/orders/${order.actualOrderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: nextStatus,
          sendEmail: true 
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        // Update local state
        setOrders(orders.map(o => 
          o.id === order.id 
            ? { ...o, status: nextStatus }
            : o
        ));
        
        alert(`✅ Order ${order.orderId} updated to: ${statusLabels[nextStatus] || nextStatus}\n📧 Email sent to customer`);
      } else {
        alert(`❌ Failed to update order: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[ORDER] Error updating status:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  // Handle Delete Order
  const handleDeleteOrder = async (order: any) => {
    if (!confirm(`Are you sure you want to delete order ${order.orderId}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('fc_jwt');
      const response = await fetch(`http://localhost:3001/api/orders/${order.actualOrderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.ok) {
        setOrders(orders.filter(o => o.id !== order.id));
        alert(`✅ Order ${order.orderId} deleted successfully`);
      } else {
        alert(`❌ Failed to delete order: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[ORDER] Error deleting order:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  // Handle Reject Order
  const handleRejectOrder = async (order: any) => {
    if (!confirm(`Are you sure you want to reject order ${order.orderId}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('fc_jwt');
      const response = await fetch(`http://localhost:3001/api/orders/${order.actualOrderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          sendEmail: true 
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        setOrders(orders.map(o => 
          o.id === order.id 
            ? { ...o, status: 'Rejected' }
            : o
        ));
        
        alert(`✅ Order ${order.orderId} rejected\n📧 Email sent to customer`);
      } else {
        alert(`❌ Failed to reject order: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[ORDER] Error rejecting order:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  // Calculate stats from actual data
  const myProducts = products.filter(p => p.farmer === userName);
  const deliveredOrders = orders.filter(o => o.status?.toLowerCase() === 'delivered');
  const pendingOrders = orders.filter(o => o.status?.toLowerCase() !== 'delivered' && o.status?.toLowerCase() !== 'rejected');
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
  const pendingPayments = pendingOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
  const topSellingProduct = myProducts.length > 0 ? myProducts[0] : null;
  
  // Generate transactions from delivered orders
  const generatedTransactions = deliveredOrders.flatMap(order => {
    const itemCount = (order.items || []).length;
    const orderTotal = order.total || order.amount || 0;
    
    return (order.items || []).map((item: any, idx: number) => {
      // Calculate amount: use item.price if available, otherwise divide order total proportionally
      const itemAmount = item.price 
        ? item.price * item.quantity 
        : (item.total || (itemCount > 0 ? orderTotal / itemCount : orderTotal));
      
      return {
        id: `${order.id}-${idx}`,
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        customerName: order.customerName || 'Customer',
        productName: item.product?.name || item.name || 'Product',
        quantity: `${item.quantity} ${item.product?.unit || item.unit || 'kg'}`,
        amount: Math.round(itemAmount),
        paymentId: `PAY-${(order.displayOrderId || order.orderId || order.id).replace('ORD-', '')}`,
        status: order.status || 'Pending'
      };
    });
  });
  
  // Merge with existing transactions
  const allTransactions = [...generatedTransactions, ...transactions];
  
  const stats = {
    totalProducts: myProducts.length,
    totalEarnings: totalEarnings,
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    completedOrders: deliveredOrders.length
  };

  // Sidebar Navigation
  const navigationItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard Overview', color: 'text-blue-600' },
    { id: 'products', icon: Package, label: 'My Products', color: 'text-green-600' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders / Requests', color: 'text-orange-600' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics & Insights', color: 'text-indigo-600' },
    { id: 'feedback', icon: Star, label: 'Customer Feedback', color: 'text-pink-600' },
    { id: 'payments', icon: CreditCard, label: 'Payments & Transactions', color: 'text-teal-600' },
    { id: 'profile', icon: User, label: 'Edit Profile', color: 'text-blue-600' },
  ];

  // Auto-categorize crops
  const autoCategorize = (cropName: string): string => {
    const vegetables = ['tomato', 'potato', 'onion', 'carrot', 'cabbage', 'cauliflower', 'brinjal', 'ladyfinger', 'spinach', 'cucumber'];
    const fruits = ['apple', 'banana', 'mango', 'orange', 'grape', 'watermelon', 'papaya', 'guava', 'pomegranate'];
    const grains = ['wheat', 'rice', 'corn', 'barley', 'millet', 'oats'];
    const pulses = ['lentil', 'chickpea', 'pea', 'bean', 'moong', 'masoor', 'toor', 'urad'];
    
    const name = cropName.toLowerCase();
    if (vegetables.some(v => name.includes(v))) return 'Vegetables';
    if (fruits.some(f => name.includes(f))) return 'Fruits';
    if (grains.some(g => name.includes(g))) return 'Grains';
    if (pulses.some(p => name.includes(p))) return 'Pulses';
    return 'Other';
  };

  // Handle add/edit product
  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      alert('Please fill in all required fields (Name, Price, Quantity)');
      return;
    }

    try {
      // Prepare product data for local state
      const productData = {
        id: editingProduct?.id || Date.now().toString(),
        name: newProduct.name,
        category: newProduct.category || autoCategorize(newProduct.name),
        price: Number(newProduct.price),
        quantity: Number(newProduct.quantity),
        unit: newProduct.unit,
        stock: Number(newProduct.quantity),
        description: newProduct.description,
        image: newProduct.imageUrl || '🌾',
        farmer: userName,
        status: newProduct.status,
        visibility: 'visible',
        isOrganic: newProduct.isOrganic,
        isCertified: newProduct.isCertified,
        isSeasonal: newProduct.isSeasonal,
        discount: Number(newProduct.discount) || 0,
        createdAt: editingProduct?.createdAt || new Date().toISOString()
      };

      // Save to database
      const token = localStorage.getItem('fc_jwt');
      const userRole = localStorage.getItem('farmconnect_userRole');
      const storedUserName = localStorage.getItem('farmconnect_userName');
      let savedSuccessfully = false;
      
      console.log('[PRODUCT] Auth check:', { 
        hasToken: !!token, 
        userRole, 
        userName: storedUserName,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });
      
      if (token) {
        console.log('[PRODUCT] Saving to database...');
        
        // Use FormData for backend compatibility
        const formData = new FormData();
        formData.append('title', newProduct.name);
        formData.append('description', newProduct.description || `Fresh ${newProduct.name}`);
        formData.append('price', Number(newProduct.price).toString());
        formData.append('quantity', Number(newProduct.quantity).toString());
        formData.append('category', newProduct.category || autoCategorize(newProduct.name));
        formData.append('status', newProduct.status || 'available');
        formData.append('visibility', 'visible');
        
        // IMPORTANT: Add discount field
        const discountValue = Number(newProduct.discount) || 0;
        formData.append('discount', discountValue.toString());
        console.log('🏷️ [PRODUCT] Discount being sent:', discountValue);
        
        // Priority 1: Add image file if uploaded
        if (newProduct.image) {
          formData.append('image', newProduct.image);
          console.log('[PRODUCT] Uploading image file:', newProduct.image.name);
        }
        // Priority 2: Add image URL if provided (and no file)
        else if (newProduct.imageUrl && !newProduct.imageUrl.startsWith('blob:')) {
          formData.append('imageUrl', newProduct.imageUrl);
          console.log('[PRODUCT] Using image URL:', newProduct.imageUrl);
        }

        console.log('[PRODUCT] Sending request to API...');
        const response = await fetch('http://localhost:3001/api/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type - let browser set it with boundary for FormData
          },
          body: formData
        });

        console.log('[PRODUCT] Response status:', response.status, response.statusText);
        const result = await response.json();
        console.log('[PRODUCT] Response data:', result);
        
        if (response.ok && result.ok) {
          console.log('[PRODUCT] ✅ Saved to database successfully:', result.product);
          // Update product data with database ID and image URL from server
          productData.id = result.product._id;
          productData.image = result.product.imageUrl || productData.image;
          
          // If image URL starts with /uploads/, prepend server URL
          if (productData.image && productData.image.startsWith('/uploads/')) {
            productData.image = `http://localhost:3001${productData.image}`;
          }
          
          console.log('[PRODUCT] Updated product image:', productData.image);
          savedSuccessfully = true;
          alert('✅ Product saved successfully to database!');
        } else {
          console.error('[PRODUCT] ❌ Failed to save to database');
          console.error('[PRODUCT] Status:', response.status);
          console.error('[PRODUCT] Error:', result.error);
          console.error('[PRODUCT] Full response:', result);
          
          if (response.status === 403) {
            const actualRole = result.currentRole || userRole || 'unknown';
            const expectedRole = result.expectedRole || 'farmer';
            alert(`❌ Access Denied: Only farmers can create products.

Your JWT token has role: "${actualRole}"
Expected role: "${expectedRole}"

This means your login session has the wrong role.

Solution:
1. Logout completely
2. Login again as a FARMER (not customer)
3. Try adding product again

Current localStorage role: ${userRole || 'unknown'}`);
          } else {
            alert(`❌ Failed to save to database: ${result.error || 'Unknown error'}\n\nProduct saved locally only.`);
          }
        }
      } else {
        console.warn('[PRODUCT] No auth token, saving locally only');
        alert('⚠️ Not logged in. Please login as a farmer to save products to database.');
      }

      if (editingProduct) {
        // Update existing product
        const updatedProducts = products.map(p => p.id === editingProduct.id ? productData : p);
        setProducts(updatedProducts);
        console.log('[PRODUCT] Product updated, total products:', updatedProducts.length);
        // Alert already shown above
      } else {
        // Add new product
        const newProducts = [...products, productData];
        setProducts(newProducts);
        console.log('[PRODUCT] Product added, total products:', newProducts.length);
        console.log('[PRODUCT] New product:', productData);
        // Alert already shown above
        
        // Reload products from database to get correct image URLs
        if (savedSuccessfully) {
          console.log('[PRODUCT] Reloading products from database...');
          try {
            const { fetchProducts } = await import('@/services/productService');
            const freshProducts = await fetchProducts();
            if (freshProducts && freshProducts.length > 0) {
              // Convert to local format
              const localProducts = freshProducts.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                price: p.price,
                quantity: p.stock,
                stock: p.stock,
                unit: p.unit || 'kg',
                description: p.description,
                image: p.image,
                farmer: p.farmer,
                status: 'available',
                visibility: 'visible',
                isOrganic: false,
                isCertified: false,
                isSeasonal: false
              }));
              setProducts(localProducts);
              console.log('[PRODUCT] ✅ Products reloaded from database');
            }
          } catch (error) {
            console.error('[PRODUCT] Failed to reload products:', error);
          }
        }
        
        // Add notification for low stock if applicable
        if (productData.quantity < 10) {
          const newNotification = {
            id: Date.now().toString(),
            type: 'warning',
            title: 'Low Stock Alert',
            message: `${productData.name} has low stock (${productData.quantity} ${productData.unit})`,
            time: 'Just now',
            read: false
          };
          setNotifications([newNotification, ...notifications]);
        }
      }

      // Reset form
      setNewProduct({
        name: '',
        category: '',
        price: '',
        quantity: '',
        unit: 'kg',
        description: '',
        image: null,
        imageUrl: '',
        isOrganic: false,
        isCertified: false,
        isSeasonal: false,
        status: 'available',
        discount: ''
      });
      setEditingProduct(null);
      setShowAddProduct(false);
      
      // Force re-render by switching sections
      setActiveSection('products');
      setTimeout(() => {
        setActiveSection('overview');
      }, 100);
    } catch (error) {
      console.error('[PRODUCT] Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  // Handle edit product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity?.toString() || product.stock?.toString() || '',
      unit: product.unit || 'kg',
      description: product.description || '',
      image: null,
      imageUrl: product.image || '',
      isOrganic: product.isOrganic || false,
      isCertified: product.isCertified || false,
      isSeasonal: product.isSeasonal || false,
      status: product.status || 'available',
      discount: product.discount || 0
    });
    setShowAddProduct(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will remove it from the database and customer view.')) {
      return;
    }

    try {
      const token = localStorage.getItem('fc_jwt');
      
      if (!token) {
        alert('❌ Not logged in. Please login to delete products.');
        return;
      }

      console.log('[DELETE] Deleting product:', productId);

      // Delete from database
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        console.log('[DELETE] ✅ Product deleted from database');
        
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));
        
        alert('✅ Product deleted successfully from database!\n\nIt will be removed from:\n- Your dashboard\n- Customer home page\n- All product listings');
      } else {
        console.error('[DELETE] ❌ Failed to delete:', result);
        alert(`❌ Failed to delete product: ${result.error || 'Unknown error'}\n\nPlease try again.`);
      }
    } catch (error: any) {
      console.error('[DELETE] Error:', error);
      alert(`❌ Error deleting product: ${error.message}\n\nPlease check your connection and try again.`);
    }
  };

  // Toggle product availability
  const toggleProductAvailability = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      console.error('[PRODUCT] Product not found:', productId);
      return;
    }

    // Toggle the status
    const newStatus = product.status === 'available' ? 'unavailable' : 'available';
    const newVisibility = newStatus === 'available' ? 'visible' : 'hidden';
    
    // Get token from localStorage
    const token = localStorage.getItem('fc_jwt');
    
    if (!token) {
      alert('⚠️ Session expired. Please login again.');
      onLogout();
      return;
    }

    console.log(`[PRODUCT] Toggling product ${productId} from ${product.status} to ${newStatus}`);
    console.log(`[PRODUCT] New visibility: ${newVisibility}`);
    console.log(`[PRODUCT] Token exists: ${!!token}, Token length: ${token.length}`);

    // Optimistically update UI
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, status: newStatus, visibility: newVisibility }
        : p
    ));

    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          visibility: newVisibility
        })
      });

      console.log(`[PRODUCT] API Response status: ${response.status}`);
      const data = await response.json();
      console.log('[PRODUCT] API Response data:', data);

      if (response.status === 401) {
        // Token is invalid or expired
        setProducts(products.map(p => 
          p.id === productId 
            ? { ...p, status: product.status, visibility: product.visibility }
            : p
        ));
        alert('⚠️ Your session has expired. Please login again.');
        onLogout();
        return;
      }

      if (!response.ok || !data.ok) {
        // Revert on error
        setProducts(products.map(p => 
          p.id === productId 
            ? { ...p, status: product.status, visibility: product.visibility }
            : p
        ));
        console.error('[PRODUCT] Failed to update product visibility:', data.error);
        alert(`Failed to update product: ${data.error || 'Unknown error'}`);
      } else {
        console.log(`[PRODUCT] ✅ Product ${productId} visibility updated to ${newVisibility}`);
        console.log('[PRODUCT] Product will now be', newStatus === 'unavailable' ? 'HIDDEN FROM' : 'VISIBLE ON', 'the customer home page');
        
        alert(`✅ Product ${newStatus === 'unavailable' ? 'is now HIDDEN from' : 'is now VISIBLE on'} the customer home page!\n\nCustomers will ${newStatus === 'unavailable' ? 'NOT' : ''} see this product when browsing.`);
      }
    } catch (error) {
      console.error('[PRODUCT] Error updating product visibility:', error);
      // Revert on error
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, status: product.status, visibility: product.visibility }
          : p
      ));
      alert('Error updating product. Please try again.');
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only image files are allowed (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      console.log('[IMAGE] File selected:', file.name, file.size, 'bytes');
      setNewProduct({ ...newProduct, image: file, imageUrl: '' });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setNewProduct(prev => ({ ...prev, image: file, imageUrl: previewUrl }));
    }
  };

  // Render Dashboard Overview
  const renderOverview = () => {
    const lowStockProducts = myProducts.filter(p => (p.stock || p.quantity) < 10);
    const recentOrders = orders.slice(0, 5);
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900">₹{stats.totalEarnings.toLocaleString()}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900">{stats.totalOrders}</h3>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Products</p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900">{stats.totalProducts}</h3>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900">{stats.pendingOrders}</h3>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Customer Orders</span>
              <Button size="sm" variant="outline" onClick={() => setActiveSection('orders')}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{(order.displayOrderId || order.orderId || order.id).replace(/-/g, '').trim()} - {order.productName}</p>
                      <p className="text-sm text-gray-600">{order.customerName} {order.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{order.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render Product Management
  const renderProducts = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Product Management
            <span className="text-sm font-normal text-gray-500">
              ({products.filter(p => p.farmer === userName).length} products)
            </span>
          </CardTitle>
          <Button onClick={() => {
            setEditingProduct(null);
            setShowAddProduct(true);
          }} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </CardHeader>
        <CardContent>
          {showAddProduct ? (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-xl font-bold mb-4 text-green-800">
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Crop'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Crop Name */}
                <div>
                  <Label className="font-semibold">Crop Name *</Label>
                  <Input 
                    placeholder="e.g., Organic Tomatoes" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>


                {/* Category (Auto or Manual) */}
                <div>
                  <Label className="font-semibold">Category</Label>
                  <Select 
                    value={newProduct.category} 
                    onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={newProduct.name ? `Auto: ${autoCategorize(newProduct.name)}` : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetables">🥬 Vegetables</SelectItem>
                      <SelectItem value="Fruits">🍎 Fruits</SelectItem>
                      <SelectItem value="Grains">🌾 Grains</SelectItem>
                      <SelectItem value="Pulses">🫘 Pulses</SelectItem>
                      <SelectItem value="Dairy">🥛 Dairy</SelectItem>
                      <SelectItem value="Other">📦 Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {newProduct.name && !newProduct.category && (
                    <p className="text-xs text-green-600 mt-1">Auto-detected: {autoCategorize(newProduct.name)}</p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <Label className="font-semibold">Unit</Label>
                  <Select 
                    value={newProduct.unit} 
                    onValueChange={(value) => setNewProduct({...newProduct, unit: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="g">Gram (g)</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="dozen">Dozen</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="quintal">Quintal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div>
                  <Label className="font-semibold">Quantity *</Label>
                  <Input 
                    type="number" 
                    placeholder="100" 
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                  />
                </div>

                {/* Price */}
                <div>
                  <Label className="font-semibold">Price per Unit (₹) *</Label>
                  <Input 
                    type="number" 
                    placeholder="40" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>

                {/* Discount */}
                <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
                  <Label className="font-semibold text-orange-700 flex items-center gap-2">
                    <span className="text-lg">🏷️</span> Discount Percentage
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="e.g., 10, 15, 20, 27..." 
                    min="0"
                    max="100"
                    value={newProduct.discount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewProduct({...newProduct, discount: val === '' ? '' : Math.min(100, Math.max(0, Number(val)))});
                    }}
                    className="mt-2 border-orange-300 focus:border-orange-500"
                  />
                  <p className="text-xs text-orange-600 mt-1 font-medium">
                    💡 Enter % OFF to attract customers! Leave empty for no discount.
                  </p>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <Label className="font-semibold">Description</Label>
                  <Textarea 
                    placeholder="Describe your crop (quality, farming method, etc.)..." 
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>

                {/* Image Upload - File or URL */}
                <div className="col-span-2 space-y-4">
                  <Label className="font-semibold">Product Image</Label>
                  
                  {/* Option 1: Upload File */}
                  <div>
                    <Label className="text-sm text-gray-600">Option 1: Upload Image File</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, WebP (Max 5MB)</p>
                  </div>
                  
                  {/* OR Divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-xs text-gray-500 font-semibold">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  
                  {/* Option 2: Paste URL */}
                  <div>
                    <Label className="text-sm text-gray-600">Option 2: Paste Image URL</Label>
                    <Input 
                      type="text" 
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                      className="mt-1"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      💡 Tip: Go to <a href="https://unsplash.com" target="_blank" className="underline">Unsplash.com</a>, find an image, right-click → Copy image address
                    </p>
                  </div>
                  
                  {/* Image Preview */}
                  {(newProduct.imageUrl || newProduct.image) && (
                    <div className="mt-2">
                      <Label className="text-sm text-gray-600">Preview:</Label>
                      <img 
                        src={newProduct.imageUrl || (newProduct.image ? URL.createObjectURL(newProduct.image) : '')} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-green-300 mt-1" 
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Special Tags */}
                <div className="col-span-2 space-y-3">
                  <Label className="font-semibold">Product Tags</Label>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newProduct.isOrganic}
                        onChange={(e) => setNewProduct({...newProduct, isOrganic: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">🌱 Organic</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newProduct.isCertified}
                        onChange={(e) => setNewProduct({...newProduct, isCertified: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">✅ Certified</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newProduct.isSeasonal}
                        onChange={(e) => setNewProduct({...newProduct, isSeasonal: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">🍂 Seasonal</span>
                    </label>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="col-span-2">
                  <Label className="font-semibold">Availability Status</Label>
                  <Select 
                    value={newProduct.status} 
                    onValueChange={(value: 'available' | 'unavailable') => setNewProduct({...newProduct, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">✅ Available</SelectItem>
                      <SelectItem value="unavailable">❌ Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Button 
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  onClick={handleSaveProduct}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: '', category: '', price: '', quantity: '', unit: 'kg',
                      description: '', image: null, imageUrl: '', isOrganic: false, 
                      isCertified: false, isSeasonal: false, status: 'available', discount: ''
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.farmer === userName).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Yet</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first crop listing</p>
                  <Button onClick={() => setShowAddProduct(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                products.filter(p => p.farmer === userName).map(product => (
                  <Card key={product.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300">
                    <CardContent className="p-4">
                      {/* Product Image */}
                      <div className="text-center mb-4">
                        <div className="w-full h-40 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                          {product.image?.startsWith('data:') || product.image?.startsWith('http') ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-6xl">{product.image || '🌾'}</span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {product.status === 'available' ? '✓ AVAILABLE' : '✗ UNAVAILABLE'}
                        </span>
                        {product.isOrganic && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">🌱 Organic</span>}
                        {product.isCertified && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">✅ Certified</span>}
                        {product.isSeasonal && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">🍂 Seasonal</span>}
                      </div>

                      {/* Product Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-bold text-green-600">₹{product.price}/{product.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Stock:</span>
                          <span className="font-bold">{product.stock || product.quantity} {product.unit}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full"
                          variant={product.status === 'available' ? 'outline' : 'default'}
                          onClick={() => toggleProductAvailability(product.id)}
                        >
                          {product.status === 'available' ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Mark Unavailable
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Mark Available
                            </>
                          )}
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );


  // Handle Update Stock
  const handleUpdateStock = (productId: string) => {
    if (!newStockValue || Number(newStockValue) < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }
    
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, stock: Number(newStockValue), quantity: Number(newStockValue) }
        : p
    ));
    
    alert('Stock updated successfully!');
    setEditingStock(null);
    setNewStockValue('');
  };

  // Render Inventory
  const renderInventory = () => {
    const farmerProducts = products.filter(p => p.farmer === userName);
    const lowStockProducts = farmerProducts.filter(p => (p.stock || p.quantity || 0) < 10);

    return (
      <Card>
        <CardHeader>
          <CardTitle>🌾 Inventory & Supply Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
              <div className="space-y-2">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="font-semibold text-yellow-800">
                        Low Stock Alert: {product.name} ({product.stock || product.quantity} {product.unit} remaining)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left border-b">Crop Name</th>
                    <th className="p-3 text-left border-b">Current Stock</th>
                    <th className="p-3 text-left border-b">Status</th>
                    <th className="p-3 text-left border-b">Price</th>
                    <th className="p-3 text-left border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        No products in inventory. Add products to track stock.
                      </td>
                    </tr>
                  ) : (
                    farmerProducts.map(product => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{product.image}</span>
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {editingStock === product.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={newStockValue}
                                onChange={(e) => setNewStockValue(e.target.value)}
                                placeholder="New stock"
                                className="w-24"
                              />
                              <span className="text-sm text-gray-600">{product.unit}</span>
                            </div>
                          ) : (
                            <span className="font-semibold">
                              {product.stock || product.quantity} {product.unit}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            product.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status === 'available' ? '✓ In Stock' : '✗ Out of Stock'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-green-600">
                            ₹{product.price}/{product.unit}
                          </span>
                        </td>
                        <td className="p-3">
                          {editingStock === product.id ? (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateStock(product.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditingStock(null);
                                  setNewStockValue('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingStock(product.id);
                                setNewStockValue((product.stock || product.quantity || 0).toString());
                              }}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Update Stock
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (!selectedCustomer || !messageText.trim()) {
      alert('Please select a customer and enter a message');
      return;
    }
    alert(`Message sent to ${selectedCustomer}:\n"${messageText}"`);
    setMessageText('');
    setSelectedCustomer('');
  };

  // Handle reply
  const handleReply = (customerName: string) => {
    setReplyingTo(customerName);
  };

  // Send reply
  const handleSendReply = (customerName: string) => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }
    alert(`Reply sent to ${customerName}:\n"${replyText}"`);
    setReplyText('');
    setReplyingTo(null);
  };


  // Render Orders Section
  const renderOrders = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-orange-600" />
          Orders / Customer Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap font-medium">{order.displayOrderId || order.orderId || order._id}</td>
                    <td className="px-4 py-4">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              {item.product?.name || item.name || 'Product'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">{order.customerName}</td>
                    <td className="px-4 py-4">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              {item.quantity} {item.product?.unit || item.unit || 'kg'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-green-600">₹{order.total || order.amount}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {(() => {
                          // Status flow: pending → confirmed → packed → dispatched → shipped → out for delivery → delivered
                          const statusMap: { [key: string]: string } = {
                            'pending': 'Confirm Order',
                            'confirmed': 'Pack',
                            'packed': 'Dispatch',
                            'dispatched': 'Ship',
                            'shipped': 'Out for Delivery',
                            'out for delivery': 'Deliver'
                          };
                          const currentStatus = order.status?.toLowerCase() || 'pending';
                          const nextAction = statusMap[currentStatus];
                          const isCompleted = currentStatus === 'delivered' || currentStatus === 'cancelled';
                          
                          return (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600"
                              onClick={() => handleAcceptOrder(order)}
                              disabled={isCompleted}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {isCompleted ? (currentStatus === 'delivered' ? 'Completed' : 'Rejected') : nextAction || 'Accept'}
                            </Button>
                          );
                        })()}
                        {/* Only show Reject button for pending orders */}
                        {order.status?.toLowerCase() === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => handleRejectOrder(order)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        {/* Delete button for all orders */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-gray-600 hover:text-red-600 hover:border-red-600 transition-colors"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No orders yet</p>
            <p className="text-sm text-gray-500 mt-2">Orders from customers will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );


  // Render Analytics Section
  const renderAnalytics = () => {
    // Sample data for charts - you can replace with real data
    const revenueData = [
      { month: 'Jan', revenue: Math.floor(stats.totalEarnings * 0.1) },
      { month: 'Feb', revenue: Math.floor(stats.totalEarnings * 0.12) },
      { month: 'Mar', revenue: Math.floor(stats.totalEarnings * 0.15) },
      { month: 'Apr', revenue: Math.floor(stats.totalEarnings * 0.18) },
      { month: 'May', revenue: Math.floor(stats.totalEarnings * 0.2) },
      { month: 'Jun', revenue: Math.floor(stats.totalEarnings * 0.25) }
    ];

    const orderStatusData = [
      { name: 'Completed', value: stats.completedOrders, color: '#10b981' },
      { name: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
      { name: 'Processing', value: Math.max(0, stats.totalOrders - stats.completedOrders - stats.pendingOrders), color: '#3b82f6' }
    ];

    const topProductsData = myProducts.slice(0, 5).map(p => ({
      name: p.name.substring(0, 15),
      sales: Math.floor(Math.random() * 50) + 10
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">₹{stats.totalEarnings.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Products Listed</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalProducts}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Orders Completed</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completedOrders}</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products by Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Products by Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#10b981" name="Sales Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Render Feedback Section
  const renderFeedback = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-6 h-6 text-pink-600" />
          Customer Feedback / Ratings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedback.length > 0 ? (
          <div className="space-y-4">
            {feedback.map(review => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.customerName}</p>
                    <p className="text-sm text-gray-500">{review.productName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-2">{review.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No customer feedback yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Render Payments Section
  const renderPayments = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
                <h3 className="text-3xl font-bold mt-2 text-gray-900">₹{stats.totalEarnings.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-orange-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Payments</p>
                <h3 className="text-3xl font-bold mt-2 text-gray-900">₹{pendingPayments.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Last Payment</p>
                <h3 className="text-lg font-bold mt-2 text-gray-900">{allTransactions.length > 0 ? allTransactions[0].date : 'N/A'}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-teal-600" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {allTransactions.length > 0 ? (
            <div className="overflow-x-auto max-w-full">
              <table className="w-full min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allTransactions.map(txn => (
                    <tr key={txn.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{txn.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{txn.customerName}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{txn.productName}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{txn.quantity}</td>
                      <td className="px-4 py-4 whitespace-nowrap font-bold text-green-600">₹{txn.amount}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">{txn.paymentId}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          txn.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render Profile Section
  const renderProfile = () => (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6 text-green-600" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  htmlFor="farmer-profile-upload" 
                  className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all transform hover:scale-110"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="farmer-profile-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                        alert('Please upload a valid image file (JPG, PNG, or WebP)');
                        return;
                      }

                      if (file.size > 5 * 1024 * 1024) {
                        alert('Image size must be less than 5MB');
                        return;
                      }

                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfilePicturePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);

                      setIsUploadingProfileImage(true);
                      const token = localStorage.getItem('fc_jwt');
                      if (!token) {
                        alert('Please login to upload profile picture');
                        setIsUploadingProfileImage(false);
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
                          alert('Profile picture updated successfully');
                        } else {
                          throw new Error(data.error || 'Failed to upload image');
                        }
                      } catch (error: any) {
                        alert('Failed to upload image. Please try again.');
                        setProfilePicturePreview(profileData.profilePicture || null);
                      } finally {
                        setIsUploadingProfileImage(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                {isUploadingProfileImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold">{userName}</h3>
                <p className="text-sm text-gray-500">Farmer</p>
                <p className="text-xs text-gray-400 mt-2">Click the camera icon to upload a new profile picture</p>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">Full Name *</Label>
                  <Input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Email Address *</Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Phone Number *</Label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">Current Password</Label>
                  <Input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                    placeholder="Enter current password"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium mb-2">New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                      placeholder="Enter new password"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2">Confirm Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                      placeholder="Confirm new password"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={async () => {
                  const token = localStorage.getItem('fc_jwt');
                  if (!token) {
                    alert('Please login to update profile');
                    return;
                  }

                  const passwordChanged = passwordData.current || passwordData.new || passwordData.confirm;
                  
                  if (passwordChanged) {
                    if (!passwordData.current) {
                      alert('Please enter current password');
                      return;
                    }
                    if (passwordData.new !== passwordData.confirm) {
                      alert('New passwords do not match');
                      return;
                    }
                    if (passwordData.new.length < 6) {
                      alert('Password must be at least 6 characters');
                      return;
                    }
                  }
                  
                  try {
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
                      alert(profileResult.error || 'Failed to update profile');
                      return;
                    }

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
                        alert(passwordResult.error || 'Failed to change password');
                        return;
                      }
                    }

                    alert('Profile updated successfully!');
                    setPasswordData({ current: '', new: '', confirm: '' });
                  } catch (error) {
                    console.error('[PROFILE] Error saving:', error);
                    alert('Failed to update profile');
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  );

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'products': return renderProducts();
      case 'orders': return renderOrders();
      case 'analytics': return renderAnalytics();
      case 'feedback': return renderFeedback();
      case 'payments': return renderPayments();
      case 'profile': return renderProfile();
      default: return renderOverview();
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
                className="h-16 w-auto"
              />
            </div>

            {/* Center - Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setActiveSection('overview')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'overview' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveSection('products')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'products' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveSection('orders')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'orders' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveSection('payments')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'payments' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Payments
              </button>
            </div>

            {/* Right Side - Welcome Message, Notifications & Avatar */}
            <div className="flex items-center gap-4">
              {/* Welcome Message */}
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-gray-900">Welcome back!</p>
                <p className="text-xs text-gray-500">{userName}</p>
              </div>
              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notificationRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">Notifications</h3>
                        <p className="text-xs text-green-100">{notifications.filter(n => !n.read).length} unread</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-white hover:bg-white/20"
                        onClick={markAllNotificationsAsRead}
                      >
                        Mark all read
                      </Button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon based on type */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                notification.type === 'order' ? 'bg-green-100 text-green-600' :
                                notification.type === 'stock' ? 'bg-orange-100 text-orange-600' :
                                notification.type === 'payment' ? 'bg-blue-100 text-blue-600' :
                                notification.type === 'message' ? 'bg-purple-100 text-purple-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {notification.type === 'order' && <ShoppingCart className="w-5 h-5" />}
                                {notification.type === 'stock' && <AlertCircle className="w-5 h-5" />}
                                {notification.type === 'payment' && <IndianRupee className="w-5 h-5" />}
                                {notification.type === 'message' && <MessageSquare className="w-5 h-5" />}
                                {notification.type === 'announcement' && <Bell className="w-5 h-5" />}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className={`font-semibold text-sm ${
                                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-gray-50 border-t">
                      <Button 
                        variant="ghost" 
                        className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveSection('overview');
                        }}
                      >
                        View All Notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-green-600 transition-all"
                >
                  {profilePicturePreview || profileData.profilePicture ? (
                    <img 
                      src={profilePicturePreview || profileData.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {profilePicturePreview || profileData.profilePicture ? (
                          <img 
                            src={profilePicturePreview || profileData.profilePicture} 
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
                          <p className="text-xs text-gray-500">Farmer</p>
                        </div>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 transition-colors text-red-600 font-medium group"
                      >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm">Logout</span>
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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map(item => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start text-left h-auto py-3 px-3 whitespace-normal"
                      onClick={() => setActiveSection(item.id as any)}
                    >
                      <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${item.color}`} />
                      <span className="text-sm font-medium leading-tight">{item.label}</span>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-5">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveFarmerDashboard;
