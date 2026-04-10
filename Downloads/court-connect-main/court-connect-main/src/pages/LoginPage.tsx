import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { generateOTP, storeOTPSession, verifyOTP } from '@/lib/otp';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Admin credentials
  const ADMIN_EMAIL = 'sai@gmail.com';
  const ADMIN_PASSWORD = 'sai@123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    
    // Check for admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
      if (!admin) {
        toast.error('Invalid admin credentials');
        return;
      }
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
      return;
    }
    
    if (!otpSent) {
      const newOtp = generateOTP();
      setGeneratedOtp(newOtp);
      storeOTPSession(email, newOtp);
      setOtpSent(true);
      toast.success('OTP generated and sent!');
      return;
    }
    if (otp.length !== 6) { toast.error('Please enter a valid 6-digit OTP'); return; }
    if (!verifyOTP(email, otp)) {
      toast.error('Invalid OTP or expired. Please try again.');
      return;
    }
    const authenticatedUser = await login(email, password);
    if (!authenticatedUser) {
      toast.error('Invalid email or password');
      return;
    }
    toast.success('Logged in successfully!');
    
    if (authenticatedUser.role === 'admin') navigate('/admin/dashboard');
    else if (authenticatedUser.role === 'owner') navigate('/owner/dashboard');
    else navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="font-display text-2xl font-bold">QuickCourt</span>
          </Link>
          <p className="text-muted-foreground mt-2">Login to your account</p>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-display font-bold text-center mb-6">
            {otpSent ? 'Verify OTP' : 'Login'}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="sai@gmail.com (admin)" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-600 font-semibold">Test OTP (for development):</p>
                  <p className="text-2xl font-bold text-blue-700 tracking-widest mt-1">{generatedOtp}</p>
                  <p className="text-xs text-blue-600 mt-2">Valid for 10 minutes | Max 3 attempts</p>
                </div>
                <div>
                  <Label htmlFor="otp">Enter 6-digit OTP</Label>
                  <div className="mt-4 flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                        <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                        <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                        <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                        <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                        <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              </>
            )}
            <Button type="submit" className="w-full" size="lg">
              {otpSent ? 'Verify & Log In' : 'Send OTP'}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
