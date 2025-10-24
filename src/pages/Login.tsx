import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { loginWithPassword } from '@/services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    const res = await loginWithPassword(email, password);
    setLoading(false);
    if (res.success) {
      toast.success('Login successful! Welcome back!');
      
      // Get user role from localStorage
      const userRole = localStorage.getItem('farmconnect_userRole');
      
      // Redirect to farmer dashboard (only farmers can login)
      if (userRole === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/');
      }
    } else {
      toast.error(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Farmer Login</CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">Welcome back to FarmConnect</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...</>) : 'Login'}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-green-600 hover:underline">Forgot Password?</Link>
              <Link to="/signup" className="text-gray-600 hover:underline">New User? Sign Up</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;


