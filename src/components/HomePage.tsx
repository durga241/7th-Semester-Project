import React, { useEffect, useState } from 'react';
import { Search, MapPin, Leaf, Users, TrendingUp, ShoppingBag, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import LocationSelector from './LocationSelector';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  farmer: string;
  location: string;
  image: string; // can be emoji or URL
  rating: number;
  category: string;
}

interface HomePageProps {
  onNavigate: (page: string) => void;
  currentLocation: { state: string; district: string };
  onLocationChange: (state: string, district: string) => void;
  onProductOrder: (productId: string) => void;
}

import { fetchProducts as fetchLiveProducts } from '@/services/productService';

const HomePage = ({ onNavigate, currentLocation, onLocationChange, onProductOrder }: HomePageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const live = await fetchLiveProducts(selectedCategory !== 'All' ? selectedCategory : undefined);
        const mapped: Product[] = (live || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          unit: p.unit || 'kg',
          farmer: p.farmer || 'Farmer',
          location: p.location || '',
          image: p.image, // may be URL
          rating: p.rating || 4.5,
          category: p.category || 'Misc'
        }));
        setProducts(mapped);
      } catch {
        setProducts([]);
      }
    };
    load();
  }, [selectedCategory]);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Leafy Greens'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.farmer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Fresh From Farm to Your Table 🌾
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Connect directly with local farmers for fresh, organic produce at fair prices. 
            No middlemen, just pure quality.
          </p>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <div className="glass-effect rounded-xl p-4">
              <div className="text-2xl font-bold text-primary-foreground">500+</div>
              <div className="text-sm text-primary-foreground/80">Active Farmers</div>
            </div>
            <div className="glass-effect rounded-xl p-4">
              <div className="text-2xl font-bold text-primary-foreground">10K+</div>
              <div className="text-sm text-primary-foreground/80">Happy Customers</div>
            </div>
            <div className="glass-effect rounded-xl p-4">
              <div className="text-2xl font-bold text-primary-foreground">50+</div>
              <div className="text-sm text-primary-foreground/80">Fresh Products</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Fresh Products Available
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of fresh, organic produce directly from verified farmers
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={selectedCategory === category 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "border-primary/20 text-primary hover:bg-primary/5"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="card-gradient overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border border-border/20">
                <div className="aspect-square bg-muted/20 relative flex items-center justify-center">
                  {/^https?:\/\//.test(product.image) ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl">{product.image}</div>
                  )}
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                    ₹{product.price}/{product.unit}
                  </div>
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
                  </div>
                  
                  <Button 
                    onClick={() => onProductOrder(product.id)}
                    className="w-full btn-hero"
                  >
                    <ShoppingBag className="mr-2 w-4 h-4" />
                    View & Order
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;