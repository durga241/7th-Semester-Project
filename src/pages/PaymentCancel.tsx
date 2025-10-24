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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-red-600">Payment Cancelled</CardTitle>
          <p className="text-gray-600 mt-2">Your payment was not completed</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Cancellation Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">What Happened?</h3>
            <p className="text-gray-700">
              You cancelled the payment process or the payment failed. 
              Your order has not been placed and no charges were made to your account.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Order Info */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Order Reference</p>
              <p className="font-medium text-gray-900">{orderId}</p>
              <p className="text-xs text-gray-500 mt-1">This order was not completed</p>
            </div>
          )}

          {/* What to do next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Want to try again?</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Check your cart and proceed to checkout again</li>
              <li>Ensure your payment details are correct</li>
              <li>Make sure you have sufficient funds</li>
              <li>Contact support if you continue to face issues</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>Need help? Contact our support team</p>
            <p className="text-xs mt-1">We're here to assist you with any payment issues</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancel;
