import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface SearchSuggestion {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
}

interface SearchAutocompleteProps {
  onProductSelect: (product: SearchSuggestion) => void;
  onAddToCart: (productId: number) => void;
}

const allProducts: SearchSuggestion[] = [
  { id: 1, name: "Fresh Beetroot (Loose)", category: "vegetables", image: "🥕", price: 54.72 },
  { id: 2, name: "Capsicum - Green (Loose)", category: "vegetables", image: "🫑", price: 50 },
  { id: 3, name: "Coriander Leaves (Loose)", category: "herbs", image: "🌿", price: 12 },
  { id: 4, name: "Ladies Finger (Loose)", category: "vegetables", image: "🫒", price: 25 },
  { id: 5, name: "Bodyguard Baby Wet Wipes", category: "baby-care", image: "🧻", price: 250 },
  { id: 6, name: "Dabur Baby Wipes", category: "baby-care", image: "🧻", price: 859.68 },
  { id: 7, name: "Huggies Baby Wipes", category: "baby-care", image: "🧻", price: 180 },
  { id: 8, name: "Fresh Tomatoes", category: "vegetables", image: "🍅", price: 40 },
  { id: 9, name: "Organic Spinach", category: "vegetables", image: "🥬", price: 35 },
  { id: 10, name: "Sweet Potatoes", category: "vegetables", image: "🍠", price: 45 },
  { id: 11, name: "Fresh Carrots", category: "vegetables", image: "🥕", price: 30 },
  { id: 12, name: "Green Beans", category: "vegetables", image: "🫛", price: 55 },
  { id: 13, name: "Fresh Onions", category: "vegetables", image: "🧅", price: 25 },
  { id: 14, name: "Garlic Cloves", category: "vegetables", image: "🧄", price: 20 },
  { id: 15, name: "Fresh Ginger", category: "vegetables", image: "🫚", price: 60 },
  { id: 16, name: "Fresh Apples", category: "fruits", image: "🍎", price: 120 },
  { id: 17, name: "Bananas", category: "fruits", image: "🍌", price: 40 },
  { id: 18, name: "Oranges", category: "fruits", image: "🍊", price: 80 },
  { id: 19, name: "Fresh Grapes", category: "fruits", image: "🍇", price: 150 },
  { id: 20, name: "Mangoes", category: "fruits", image: "🥭", price: 200 },
  { id: 21, name: "Basmati Rice", category: "staples", image: "🌾", price: 180 },
  { id: 22, name: "Whole Wheat Flour", category: "staples", image: "🌾", price: 45 },
  { id: 23, name: "Red Lentils", category: "staples", image: "🫘", price: 120 },
  { id: 24, name: "Cooking Oil", category: "staples", image: "🫒", price: 150 },
  { id: 25, name: "Green Tea", category: "beverages", image: "🍵", price: 200 },
  { id: 26, name: "Coffee Beans", category: "beverages", image: "☕", price: 300 },
  { id: 27, name: "Fresh Juice", category: "beverages", image: "🧃", price: 80 },
  { id: 28, name: "Potato Chips", category: "snacks", image: "🍿", price: 30 },
  { id: 29, name: "Biscuits", category: "snacks", image: "🍪", price: 25 },
  { id: 30, name: "Instant Noodles", category: "snacks", image: "🍜", price: 15 },
];

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ onProductSelect, onAddToCart }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (product: SearchSuggestion) => {
    onProductSelect(product);
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    onAddToCart(productId);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          className="pl-10 pr-10 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto search-suggestions"
        >
          {suggestions.map((product, index) => (
            <div
              key={product.id}
              className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-green-50' : ''
              }`}
              onClick={() => handleSuggestionClick(product)}
            >
              <div className="text-2xl mr-3">{product.image}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {product.category}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-3">
                <span className="text-sm font-semibold text-gray-900">
                  ₹{product.price}
                </span>
                <button
                  onClick={(e) => handleAddToCart(e, product.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            No products found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
