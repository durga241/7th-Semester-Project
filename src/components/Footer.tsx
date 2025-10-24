import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Farmer Market Connect</h3>
                <p className="text-primary-foreground/80">Connecting Farmers & Customers</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 mb-4 max-w-md">
              Empowering farmers to reach customers directly, ensuring fresh produce 
              and fair prices for everyone in the agricultural ecosystem.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-6 h-6 text-primary-foreground/70 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-6 h-6 text-primary-foreground/70 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-6 h-6 text-primary-foreground/70 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#farmers" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Find Farmers
                </a>
              </li>
              <li>
                <a href="#products" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Browse Products
                </a>
              </li>
              <li>
                <a href="#about" className="text-primary-foreground/80 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#support" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-foreground/70" />
                <span className="text-primary-foreground/80">+91 9876543210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-foreground/70" />
                <span className="text-primary-foreground/80">info@farmermarket.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-foreground/70 mt-1" />
                <span className="text-primary-foreground/80">
                  123 Agriculture Street<br />
                  New Delhi, India 110001
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/70">
            © 2024 Farmer Market Connect. All rights reserved. | 
            <a href="#privacy" className="hover:text-white transition-colors ml-1">Privacy Policy</a> | 
            <a href="#terms" className="hover:text-white transition-colors ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;