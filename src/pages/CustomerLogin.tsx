import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { loginWithPassword } from '@/services/authService';
import FarmConnectMarketplace from '@/components/FarmConnectMarketplace';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    
    try {
      const res = await loginWithPassword(email, password);
      
      if (res.success) {
        const userRole = localStorage.getItem('farmconnect_userRole');
        
        if (userRole !== 'customer') {
          toast.error('This login is for customers only');
          setLoading(false);
          return;
        }

        toast.success('Welcome back!');
        navigate('/customer/dashboard');
      } else {
        toast.error(res.error || 'Invalid email or password');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Home page in background */}
      <div className="relative">
        <FarmConnectMarketplace />
      </div>

      {/* Login Modal Overlay */}
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      {/* Login Modal */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 relative">
        {/* Close Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="FarmConnect Logo" 
            className="h-20 w-auto"
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Login</h2>
          <p className="text-gray-600">
            Welcome back! Please login to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="pl-12 h-14 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-0 rounded-xl"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 pr-12 h-14 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-0 rounded-xl"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            New to shopping?{' '}
            <Link
              to="/customer/signup"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default CustomerLogin;
