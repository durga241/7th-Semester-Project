import { useState } from 'react';
import { X, Mail, Lock, Loader2, Eye, EyeOff, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginWithPassword, registerWithPassword, requestPasswordReset } from '@/services/authService';

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; email: string; role: 'farmer'; phone?: string }) => void;
  onSignupClick?: () => void;
}

export default function FarmerAuthModal({ isOpen, onClose, onLogin, onSignupClick }: FarmerAuthModalProps) {
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
      
      // Switch back to login mode
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
        toast({
          title: '✅ Login Successful!',
          description: 'Welcome back!',
        });
        
        onLogin({
          name: res.user.name,
          email: res.user.email,
          role: 'farmer',
          phone: res.user.phone
        });
        
        onClose();
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
        
        // Switch to login mode and clear passwords
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

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="FarmConnect Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to emoji if logo doesn't load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="text-5xl hidden">🌾</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' && 'Farmer Login'}
            {mode === 'signup' && 'Farmer Signup'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === 'login' && 'Welcome back! Please login to continue'}
            {mode === 'signup' && 'Create your farmer account'}
            {mode === 'forgot' && 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field (Signup only) */}
          {mode === 'signup' && (
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Full Name
              </Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Farmer"
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email Address
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                disabled={loading}
                required
                autoFocus={mode === 'login'}
              />
            </div>
          </div>

          {/* Phone Field (Signup only) */}
          {mode === 'signup' && (
            <div>
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number (Optional)
              </Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Password Field (Login and Signup only) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-green-600 hover:text-green-700 hover:underline"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password Field (Signup only) */}
          {mode === 'signup' && (
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm Password
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {mode === 'login' && 'Logging in...'}
                {mode === 'signup' && 'Creating account...'}
                {mode === 'forgot' && 'Sending...'}
              </>
            ) : (
              <>
                {mode === 'login' && 'Login'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </>
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            {mode === 'login' && (
              <>
                New to farming?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                  disabled={loading}
                >
                  Create an account
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                  disabled={loading}
                >
                  Login here
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <>
                Remember your password?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                  disabled={loading}
                >
                  Back to Login
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
