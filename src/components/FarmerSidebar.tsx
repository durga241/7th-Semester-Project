import { useState } from 'react';
import { Plus, Package, BarChart3, Users, Settings, Home, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FarmerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  farmer: any;
}

const FarmerSidebar = ({ activeSection, onSectionChange, farmer }: FarmerSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: Plus },
    { id: 'orders', label: 'Orders', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 
        w-80 bg-white border-r border-border/50 shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        lg:block
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="text-2xl">👨‍🌾</div>
              </div>
              <div>
                <h2 className="font-bold text-foreground">{farmer.name}</h2>
                <p className="text-sm text-muted-foreground">Farmer Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      if (window.innerWidth < 1024) {
                        setIsCollapsed(true);
                      }
                    }}
                    variant={isActive ? "default" : "ghost"}
                    className={`
                      w-full justify-start space-x-3 h-12 text-left
                      ${isActive 
                        ? "bg-primary text-white hover:bg-primary/90" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/50">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🌟</div>
                <h3 className="font-semibold text-foreground text-sm mb-1">Premium Features</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Upgrade to access advanced analytics and more customers
                </p>
                <Button size="sm" className="btn-hero w-full text-xs">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default FarmerSidebar;