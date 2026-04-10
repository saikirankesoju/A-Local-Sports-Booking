export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';

const passwordChecks = [
  {
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    label: 'One uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: 'One lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: 'One number',
    test: (password: string) => /\d/.test(password),
  },
  {
    label: 'One special character',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
];

export function evaluatePasswordStrength(password: string) {
  const passedChecks = passwordChecks.filter(check => check.test(password));
  const score = Math.min(5, passedChecks.length + (password.length >= 12 ? 1 : 0));

  const levelMap: Record<number, PasswordStrengthLevel> = {
    0: 'weak',
    1: 'weak',
    2: 'fair',
    3: 'good',
    4: 'strong',
    5: 'very-strong',
  };

  const labelMap: Record<PasswordStrengthLevel, string> = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
    'very-strong': 'Very strong',
  };

  const missingChecks = passwordChecks.filter(check => !check.test(password)).map(check => check.label);

  return {
    score,
    percent: score * 20,
    level: levelMap[score],
    label: labelMap[levelMap[score]],
    missingChecks,
    checks: passwordChecks.map(check => ({ label: check.label, passed: check.test(password) })),
  };
}

export function buildPasswordSuggestion(fullName?: string) {
  const seed = fullName?.split(' ').filter(Boolean)[0] || 'QuickCourt';
  const cleanedSeed = seed.replace(/[^A-Za-z]/g, '') || 'QuickCourt';
  const year = new Date().getFullYear();

  return `${cleanedSeed}@${year}!`;
}