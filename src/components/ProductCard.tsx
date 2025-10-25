import { useState } from "react";
import { Star, MapPin, User, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateDiscountedPrice } from "@/lib/priceUtils";

interface Product {
  id: string;
  _id?: string;
  name: string;
  title?: string;
  price: number;
  unit: string;
  quantity?: number;
  farmer: string;
  location: string;
  image: string;
  imageUrl?: string;
  rating: number;
  category: string;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  onOrder: (product: Product) => void;
}

const ProductCard = ({ product, onOrder }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Calculate effective price (with discount if applicable)
  const effectivePrice = product.discount && product.discount > 0 
    ? calculateDiscountedPrice(product.price, product.discount)
    : product.price;
  
  const totalPrice = (effectivePrice * quantity).toFixed(2);

  return (
    <Card className="card-gradient overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border border-border/20">
      <div className="aspect-square bg-muted/20 relative flex items-center justify-center">
        <div className="text-6xl">{product.image}</div>
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          {product.discount && product.discount > 0 ? (
            <div className="flex flex-col items-end">
              <span className="text-xs line-through opacity-70">₹{product.price}</span>
              <span>₹{effectivePrice.toFixed(2)}/{product.unit}</span>
            </div>
          ) : (
            <span>₹{product.price}/{product.unit}</span>
          )}
        </div>
        {/* Discount Badge - Left side */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg animate-pulse">
            {product.discount}% OFF
          </div>
        )}
        {/* Favorite Heart Button - Below discount badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute ${product.discount && product.discount > 0 ? 'top-16' : 'top-3'} left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer`}
          aria-label="Toggle favorite"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorite 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-400 hover:text-red-400'
            }`}
          />
        </button>
      </div>
      
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="font-bold text-xl text-foreground mb-1">{product.name}</h3>
          <span className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">Available: 50kg</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{product.farmer}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{product.location}</span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <label htmlFor={`quantity-${product.id}`} className="text-sm font-medium text-foreground">
              Quantity:
            </label>
            <select
              id={`quantity-${product.id}`}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="px-3 py-1.5 border border-border rounded-md bg-background text-foreground cursor-pointer hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30].map((qty) => (
                <option key={qty} value={qty}>
                  {qty} {product.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Total Price Display */}
          <div className="flex items-center justify-between bg-primary/10 px-3 py-2 rounded-lg">
            <span className="text-sm font-semibold text-foreground">Total Price:</span>
            <span className="text-lg font-bold text-primary">₹{totalPrice}</span>
          </div>
        </div>
        
        <Button 
          onClick={() => onOrder(product)}
          className="w-full btn-hero"
        >
          <ShoppingBag className="mr-2 w-4 h-4" />
          Order Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;