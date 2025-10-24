import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Package, TruckIcon, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Order {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  farmerId: {
    _id: string;
    name: string;
  };
  products: Array<{
    productId: {
      _id: string;
      title: string;
      imageUrl: string;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentInfo: {
    method: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
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
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setStatusMessage('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setStatusMessage(`✅ Order status updated to ${newStatus}`);
        loadOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      } else {
        const error = await response.json();
        setStatusMessage(error.error || 'Failed to update status');
      }
    } catch (error) {
      setStatusMessage('Failed to update status');
    }
  };

  const handleExportOrders = () => {
    // Create CSV content
    const headers = ['Order ID', 'Customer', 'Farmer', 'Total', 'Status', 'Payment', 'Date'];
    const rows = filteredOrders.map(order => [
      order._id.slice(-8),
      order.customerId?.name || 'Unknown',
      order.farmerId?.name || 'Unknown',
      `₹${order.total}`,
      order.status,
      order.paymentInfo.paymentStatus,
      new Date(order.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setStatusMessage('✅ Orders exported successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getPaymentColor = (status: string) => {
    switch (status) {
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.includes(searchQuery) ||
                         order.customerId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.farmerId?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentInfo.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage all customer orders</p>
        </div>
        <Button onClick={handleExportOrders} variant="outline">
          <Download className="w-5 h-5 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-gradient">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="card-gradient">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Farmer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.customerId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.farmerId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">
                        ₹{order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPaymentColor(order.paymentInfo.paymentStatus)}>
                          {order.paymentInfo.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateStatus(order._id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Details #{selectedOrder._id.slice(-8)}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                <XCircle className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Order Status</p>
                  <Badge className={`${getStatusColor(selectedOrder.status)} mt-1`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge className={`${getPaymentColor(selectedOrder.paymentInfo.paymentStatus)} mt-1`}>
                    {selectedOrder.paymentInfo.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">₹{selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold mb-3">Products</h3>
                <div className="space-y-2">
                  {selectedOrder.products.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                      {item.productId?.imageUrl ? (
                        <img
                          src={item.productId.imageUrl}
                          alt={item.productId.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-2xl">
                          🌾
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.productId?.title || 'Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <p className="font-bold text-primary">₹{(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedOrder.customerId?.name || 'Unknown'}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerId?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm">
                    <p>{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p>PIN: {selectedOrder.shippingAddress.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Farmer Info */}
              <div>
                <h3 className="font-semibold mb-2">Farmer Information</h3>
                <p className="text-sm">{selectedOrder.farmerId?.name || 'Unknown'}</p>
              </div>

              {/* Update Status */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'confirmed')}
                  disabled={selectedOrder.status === 'confirmed'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'shipped')}
                  disabled={selectedOrder.status === 'shipped'}
                >
                  <TruckIcon className="w-4 h-4 mr-2" />
                  Ship
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                  disabled={selectedOrder.status === 'delivered'}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Deliver
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                  disabled={selectedOrder.status === 'cancelled'}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
