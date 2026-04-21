import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Loader2, 
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from './ui/input-otp';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmationResult } from 'firebase/auth';

interface LoginViewProps {
  onSuccess?: () => void;
  className?: string;
}

export default function LoginView({ onSuccess, className }: LoginViewProps) {
  const { sendOtp } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber.trim()) return;

    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      setError('Please include your country code (e.g., +91 for India)');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await sendOtp(formattedPhone);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please check the number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || !confirmationResult) return;

    setIsVerifying(true);
    setError('');
    try {
      await confirmationResult.confirm(otp);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!confirmationResult ? (
          <motion.div 
            key="send-otp"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="pl-12 h-14 rounded-2xl border-gray-100 focus:border-brand-orange focus:ring-brand-orange"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 ml-1">Include country code (e.g., +91)</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-lg shadow-lg shadow-brand-orange/20 transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={async () => {
                  const { signInAnonymously } = await import('firebase/auth');
                  const { auth } = await import('../lib/firebase');
                  setIsLoading(true);
                  try {
                    await signInAnonymously(auth);
                    if (onSuccess) onSuccess();
                  } catch (e: any) {
                    setError('Bypass failed: ' + e.message);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full text-[10px] text-gray-300 hover:text-gray-600 transition-colors uppercase tracking-widest font-bold"
              >
                Trouble with OTP? Try Dev Login
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="verify-otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setConfirmationResult(null)}
                className="rounded-full h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-500">Back to phone</span>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-brand-orange" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Verify OTP</h3>
              <p className="text-sm text-gray-500">Enter the 6-digit code sent to {phoneNumber}</p>
            </div>

            <div className="flex justify-center py-4">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                onComplete={handleVerifyOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-14 text-lg font-bold rounded-l-xl" />
                  <InputOTPSlot index={1} className="w-12 h-14 text-lg font-bold" />
                  <InputOTPSlot index={2} className="w-12 h-14 text-lg font-bold" />
                  <InputOTPSlot index={3} className="w-12 h-14 text-lg font-bold" />
                  <InputOTPSlot index={4} className="w-12 h-14 text-lg font-bold" />
                  <InputOTPSlot index={5} className="w-12 h-14 text-lg font-bold rounded-r-xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button 
              onClick={handleVerifyOtp}
              className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-lg shadow-lg shadow-brand-orange/20 transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verify & Login"
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Didn't receive code? <button onClick={() => handleSendOtp()} className="text-brand-orange font-medium hover:underline">Resend</button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
