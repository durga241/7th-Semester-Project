import { CheckCircle, Package, MapPin, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OrderConfirmationProps {
  onClose: () => void;
  orderDetails: {
    id: string;
    items: Array<{ name: string; quantity: number; price: number; unit: string; image: string }>;
    total: number;
    farmer: string;
    location: string;
    estimatedDelivery: string;
  };
}

const OrderConfirmation = ({ onClose, orderDetails }: OrderConfirmationProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <CardContent className="p-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed! 🎉</h2>
            <p className="text-muted-foreground">Order ID: #{orderDetails.id}</p>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
              
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.image}</span>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} {item.unit}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-foreground">Total:</span>
                  <span className="font-bold text-lg text-primary">₹{orderDetails.total}</span>
                </div>
              </div>
            </div>

            {/* Farmer & Delivery Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{orderDetails.farmer}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{orderDetails.location}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Estimated Delivery: {orderDetails.estimatedDelivery}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={onClose} className="w-full btn-hero">
              <Package className="w-4 h-4 mr-2" />
              Track Order
            </Button>
            
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>

          {/* Success Message */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Your order has been sent to the farmer. You'll receive updates via SMS.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderConfirmation;