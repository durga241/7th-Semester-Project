import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim().length < 2) {
      toast({
        title: '❌ Invalid Name',
        description: 'Name must be at least 2 characters',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: '❌ Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.phone || formData.phone.length < 10) {
      toast({
        title: '❌ Invalid Phone',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      toast({
        title: '❌ Weak Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: '❌ Passwords Don\'t Match',
        description: 'Please make sure both passwords are identical',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      toast({
        title: '🎉 Account Created Successfully!',
        description: 'Check your email for confirmation. Redirecting to login...',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
      toast({
        title: '❌ Signup Failed',
        description: err.message || 'Unable to create account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
            <span className="text-5xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Farmer Market Connect today</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name Field */}
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Full Name
              </Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Doe"
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number
              </Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  maxLength={10}
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <Label htmlFor="role" className="text-gray-700 font-medium">
                I am a
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange('role', value)}
                disabled={loading}
              >
                <SelectTrigger className="h-12 mt-2 border-gray-300 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer (Buyer)</SelectItem>
                  <SelectItem value="farmer">Farmer (Seller)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
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
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm Password
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
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

            {/* Signup Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-green-600 hover:text-green-700 font-semibold hover:underline"
            >
              Sign in instead →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
