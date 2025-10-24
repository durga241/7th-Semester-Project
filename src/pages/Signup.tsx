import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, Phone, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { registerWithPassword } from '@/services/authService';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!form.email.includes('@')) {
      toast.error('Enter a valid email');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const res = await registerWithPassword({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password, role: 'farmer' });
    setLoading(false);
    if (res.success) {
      toast.success('✅ Registration successful! Please login with your credentials.', {
        duration: 4000
      });
      // Small delay before navigation for better UX
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } else {
      // Handle specific error messages
      if (res.error?.toLowerCase().includes('already') || res.error?.toLowerCase().includes('exists')) {
        toast.error('This email is already registered. Please login instead.', {
          duration: 5000,
          action: {
            label: 'Go to Login',
            onClick: () => navigate('/login')
          }
        });
      } else {
        toast.error(res.error || 'Signup failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Farmer Registration</CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">Join FarmConnect as a Farmer</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" value={form.name} onChange={(e) => onChange('name', e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" value={form.password} onChange={(e) => onChange('password', e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirm" type="password" value={form.confirm} onChange={(e) => onChange('confirm', e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>) : 'Sign Up'}
            </Button>
            <div className="text-sm text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-green-600 hover:underline">Login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;


