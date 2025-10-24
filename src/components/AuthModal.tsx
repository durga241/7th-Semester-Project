import { useRef, useState } from "react";
import { X, User, Phone, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendEmailOtp, registerUser } from "@/services/authService";
import { toast } from "sonner";
import OtpInput from "./OtpInput";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; role: 'farmer' | 'customer'; phone: string; email?: string }) => void;
}

const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [step, setStep] = useState<'auth' | 'otp'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'customer'>('customer');
  const confirmationRef = useRef<{ confirm: (code: string) => Promise<any> } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (authMode === 'signup' && !formData.name) {
      toast.error('Please enter your name');
      return;
    }

    if (authMode === 'signup' && formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    try {
      setLoading(true);

      // If login mode, check if user exists first
      if (authMode === 'login') {
        toast.loading('Checking your account...');
        
        const checkResponse = await fetch('/api/auth/check-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        
        const checkData = await checkResponse.json();
        toast.dismiss();
        
        if (!checkData.ok || !checkData.exists) {
          toast.error('Account not found. Please sign up first.');
          // Auto-switch to signup mode
          setTimeout(() => {
            setAuthMode('signup');
            toast.info('👉 Please create an account to continue');
          }, 1500);
          setLoading(false);
          return;
        }
      }

      // If signup, register user first
      if (authMode === 'signup') {
        toast.loading('Creating your account...');
        const registerRes = await registerUser(
          formData.email,
          formData.name || 'User',
          selectedRole,
          formData.phone
        );
        
        if (!registerRes.success) {
          toast.dismiss();
          if (registerRes.error?.includes('already exists')) {
            toast.error('Email already registered. Please login instead.');
            setTimeout(() => {
              setAuthMode('login');
              toast.info('👉 Please login to continue');
            }, 1500);
          } else {
            toast.error(registerRes.error || 'Registration failed');
          }
          setLoading(false);
          return;
        }
        
        toast.dismiss();
        toast.success('✅ Account created! Sending OTP...');
      }

      // Send OTP
      toast.loading('Sending verification code...');
      const res = await sendEmailOtp(formData.email, selectedRole, formData.name);
      
      toast.dismiss();
      
      if (res.success && res.confirmationResult) {
        confirmationRef.current = res.confirmationResult as any;
        setStep('otp');
        toast.success('📧 OTP sent! Check your email');
      } else {
        toast.error(res.error || 'Failed to send OTP');
      }
    } catch (e: any) {
      toast.dismiss();
      toast.error(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    if (!confirmationRef.current) {
      toast.error('No OTP request in progress');
      return;
    }
    
    if (!code || code.length < 6) {
      toast.error('Please enter the complete OTP');
      return;
    }
    
    try {
      setLoading(true);
      toast.loading('Verifying OTP...');
      
      const r = await confirmationRef.current.confirm(code);
      
      toast.dismiss();
      
      if (r.success && r.user) {
        toast.success(`🎉 Welcome ${authMode === 'signup' ? 'to' : 'back'} ${r.user.name}!`);
        
        onLogin({
          name: formData.name || r.user.name || (selectedRole === 'farmer' ? 'Farmer' : 'Customer'),
          role: selectedRole,
          phone: formData.phone || r.user.phone,
          email: r.user.email
        });
        
        onClose();
        resetForm();
      } else {
        toast.error(r.error || 'Invalid OTP');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('auth');
    setAuthMode('login');
    setFormData({ name: '', phone: '', email: '', otp: '' });
    confirmationRef.current = null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { onClose(); resetForm(); }} 
          className="absolute top-4 right-4 z-10 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>

        {step === 'auth' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">🌾</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FarmConnect</h2>
              <p className="text-gray-600">Fresh produce, delivered from farm to table</p>
            </div>

            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('customer')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedRole === 'customer'
                            ? 'border-green-500 bg-green-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">🛒</div>
                        <div className="font-semibold text-sm">Customer</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('farmer')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedRole === 'farmer'
                            ? 'border-green-500 bg-green-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">👨‍🌾</div>
                        <div className="font-semibold text-sm">Farmer</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-11 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Continue with OTP'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('customer')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedRole === 'customer'
                            ? 'border-green-500 bg-green-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">🛒</div>
                        <div className="font-semibold text-sm">Customer</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('farmer')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedRole === 'farmer'
                            ? 'border-green-500 bg-green-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">👨‍🌾</div>
                        <div className="font-semibold text-sm">Farmer</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-11 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-11 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-phone" className="text-sm font-medium text-gray-700">Phone Number (Optional)</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-11 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    disabled={loading}
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
              </TabsContent>
            </Tabs>
          </div>
        )}

        {step === 'otp' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600 mb-8">We've sent a 6-digit code to<br/><strong>{formData.email}</strong></p>
            
            <div className="space-y-6">
              <div>
                <OtpInput
                  length={6}
                  disabled={loading}
                  onComplete={handleVerifyOtp}
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setStep('auth')} 
                  variant="ghost" 
                  className="w-full"
                >
                  ← Back to Login
                </Button>
                <p className="text-sm text-gray-500">
                  Didn't receive the code?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-semibold text-green-600"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    Resend OTP
                  </Button>
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuthModal;