import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { UserRole } from '../types';
import { Gavel, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignup = searchParams.get('signup') === 'true';
  const initialRole = (searchParams.get('role') as UserRole) || 'client';
  
  const [role, setRole] = useState<UserRole>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user
        await setDoc(userDocRef, {
          userId: user.uid,
          email: user.email,
          fullName: user.displayName || 'Anonymous',
          role: role,
          createdAt: serverTimestamp(),
          isVerified: role === 'client', // Clients are verified by default via email, lawyers need NBA check
          avatarUrl: user.photoURL,
        });

        if (role === 'lawyer') {
          // Initialize lawyer profile
          await setDoc(doc(db, 'lawyers', user.uid), {
            lawyerId: user.uid,
            specialties: [],
            subscriptionTier: 'basic',
            subscriptionStatus: 'active',
            verificationStatus: 'pending',
            averageRating: 0,
            consultationFee: 5000, // Default NGN
          });
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-sm p-10 border border-slate-200"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-6">
            L
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {isSignup 
              ? 'Access verified legal infrastructure' 
              : 'Sign in to manage your legal cases'}
          </p>
        </div>

        {isSignup && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button
              onClick={() => setRole('client')}
              className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                role === 'client' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              CLIENT
            </button>
            <button
              onClick={() => setRole('lawyer')}
              className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                role === 'lawyer' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              LAWYER
            </button>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm font-medium mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-14 bg-slate-900 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all font-bold text-white group disabled:opacity-50 disabled:cursor-wait uppercase tracking-widest text-xs"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            {isSignup ? 'Existing Member?' : 'New Member?'}
            <button 
              onClick={() => navigate(`/auth?signup=${!isSignup}`)}
              className="ml-2 text-blue-600 hover:underline"
            >
              {isSignup ? 'SIGN IN' : 'JOIN PLATFORM'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
