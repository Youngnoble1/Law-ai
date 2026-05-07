import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from './types';

// Pages (to be created)
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DiagnosticIntake from './pages/DiagnosticIntake';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import DocumentVault from './pages/DocumentVault';
import LawyerProfile from './pages/LawyerProfile';
import Auth from './pages/Auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
      }

      if (fbUser) {
        userUnsubscribe = onSnapshot(doc(db, 'users', fbUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            setUser(snapshot.data() as User);
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user doc:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (userUnsubscribe) (userUnsubscribe as () => void)();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium text-slate-600">Loading Law ai...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#F5F5FA] text-slate-900 font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} 
          />
          
          <Route 
            path="/intake" 
            element={<DiagnosticIntake user={user} />} 
          />
          
          <Route 
            path="/cases" 
            element={user ? <Cases user={user} /> : <Navigate to="/auth" />} 
          />
          
          <Route 
            path="/cases/:caseId" 
            element={user ? <CaseDetail user={user} /> : <Navigate to="/auth" />} 
          />
          
          <Route 
            path="/vault" 
            element={user ? <DocumentVault user={user} /> : <Navigate to="/auth" />} 
          />

          <Route 
            path="/lawyer/:lawyerId" 
            element={<LawyerProfile currentUser={user} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}
