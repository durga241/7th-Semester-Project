import { useState } from 'react';
import { X, Mail, User, Phone, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { registerWithPassword } from '@/services/authService';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLoginClick?: () => void;
}

export default function SignupModal({ isOpen, onClose, onSuccess, onLoginClick }: SignupModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.email || !form.password) {
      toast({
        title: '❌ Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!form.email.includes('@')) {
      toast({
        title: '❌ Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    if (form.password.length < 6) {
      toast({
        title: '❌ Weak Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast({
        title: '❌ Passwords Don\'t Match',
        description: 'Please make sure both passwords are identical',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const res = await registerWithPassword({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
      role: 'customer'
    });
    setLoading(false);
    
    if (res.success) {
      toast({
        title: '✅ Registration Successful!',
        description: 'Your account has been created. You can now login with your credentials.',
      });
      
      // Reset form
      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      
      // Close modal and trigger success callback (which should open login)
      onSuccess();
    } else {
      // Handle specific error messages
      if (res.error?.toLowerCase().includes('already') || res.error?.toLowerCase().includes('exists')) {
        toast({
          title: '❌ Email Already Registered',
          description: 'This email is already registered. Click below to login instead.',
          variant: 'destructive',
        });
        
        // Auto-switch to login after short delay if callback is available
        if (onLoginClick) {
          setTimeout(() => {
            onClose();
            onLoginClick();
          }, 2000);
        }
      } else {
        toast({
          title: '❌ Signup Failed',
          description: res.error || 'Unable to create account',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🌾</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join our farming community today</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <Label htmlFor="name" className="text-gray-700 font-medium">
              Full Name *
            </Label>
            <div className="relative mt-2">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="name"
                type="text"
                value={form.name}
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
              Email Address *
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <Label htmlFor="phone" className="text-gray-700 font-medium">
              Phone Number (Optional)
            </Label>
            <div className="relative mt-2">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="9876543210"
                className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password *
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
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
              Confirm Password *
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
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

          {/* Submit Button */}
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
              'Create Account'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => {
                onClose();
                if (onLoginClick) {
                  onLoginClick();
                }
              }}
              className="text-green-600 hover:text-green-700 font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
