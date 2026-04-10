import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { UserRole } from '@/types';
import { generateOTP, storeOTPSession, verifyOTP } from '@/lib/otp';
import { Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { buildPasswordSuggestion, evaluatePasswordStrength } from '@/lib/password';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const { addUser } = useData();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const strongPasswordExample = useMemo(() => buildPasswordSuggestion(fullName), [fullName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !fullName) { toast.error('Please fill in all fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordStrength.score < 3) { toast.error('Please choose a stronger password'); return; }
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
    
    const newUser = await signup(email, password, fullName, role);
    if (!newUser) {
      toast.error('Unable to create account. Please try a different email.');
      return;
    }
    addUser(newUser);
    
    toast.success('Account created successfully!');
    navigate(role === 'owner' ? '/owner/dashboard' : '/');
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
            {otpSent ? 'Verify OTP' : 'Create Account'}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
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
                  {password && (
                    <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Password strength</p>
                        <span className={`text-sm font-semibold ${passwordStrength.score >= 4 ? 'text-success' : passwordStrength.score >= 3 ? 'text-primary' : 'text-destructive'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${passwordStrength.score >= 4 ? 'bg-success' : passwordStrength.score >= 3 ? 'bg-primary' : 'bg-destructive'}`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        />
                      </div>
                      <div className="mt-3 space-y-2 text-xs">
                        {passwordStrength.checks.map(check => (
                          <div key={check.label} className={`flex items-center gap-2 ${check.passed ? 'text-success' : 'text-muted-foreground'}`}>
                            {check.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                            <span>{check.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="mt-2 text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
                <div>
                  <Label>I am a</Label>
                  <Select value={role} onValueChange={v => setRole(v as UserRole)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Sports Enthusiast</SelectItem>
                      <SelectItem value="owner">Facility Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-muted-foreground">Admin access is managed by the system.</p>
                </div>
                <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
                  Suggested strong password: <span className="font-medium text-foreground">{strongPasswordExample}</span>
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
              {otpSent ? 'Verify & Create Account' : 'Send OTP'}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
