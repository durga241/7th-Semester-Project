import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Clear cart from local storage when component mounts
    const clearCart = () => {
      try {
        localStorage.removeItem('cart');
        console.log('🛒 Cart cleared after successful payment');
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    };

    const verifyPayment = async () => {
      if (!sessionId || !orderId) {
        setVerificationError('Missing payment information');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
          },
          body: JSON.stringify({ sessionId, orderId })
        });

        const data = await response.json();

        if (data.ok) {
          // Clear cart when payment is verified
          clearCart();
          
          // Dispatch custom event to notify other components to clear cart
          const event = new CustomEvent('clearCart');
          window.dispatchEvent(event);
          
          setOrderDetails(data.order);
          setIsVerifying(false);
        } else {
          setVerificationError(data.error || 'Payment verification failed');
          setIsVerifying(false);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationError('Failed to verify payment');
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900">Verifying Payment...</h2>
              <p className="text-gray-600 text-center">Please wait while we confirm your payment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">{verificationError}</p>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1"
              >
                Go Home
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-green-600">Payment Successful!</CardTitle>
          <p className="text-gray-600 mt-2">Thank you for your order</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Order Summary */}
          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Order Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{orderDetails._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-green-600">₹{orderDetails.total?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className="font-medium capitalize">{orderDetails.paymentInfo?.paymentStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <p className="font-medium capitalize">{orderDetails.status}</p>
                </div>
              </div>

              {orderDetails.shippingAddress && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                  <div className="text-sm">
                    <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                    <p>{orderDetails.shippingAddress.address}</p>
                    <p>
                      {orderDetails.shippingAddress.city && `${orderDetails.shippingAddress.city}, `}
                      {orderDetails.shippingAddress.state && `${orderDetails.shippingAddress.state} `}
                      {orderDetails.shippingAddress.pincode}
                    </p>
                    <p>{orderDetails.shippingAddress.phone}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900">What's Next?</h4>
                <p className="text-sm text-green-800 mt-1">
                  Your order has been confirmed and the farmer will start processing it. 
                  You'll receive updates via email about your order status.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
              size="lg"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500">
            <p>A confirmation email has been sent to your registered email address.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
