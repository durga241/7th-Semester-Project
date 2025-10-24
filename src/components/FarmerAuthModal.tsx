import { useState } from 'react';
import { X, Mail, Lock, Loader2, Eye, EyeOff, User, Phone, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginWithPassword, registerWithPassword, requestPasswordReset } from '@/services/authService';

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; email: string; role: 'farmer'; phone?: string }) => void;
}

export default function FarmerAuthModal({ isOpen, onClose, onLogin }: FarmerAuthModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: '❌ Email Required',
        description: 'Please enter your registered email',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    
    if (res.success) {
      toast({
        title: '✅ Email Sent!',
        description: 'If an account exists with this email, you will receive a password reset link shortly.',
      });
      
      setTimeout(() => {
        setMode('login');
        setEmail('');
      }, 2000);
    } else {
      toast({
        title: '❌ Request Failed',
        description: res.error || 'Could not send reset email',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'forgot') {
      return handleForgotPassword(e);
    }
    
    if (mode === 'login') {
      // Login flow
      if (!email || !password) {
        toast({
          title: '❌ Missing Fields',
          description: 'Please enter email and password',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);
      const res = await loginWithPassword(email, password);
      setLoading(false);
      
      if (res.success && res.user) {
        const userRole = localStorage.getItem('farmconnect_userRole');
        
        // Check if user is a farmer
        if (userRole !== 'farmer') {
          toast({
            title: '❌ Access Denied',
            description: 'This login is for farmers only. Please use Customer Login.',
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: '✅ Login Successful!',
          description: 'Welcome back! Redirecting to dashboard...',
        });
        
        onLogin({
          name: res.user.name,
          email: res.user.email,
          role: 'farmer',
          phone: res.user.phone
        });
        
        onClose();
        
        // Redirect to farmer dashboard
        setTimeout(() => {
          navigate('/farmer/dashboard');
        }, 500);
      } else {
        toast({
          title: '❌ Login Failed',
          description: res.error || 'Invalid credentials',
          variant: 'destructive'
        });
      }
    } else {
      // Signup flow
      if (!name || !email || !password || !confirmPassword) {
        toast({
          title: '❌ Missing Fields',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: '❌ Passwords Do Not Match',
          description: 'Please make sure both passwords are the same',
          variant: 'destructive'
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: '❌ Password Too Short',
          description: 'Password must be at least 6 characters long',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);
      const res = await registerWithPassword({
        name,
        email,
        phone,
        password,
        role: 'farmer'
      });
      setLoading(false);
      
      if (res.success) {
        toast({
          title: '✅ Registration Successful!',
          description: 'Please login with your credentials',
        });
        
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: '❌ Registration Failed',
          description: res.error || 'Could not create account',
          variant: 'destructive'
        });
      }
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              FARMER CONNECT
            </h1>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Farmer Login' : mode === 'signup' ? 'Create Farmer Account' : 'Forgot Password'}
          </h2>
          <p className="text-gray-600 text-sm">
            {mode === 'login' ? 'Welcome back! Please login to continue' : mode === 'signup' ? 'Register to start selling your products' : 'Enter your email to reset password'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                disabled={loading}
                required
                autoFocus={mode === 'login' || mode === 'forgot'}
              />
            </div>
          </div>

          {/* Name Field (Signup only) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Phone Field (Signup only) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                  disabled={loading}
                  maxLength={10}
                />
              </div>
            </div>
          )}

          {/* Password Field (Login & Signup) */}
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password Field (Signup only) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Link (Login only) */}
          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {mode === 'login' ? 'Logging in...' : mode === 'signup' ? 'Creating account...' : 'Sending...'}
              </span>
            ) : (
              mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="text-center">
          {mode === 'login' ? (
            <p className="text-sm text-gray-600">
              New to farming?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Create an account
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Login here
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Login here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
