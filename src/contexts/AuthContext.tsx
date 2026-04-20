import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signOut
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAuthReady: boolean;
  sendOtp: (phoneNumber: string) => Promise<ConfirmationResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          const newProfile = {
            uid: user.uid,
            phone: user.phoneNumber || '',
            email: user.email || '',
            role: 'user',
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        } else {
          const data = userDoc.data();
          if (user.email && !data.email) {
            await updateDoc(doc(db, 'users', user.uid), { email: user.email });
            setProfile({ ...data, email: user.email });
          } else {
            setProfile(data);
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);

  const sendOtp = async (phoneNumber: string) => {
    console.log('Attempting to send OTP to:', phoneNumber);
    
    if (verifier) {
      try {
        verifier.clear();
      } catch (e) {
        console.error('Error clearing recaptcha:', e);
      }
    }

    // Ensure the container is empty
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }
    
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('Recaptcha verified successfully');
        },
        'expired-callback': () => {
          console.warn('Recaptcha expired, please try again');
        }
      });
      
      setVerifier(recaptchaVerifier);
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log('OTP sent successfully');
      return result;
    } catch (error: any) {
      console.error('Detailed OTP Error:', error);
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please use +[country_code][number]');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      }
      throw error;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, sendOtp, logout }}>
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
