import { useState } from 'react';
import { X, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; email: string; role: 'farmer'; phone?: string }) => void;
}

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export default function FarmerAuthModal({ isOpen, onClose, onLogin }: FarmerAuthModalProps) {
  const [step, setStep] = useState<'login' | 'register' | 'otp'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // User data from Google
  const [googleData, setGoogleData] = useState<GoogleUser | null>(null);
  
  // Registration form
  const [phone, setPhone] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [cropsGrown, setCropsGrown] = useState('');
  
  // OTP
  const [otp, setOtp] = useState('');
  const [otpRetries, setOtpRetries] = useState(0);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!isOpen) return null;

  // Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');

      // Decode JWT token from Google
      const decoded: GoogleUser = jwtDecode(credentialResponse.credential);
      
      console.log('Google login successful:', decoded);
      setGoogleData(decoded);

      // Send to backend
      const response = await fetch(`${API_URL}/api/farmer/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          profilePicture: decoded.picture,
          googleId: decoded.sub
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.new_user) {
        // New farmer - show registration form
        toast({
          title: '👋 Welcome!',
          description: 'Please complete your registration',
        });
        setStep('register');
      } else {
        // Existing farmer - login successful
        localStorage.setItem('fc_jwt', data.token);
        localStorage.setItem('farmconnect_userRole', 'farmer');
        localStorage.setItem('farmconnect_userName', data.farmer.name);
        localStorage.setItem('farmconnect_userEmail', data.farmer.email);

        toast({
          title: '🎉 Welcome Back!',
          description: `Logged in as ${data.farmer.name}`,
        });

        onLogin({
          name: data.farmer.name,
          email: data.farmer.email,
          role: 'farmer',
          phone: data.farmer.phone
        });

        onClose();
        navigate('/farmer/dashboard');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Authentication failed');
      toast({
        title: 'Authentication Failed',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!googleData) {
      setError('Google authentication required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/farmer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleData.email,
          name: googleData.name,
          phone: phone.trim(),
          farmLocation: farmLocation.trim(),
          cropsGrown: cropsGrown.split(',').map(c => c.trim()).filter(Boolean),
          googleId: googleData.sub,
          profilePicture: googleData.picture
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

      // Send OTP
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

  // Send OTP
  const sendOTP = async () => {
    if (!googleData) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleData.email,
          role: 'farmer',
          name: googleData.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep('otp');
      toast({
        title: '📧 OTP Sent!',
        description: `Verification code sent to ${googleData.email}`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (!googleData) {
      setError('Session expired. Please login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleData.email,
          code: otp,
          role: 'farmer'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpRetries(prev => prev + 1);
        
        if (otpRetries >= 2) {
          throw new Error('Maximum OTP attempts reached. Please request a new OTP.');
        }
        
        throw new Error(data.error || 'Invalid OTP');
      }

      // Store JWT token
      localStorage.setItem('fc_jwt', data.token);
      localStorage.setItem('farmconnect_userRole', 'farmer');
      localStorage.setItem('farmconnect_userName', data.user.name);
      localStorage.setItem('farmconnect_userEmail', data.user.email);

      toast({
        title: '🎉 Verification Successful!',
        description: 'Welcome to FarmConnect! Redirecting to dashboard...',
      });

      onLogin({
        name: data.user.name,
        email: data.user.email,
        role: 'farmer',
        phone: data.user.phone
      });

      setTimeout(() => {
        onClose();
        navigate('/farmer/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message);
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-5xl">🌾</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'login' && 'Farmer Login'}
              {step === 'register' && 'Complete Registration'}
              {step === 'otp' && 'Verify OTP'}
            </h2>
            <p className="text-gray-600">
              {step === 'login' && 'Sign in with your Gmail account'}
              {step === 'register' && 'Tell us about your farm'}
              {step === 'otp' && `Code sent to ${googleData?.email}`}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Google Login */}
          {step === 'login' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError('Google login failed. Please try again.');
                    toast({
                      title: 'Login Failed',
                      description: 'Could not authenticate with Google',
                      variant: 'destructive'
                    });
                  }}
                  useOneTap
                  text="signin_with"
                  shape="rectangular"
                  size="large"
                  theme="outline"
                  logo_alignment="left"
                />
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-6">
                <p>By continuing, you agree to our Terms of Service</p>
                <p className="mt-1">and Privacy Policy</p>
              </div>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {step === 'register' && googleData && (
            <div className="space-y-4">
              {/* Name (readonly) */}
              <div>
                <Label className="text-gray-700 font-medium">Full Name</Label>
                <Input
                  value={googleData.name}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>

              {/* Email (readonly) */}
              <div>
                <Label className="text-gray-700 font-medium">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={googleData.email}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label className="text-gray-700 font-medium">Phone Number *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Farm Location */}
              <div>
                <Label className="text-gray-700 font-medium">Farm Location</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    placeholder="Village, District, State"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Crops Grown */}
              <div>
                <Label className="text-gray-700 font-medium">Crops Grown</Label>
                <Input
                  value={cropsGrown}
                  onChange={(e) => setCropsGrown(e.target.value)}
                  placeholder="Rice, Wheat, Cotton (comma separated)"
                  className="mt-1"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple crops with commas</p>
              </div>

              <Button
                onClick={handleRegister}
                disabled={loading || !phone || phone.length < 10}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 h-12 rounded-lg mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Send OTP →'
                )}
              </Button>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-medium">Enter 6-Digit OTP</Label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                  placeholder="123456"
                  maxLength={6}
                  className="mt-1 h-14 text-center text-2xl tracking-widest"
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Attempts remaining: {3 - otpRetries}
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
                  'Verify & Login'
                )}
              </Button>

              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Resend OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
