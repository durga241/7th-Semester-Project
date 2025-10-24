import { useState } from 'react';
import { X, Mail, User, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; email: string; role: 'farmer'; phone?: string }) => void;
}

export default function FarmerAuthModal({ isOpen, onClose, onLogin }: FarmerAuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  if (!isOpen) return null;

  // Step 1: Check if farmer exists
  const handleCheckFarmer = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/farmers/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check farmer');
      }

      if (data.status === 'not_registered') {
        // New user - show signup form
        setMode('signup');
        toast({
          title: 'New User',
          description: 'Please complete registration',
        });
      } else {
        // Existing user - send OTP
        await sendOTP();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check farmer');
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Register new farmer
  const handleRegister = async () => {
    if (!name || name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/farmers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: name.trim(),
          phone: phone.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: '✅ Registration Successful!',
        description: 'Sending OTP to your email...',
      });

      // Send OTP after successful registration
      await sendOTP();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      toast({
        title: 'Registration Failed',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Send OTP
  const sendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          role: 'farmer',
          name: name || 'Farmer'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setMode('otp');
      toast({
        title: '✅ OTP Sent!',
        description: `Verification code sent to ${email}`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Verify OTP and login
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          code: otp,
          role: 'farmer'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Store JWT token
      localStorage.setItem('fc_jwt', data.token);
      localStorage.setItem('farmconnect_userRole', 'farmer');
      localStorage.setItem('farmconnect_userName', data.user.name);
      localStorage.setItem('farmconnect_userEmail', data.user.email);

      toast({
        title: '🎉 Login Successful!',
        description: 'Redirecting to dashboard...',
      });

      // Call onLogin callback
      onLogin({
        name: data.user.name,
        email: data.user.email,
        role: 'farmer',
        phone: data.user.phone
      });

      // Close modal and redirect
      onClose();
      navigate('/farmer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      toast({
        title: 'Verification Failed',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 m-4 max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">🌾</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' && 'Farmer Login'}
            {mode === 'signup' && 'Complete Registration'}
            {mode === 'otp' && 'Verify OTP'}
          </h2>
          {mode === 'otp' && (
            <p className="text-gray-600 text-sm mt-2">Code sent to {email}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckFarmer()}
                  placeholder="farmer@example.com"
                  className="pl-10 h-12 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              onClick={handleCheckFarmer}
              disabled={loading || !email}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 h-12 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-10 h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  disabled
                  className="pl-10 h-12 bg-gray-50 border-gray-300"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  maxLength={10}
                  className="pl-10 h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading || !name || !phone}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 h-12 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register & Send OTP'
              )}
            </Button>

            <button
              onClick={() => setMode('login')}
              className="w-full text-center text-sm text-gray-600 hover:text-teal-600"
            >
              ← Back to Login
            </button>
          </div>
        )}

        {/* OTP Verification */}
        {mode === 'otp' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp" className="text-gray-700 font-medium">Enter 6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                placeholder="123456"
                maxLength={6}
                className="h-12 text-center text-2xl tracking-widest border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                disabled={loading}
              />
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 h-12 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </Button>

            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full text-center text-sm text-gray-600 hover:text-teal-600"
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
