import { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, MapPin, User, Phone, X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Checkout
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleOrderSubmit} className="space-y-6">
            {/* Product Details */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Product Details</h3>
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
                  <h4 className="font-semibold text-lg">{product.title}</h4>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="text-lg font-bold text-primary mt-2">₹{product.price} per unit</p>
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
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Details
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
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per unit:</span>
                  <span className="font-medium">₹{product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{orderQuantity} units</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={isProcessing}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderCheckout;
