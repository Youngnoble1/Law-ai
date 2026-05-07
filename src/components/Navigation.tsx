import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { User } from '../types';
import { LogOut, Briefcase, FileText, LayoutDashboard, Shield, Gavel, User as UserIcon } from 'lucide-react';

interface NavigationProps {
  user: User | null;
}

export default function Navigation({ user }: NavigationProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
                L
              </div>
              <span className="text-xl font-bold tracking-tight text-blue-900">
                Law ai
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                {user.role === 'lawyer' && (
                  <Link to={`/lawyer/${user.userId}`} className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium">
                    <UserIcon size={18} />
                    My Profile
                  </Link>
                )}
                <Link to="/cases" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium">
                  <Briefcase size={18} />
                  Case Vault
                </Link>
                <Link to="/vault" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium">
                  <Shield size={18} />
                  Wallet & Escrow
                </Link>
                <div className="h-6 w-px bg-slate-200 mx-2" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
                  Login
                </Link>
                <Link 
                  to="/auth?signup=true" 
                  className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                >
                  Join Platform
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
