import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { generateOTP, storeOTPSession, verifyOTP } from '@/lib/otp';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otp, setOtp] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
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
    login(email, password);
    toast.success('Logged in successfully!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="font-display text-2xl font-bold">QuickCourt</span>
          </Link>
        </div>
        <div className="rounded-xl border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-display font-bold text-center mb-6">
            {otpSent ? 'Verify OTP' : 'Welcome Back'}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" />
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
