import { useState } from "react";
import { MapPin, Menu, X, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onLoginClick: () => void;
  currentUser: any;
  onLogout: () => void;
  cartCount?: number;
  onCartClick?: () => void;
  onFavoriteClick?: () => void;
  isFavorite?: boolean;
}

const Navbar = ({ onLoginClick, currentUser, onLogout, cartCount = 0, onCartClick, onFavoriteClick, isFavorite }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [favoriteOn, setFavoriteOn] = useState<boolean>(!!isFavorite);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-[var(--shadow-soft)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Farmer Market Connect</h1>
              <p className="text-xs text-muted-foreground">Fresh & Direct</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 ml-auto">
            <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
              About Us
            </a>
            <a href="#products" className="text-foreground hover:text-primary transition-colors font-medium">
              Products
            </a>
            <a href="#farmers" className="text-foreground hover:text-primary transition-colors font-medium">
              Farmers
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </a>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open cart"
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )}
            </Button>

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground">
                  Welcome, {currentUser.name}
                </span>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={onLoginClick} className="btn-hero">
                Login / Signup
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col space-y-3">
              <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium px-2 py-1">
                Home
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium px-2 py-1">
                About Us
              </a>
              <a href="#products" className="text-foreground hover:text-primary transition-colors font-medium px-2 py-1">
                Products
              </a>
              <a href="#farmers" className="text-foreground hover:text-primary transition-colors font-medium px-2 py-1">
                Farmers
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium px-2 py-1">
                Contact
              </a>
              
              {currentUser ? (
                <div className="pt-2 border-t border-border/50">
                  <div className="text-sm font-medium text-foreground px-2 py-1">
                    Welcome, {currentUser.name}
                  </div>
                  <Button variant="outline" size="sm" onClick={onLogout} className="mt-2 w-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={onLoginClick} className="btn-hero mt-2">
                  Login / Signup
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;