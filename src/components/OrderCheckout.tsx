import { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, MapPin, User, Phone, X, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  _id: string;
  id?: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string;
}

interface OrderCheckoutProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
  onStatusMessage: (message: string) => void;
}

// Stripe will handle payment UI through hosted checkout page

const OrderCheckout = ({ product, onClose, onSuccess, onStatusMessage }: OrderCheckoutProps) => {
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const totalAmount = product.price * orderQuantity;

  // No script loading needed for Stripe - it uses hosted checkout

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderQuantity > product.quantity) {
      onStatusMessage(`Only ${product.quantity} units available`);
      return;
    }

    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address) {
      onStatusMessage('Please fill all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        },
        body: JSON.stringify({
          items: [{
            productId: product._id || product.id,
            quantity: orderQuantity,
            price: product.price
          }],
          shippingAddress: {
            name: shippingDetails.name,
            address: shippingDetails.address,
            city: shippingDetails.city || 'City',
            state: shippingDetails.state || 'State',
            pincode: shippingDetails.pincode || '000000',
            phone: shippingDetails.phone
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const result = await response.json();
      
      if (!result.ok || !result.sessionUrl) {
        throw new Error('Invalid checkout session response');
      }

      // Redirect to Stripe Checkout
      window.location.href = result.sessionUrl;

    } catch (error: any) {
      console.error('Checkout creation error:', error);
      onStatusMessage(error?.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-green-200">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <img 
                src="/logo.png" 
                alt="FarmConnect Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const homeIcon = e.currentTarget.nextElementSibling as HTMLElement;
                  if (homeIcon) homeIcon.style.display = 'block';
                }}
              />
              <Home className="w-6 h-6 text-white" style={{display: 'none'}} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-green-700">
                <ShoppingCart className="w-6 h-6" />
                Secure Checkout
              </CardTitle>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                Powered by Stripe • SSL Encrypted
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
            className="hover:bg-red-100 hover:text-red-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleOrderSubmit} className="space-y-6">
            {/* Product Details */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-100">
              <h3 className="font-semibold mb-4 text-green-800 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Details
              </h3>
              <div className="flex gap-4">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center text-3xl">
                    🌾
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900">{product.title}</h4>
                  <p className="text-sm text-green-600 font-medium">{product.category}</p>
                  <p className="text-xl font-bold text-green-700 mt-2">₹{product.price} <span className="text-sm font-normal text-gray-600">per unit</span></p>
                  <p className="text-sm text-muted-foreground">Available: {product.quantity} units</p>
                </div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.quantity}
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                className="mt-1"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum available: {product.quantity} units
              </p>
            </div>

            {/* Shipping Details */}
            <div className="space-y-4 bg-blue-50 p-5 rounded-xl border-2 border-blue-100">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </h3>
              
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={shippingDetails.name}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="pl-10"
                    required
                  />
                  {shippingDetails.name && shippingDetails.name.trim().length < 2 && (
                    <p className="text-xs text-red-500 mt-1">Name must be at least 2 characters</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="pl-10"
                    required
                  />
                  {shippingDetails.phone && shippingDetails.phone.length < 10 && (
                    <p className="text-xs text-red-500 mt-1">Please enter a valid phone number</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                  placeholder="Enter your complete address"
                  className="mt-1"
                  rows={3}
                  required
                />
                {shippingDetails.address && shippingDetails.address.trim().length < 10 && (
                  <p className="text-xs text-red-500 mt-1">Please enter a complete address (at least 10 characters)</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingDetails.city}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                    placeholder="City"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shippingDetails.state}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                    placeholder="State"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={shippingDetails.pincode}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-5 border-2 border-green-200">
              <h3 className="font-bold mb-4 text-green-800 text-lg">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Price per unit:</span>
                  <span className="font-semibold">₹{product.price}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Quantity:</span>
                  <span className="font-semibold">{orderQuantity} units</span>
                </div>
                <div className="border-t-2 border-green-300 pt-3 mt-3">
                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-green-700">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                disabled={isProcessing}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {isProcessing ? 'Processing...' : 'Proceed to Secure Payment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600 py-6 text-lg font-semibold transition-all"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center pt-3 space-y-2">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2 font-medium">
                <CreditCard className="w-4 h-4 text-green-600" />
                256-bit SSL Encrypted Payment • Powered by Stripe
              </p>
              <p className="text-xs text-gray-500">Your payment information is secure and never stored on our servers</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderCheckout;
