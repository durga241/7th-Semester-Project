import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('fc_jwt');
    localStorage.removeItem('farmconnect_userRole');
    localStorage.removeItem('farmconnect_userName');
    localStorage.removeItem('farmconnect_userEmail');
    
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  );
}
