import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ShoppingCart, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState('');

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const handleCancellation = async () => {
      if (!orderId) {
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch('/api/stripe/cancel-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
          },
          body: JSON.stringify({ orderId })
        });

        const data = await response.json();

        if (!data.ok) {
          setError(data.error || 'Failed to cancel order');
        }
      } catch (error) {
        console.error('Cancel payment error:', error);
        setError('Failed to process cancellation');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCancellation();
  }, [orderId]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-16 h-16 text-orange-600 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900">Processing...</h2>
              <p className="text-gray-600 text-center">Please wait</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-red-200">
        <CardHeader className="text-center bg-gradient-to-br from-orange-50 to-red-50 border-b-2 border-red-200">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-600 p-4 shadow-lg">
              <XCircle className="w-20 h-20 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-red-700 mb-2">Payment Cancelled</CardTitle>
          <p className="text-gray-700 text-lg font-medium mt-2">Your payment was not completed</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Cancellation Message */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6 text-center">
            <h3 className="font-bold text-xl text-orange-900 mb-3">⚠️ What Happened?</h3>
            <p className="text-gray-700 leading-relaxed">
              You cancelled the payment process or the payment failed. 
              Your order has not been placed and no charges were made to your account.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
              <p className="text-sm text-red-800 font-semibold">❌ {error}</p>
            </div>
          )}

          {/* Order Info */}
          {orderId && (
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-semibold">Order Reference</p>
              <p className="font-bold text-gray-900 text-lg mt-1">{orderId}</p>
              <p className="text-xs text-red-600 mt-2 font-medium">⛔ This order was not completed</p>
            </div>
          )}

          {/* What to do next */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
            <h4 className="font-bold text-blue-900 mb-3 text-lg">🔄 Want to try again?</h4>
            <ul className="text-sm text-blue-800 space-y-2 list-none">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✅</span>
                <span>Check your cart and proceed to checkout again</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✅</span>
                <span>Ensure your payment details are correct</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✅</span>
                <span>Make sure you have sufficient funds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✅</span>
                <span>Contact support if you continue to face issues</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1 border-2 border-gray-300 hover:border-gray-500 py-6 text-lg font-semibold"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-gray-600 pt-4 border-t-2 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">📞 Need help? Contact our support team</p>
            <p className="text-xs mt-2 text-gray-500">We're here to assist you with any payment issues</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancel;
