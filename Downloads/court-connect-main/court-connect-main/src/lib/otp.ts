// Utility for OTP generation and verification

export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

export const storeOTPSession = (email: string, otp: string): void => {
  const otpSessions = JSON.parse(sessionStorage.getItem('otp_sessions') || '{}');
  otpSessions[email] = {
    otp,
    timestamp: Date.now(),
    attempts: 0,
  };
  sessionStorage.setItem('otp_sessions', JSON.stringify(otpSessions));
};

export const verifyOTP = (email: string, enteredOtp: string): boolean => {
  const otpSessions = JSON.parse(sessionStorage.getItem('otp_sessions') || '{}');
  const session = otpSessions[email];

  if (!session) return false;

  // OTP expires after 10 minutes
  if (Date.now() - session.timestamp > 10 * 60 * 1000) {
    delete otpSessions[email];
    sessionStorage.setItem('otp_sessions', JSON.stringify(otpSessions));
    return false;
  }

  // Max 3 attempts
  if (session.attempts >= 3) {
    delete otpSessions[email];
    sessionStorage.setItem('otp_sessions', JSON.stringify(otpSessions));
    return false;
  }

  if (session.otp !== enteredOtp) {
    session.attempts += 1;
    sessionStorage.setItem('otp_sessions', JSON.stringify(otpSessions));
    return false;
  }

  // OTP verified successfully
  delete otpSessions[email];
  sessionStorage.setItem('otp_sessions', JSON.stringify(otpSessions));
  return true;
};

export const getStoredOTP = (email: string): string | null => {
  const otpSessions = JSON.parse(sessionStorage.getItem('otp_sessions') || '{}');
  return otpSessions[email]?.otp || null;
};
