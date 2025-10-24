import { useState, useEffect } from 'react';
import { Package, User, Phone, MapPin, Calendar, CreditCard, TruckIcon, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateOrderStatus } from '@/services/api';
import { toast } from 'sonner';

interface Order {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  products: Array<{
    productId: {
      _id: string;
      title: string;
      imageUrl: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  paymentInfo: {
    method: string;
    paymentStatus: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FarmerOrdersProps {
  farmerId: string;
  onStatusMessage: (message: string) => void;
}

const FarmerOrders = ({ farmerId, onStatusMessage }: FarmerOrdersProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>('all');

  useEffect(() => {
    loadOrders();
  }, [farmerId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/farmer/${farmerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        console.log(`Loaded ${data.orders?.length || 0} orders`);
      } else {
        onStatusMessage('Failed to load orders');
      }
    } catch (error) {
      console.error('Load orders error:', error);
      onStatusMessage('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // Optimistic UI update
    const previousOrders = [...orders];
    setOrders(orders.map(order => 
      order._id === orderId ? { ...order, status: newStatus } : order
    ));

    try {
      toast.loading('Updating order status...');
      await updateOrderStatus(orderId, newStatus);
      toast.dismiss();
      toast.success(`✅ Order status updated to ${newStatus}!`);
      
      // Reload to ensure sync
      await loadOrders();
    } catch (error) {
      // Revert on error
      setOrders(previousOrders);
      toast.dismiss();
      toast.error('Failed to update order status');
      console.error('Update order status error:', error);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="card-gradient">
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Orders Yet</h3>
          <p className="text-muted-foreground">
            Orders from customers will appear here once they start purchasing your products.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Pending ({orders.filter(o => o.status.toLowerCase() === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'confirmed'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Confirmed ({orders.filter(o => o.status.toLowerCase() === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'delivered'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Delivered ({orders.filter(o => o.status.toLowerCase() === 'delivered').length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order._id} className="card-gradient hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.paymentInfo.paymentStatus)}>
                    {order.paymentInfo.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Products */}
              <div className="space-y-3">
                {order.products.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    {item.productId?.imageUrl ? (
                      <img
                        src={item.productId.imageUrl}
                        alt={item.productId.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
                        🌾
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.productId?.title || 'Product'}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    {order.customerId?.email && (
                      <p className="text-muted-foreground">{order.customerId.email}</p>
                    )}
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p>PIN: {order.shippingAddress.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Payment Method: {order.paymentInfo.method}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">₹{order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Order Status Actions */}
              {order.status.toLowerCase() !== 'delivered' && order.status.toLowerCase() !== 'cancelled' && (
                <div className="pt-3 border-t">
                  <h4 className="font-semibold mb-3 text-sm">Update Order Status:</h4>
                  <div className="flex flex-wrap gap-2">
                    {order.status.toLowerCase() === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept Order
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {order.status.toLowerCase() === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order._id, 'shipped')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <TruckIcon className="w-4 h-4 mr-1" />
                        Mark as Shipped
                      </Button>
                    )}
                    {order.status.toLowerCase() === 'shipped' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order._id, 'delivered')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && filter !== 'all' && (
        <Card className="card-gradient">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No {filter} orders found.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FarmerOrders;
