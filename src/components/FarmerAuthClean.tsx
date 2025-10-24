import { useState } from 'react';
import { X, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginWithPassword } from '@/services/authService';

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; email: string; role: 'farmer'; phone?: string }) => void;
}

export default function FarmerAuthModal({ isOpen, onClose, onLogin }: FarmerAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    if (res.success) {
      toast({
        title: '✅ Login Successful!',
        description: 'Welcome back!',
      });
      
      // Get user data from localStorage
      const userName = localStorage.getItem('farmconnect_userName') || 'Farmer';
      const userEmail = localStorage.getItem('farmconnect_userEmail') || email;
      
      onLogin({
        name: userName,
        email: userEmail,
        role: 'farmer'
      });
      
      onClose();
    } else {
      toast({
        title: '❌ Login Failed',
        description: res.error || 'Invalid credentials',
        variant: 'destructive'
      });
    }
  };


  // Step 2: Register farmer and send OTP
  const handleRegister = async () => {
    // Validation
    if (!name || name.length < 2) {
      toast({
        title: '❌ Invalid Name',
        description: 'Name must be at least 2 characters',
        variant: 'destructive'
      });
      return;
    }

    if (!phone || phone.length !== 10) {
      toast({
        title: '❌ Invalid Phone',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Register farmer
      const registerResponse = await fetch(`${API_URL}/api/farmers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: name.trim(),
          phone: phone.trim()
        })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        if (registerResponse.status === 409) {
          toast({
            title: '⚠️ Already Registered',
            description: 'This email is already registered. Redirecting to login...',
          });
          setStep(1);
          return;
        }
        throw new Error(registerData.error || 'Registration failed');
      }

      // Send OTP
      const otpResponse = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          role: 'farmer',
          name: name.trim()
        })
      });

      const otpData = await otpResponse.json();

      if (!otpResponse.ok) {
        throw new Error(otpData.error || 'Failed to send OTP');
      }

      toast({
        title: '✅ OTP Sent Successfully!',
        description: `Verification code sent to ${email}`,
      });

      setStep(3);
    } catch (err: any) {
      console.error('Registration error:', err);
      toast({
        title: '❌ Registration Failed',
        description: err.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: '❌ Invalid OTP',
        description: 'Please enter the complete 6-digit OTP',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

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

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Store JWT and user data
      if (data.token) {
        localStorage.setItem('fc_jwt', data.token);
      }
      localStorage.setItem('farmconnect_userRole', 'farmer');
      localStorage.setItem('farmconnect_userName', data.user?.name || name);
      localStorage.setItem('farmconnect_userEmail', email);

      toast({
        title: '🎉 Registration Successful!',
        description: 'Redirecting to dashboard...',
      });

      onLogin({
        name: data.user?.name || name,
        email: email,
        role: 'farmer',
        phone: data.user?.phone || phone
      });

      setTimeout(() => {
        onClose();
        navigate('/farmer/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      toast({
        title: '❌ Verification Failed',
        description: err.message || 'Invalid OTP. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          role: 'farmer',
          name: name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      toast({
        title: '✅ OTP Resent',
        description: 'New verification code sent to your email',
      });
      setOtp('');
    } catch (err: any) {
      toast({
        title: '❌ Failed to Resend',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`h-1 w-12 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <div className={`h-1 w-12 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">
            Step {step} of 3: {step === 1 ? 'Email Verification' : step === 2 ? 'Registration' : 'OTP Verification'}
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🌾</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 && 'Farmer Login'}
            {step === 2 && 'Complete Registration'}
            {step === 3 && 'Verify OTP'}
          </h2>
        </div>

        {/* Step 1: Gmail Input */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckFarmer()}
                  placeholder="farmer@example.com"
                  className="pl-10 h-12"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <Button
              onClick={handleCheckFarmer}
              disabled={loading || !email}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 h-12 rounded-lg"
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

        {/* Step 2: Registration Form */}
        {step === 2 && (
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
                  className="pl-10 h-12"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reg-email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                disabled
                className="h-12 bg-gray-50"
              />
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
                  className="pl-10 h-12"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading || !name || !phone || phone.length !== 10}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 h-12 rounded-lg"
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
              onClick={() => setStep(1)}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Login
            </button>
          </div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && (
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
                className="h-14 text-center text-2xl tracking-widest"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                OTP sent to {email}
              </p>
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 h-12 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Complete Registration'
              )}
            </Button>

            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Didn't receive OTP? Resend
            </button>

            <button
              onClick={() => setStep(2)}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
