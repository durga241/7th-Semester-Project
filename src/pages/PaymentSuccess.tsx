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
        localStorage.removeItem('fc_cart');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-green-200">
        <CardHeader className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-b-2 border-green-200">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-600 p-4 shadow-lg animate-bounce">
              <CheckCircle className="w-20 h-20 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-green-700 mb-2">Payment Successful!</CardTitle>
          <p className="text-gray-700 text-lg font-medium mt-2">🎉 Thank you for your order</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Order Summary */}
          {orderDetails && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 space-y-4 border-2 border-green-200">
              <h3 className="font-bold text-xl text-green-800 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Order Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Order ID</p>
                  <p className="font-bold text-gray-900 mt-1">{orderDetails.orderId || orderDetails._id}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Total Amount</p>
                  <p className="font-bold text-green-700 text-xl mt-1">₹{orderDetails.total?.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Payment Status</p>
                  <p className="font-semibold capitalize text-green-600 mt-1">{orderDetails.paymentInfo?.paymentStatus || 'Completed'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Order Status</p>
                  <p className="font-semibold capitalize text-blue-600 mt-1">{orderDetails.status || 'Pending'}</p>
                </div>
              </div>

              {orderDetails.shippingAddress && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Delivery Address</p>
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-gray-900">{orderDetails.shippingAddress.name}</p>
                    <p className="text-gray-700">{orderDetails.shippingAddress.address}</p>
                    <p className="text-gray-700">
                      {orderDetails.shippingAddress.city && `${orderDetails.shippingAddress.city}, `}
                      {orderDetails.shippingAddress.state && `${orderDetails.shippingAddress.state} `}
                      {orderDetails.shippingAddress.pincode}
                    </p>
                    <p className="text-gray-700 font-medium">☎ {orderDetails.shippingAddress.phone}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Package className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 text-lg">What's Next?</h4>
                <p className="text-sm text-blue-800 mt-2 leading-relaxed">
                  ✅ Your order has been confirmed and the farmer will start processing it.<br/>
                  📧 You'll receive updates via email about your order status.<br/>
                  🚚 Track your order from your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-7 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">✉️ A confirmation email has been sent to your registered email address.</p>
            <p className="text-xs text-gray-500 mt-2">Check your inbox for order details and tracking information</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
