import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { User, Case, LawyerProfile } from '../types';
import Navigation from '../components/Navigation';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronRight, 
  Plus, 
  Users, 
  CreditCard,
  FileText,
  Star as StarIcon,
  Camera,
  Loader2,
  User as UserIcon,
  Lock
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user: propUser }: DashboardProps) {
  const [user, setUser] = useState<User>(propUser);
  const [cases, setCases] = useState<Case[]>([]);
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUser(propUser);
  }, [propUser]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512 * 1024) {
      alert("Please upload an image smaller than 500KB.");
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          await updateDoc(doc(db, 'users', user.userId), {
            avatarUrl: base64String
          });
          setUser(prev => ({ ...prev, avatarUrl: base64String }));
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.userId}`);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'cases'),
          where(user.role === 'lawyer' ? 'lawyerId' : 'clientId', '==', user.userId),
          orderBy('updatedAt', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const casesData = querySnapshot.docs.map(doc => ({ caseId: doc.id, ...doc.data() } as Case));
        setCases(casesData);

        if (user.role === 'lawyer') {
          const lawyerDocs = await getDocs(query(collection(db, 'lawyers'), where('lawyerId', '==', user.userId)));
          if (!lawyerDocs.empty) {
            setProfile(lawyerDocs.docs[0].data() as LawyerProfile);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <Navigation user={user} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={32} className="text-slate-300" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-10 rounded-2xl backdrop-blur-[2px]">
                      <Loader2 className="text-white animate-spin" size={24} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleUploadClick}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all border-2 border-white active:scale-95"
                >
                  <Camera size={14} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                  Hello, <span className="text-blue-600">{user.fullName}</span>
                </h1>
                <p className="text-slate-500 font-medium">
                  {user.role === 'lawyer' ? 'Manage your legal docket and assignments' : 'Track your legal issues and document vault'}
                </p>
              </div>
            </div>
            
            {user.role === 'client' && (
              <Link 
                to="/intake"
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                <Plus size={20} />
                New Case Diagnosis
              </Link>
            )}
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content: Recent Cases */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                    Active Matter
                  </span>
                  <h2 className="text-2xl font-bold text-slate-800 mt-2 tracking-tight uppercase tracking-tight">Active Docket</h2>
                  <p className="text-xs text-slate-400 font-medium tracking-tight">Matter Ref: LAW-{user.userId.slice(0, 5).toUpperCase()} • Tracking {cases.length} cases</p>
                </div>
              </div>

              {/* Progress Tracker (Clean Minimalism) */}
              <div className="relative py-8 px-4">
                <div className="h-0.5 bg-slate-100 w-full absolute top-1/2 -translate-y-1/2 left-0"></div>
                <div className="h-0.5 bg-blue-600 w-1/4 absolute top-1/2 -translate-y-1/2 left-0"></div>
                <div className="flex justify-between relative z-10">
                  {[
                    { step: 1, label: 'Intake', active: true },
                    { step: 2, label: 'Matching', active: false },
                    { step: 3, label: 'Execution', active: false },
                    { step: 4, label: 'Closing', active: false },
                  ].map((s) => (
                    <div key={s.step} className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ring-8 ring-white transition-all",
                        s.active ? "bg-blue-600 text-white" : "bg-white border-2 border-slate-200 text-slate-300 shadow-sm"
                      )}>
                        {s.step}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold mt-4 uppercase tracking-widest",
                        s.active ? "text-blue-600" : "text-slate-300"
                      )}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/intake"
                  className="flex-1 bg-slate-900 text-white py-4 rounded-xl text-xs font-bold text-center hover:bg-slate-800 transition-all"
                >
                  New Video Consult
                </Link>
                <Link 
                  to="/vault"
                  className="flex-1 border-2 border-slate-100 text-slate-600 py-4 rounded-xl text-xs font-bold text-center hover:border-slate-200 transition-all"
                >
                  Upload Documents
                </Link>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <Briefcase size={18} className="text-blue-500" />
                  Recent Activity
                </h2>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : cases.length > 0 ? (
                <div className="space-y-4">
                  {cases.map((c) => (
                    <Link 
                      key={c.caseId}
                      to={`/cases/${c.caseId}`}
                      className="group flex items-center p-5 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex-grow">
                        <h3 className="font-bold text-slate-900 mb-1">{c.serviceType}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{c.description || 'System matching initialized'}</p>
                      </div>
                      <div className="text-right mr-6">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                          c.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {c.status}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} />
                  </div>
                  <p className="text-slate-400 text-xs font-bold italic tracking-tight">No recent filings or updates found.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Integrity Panel */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Matter Integrity</h5>
              <div className="space-y-4">
                {[
                  { label: 'Reliability', dots: 4 },
                  { label: 'Timeliness', dots: 5 },
                  { label: 'Clarity', dots: 3 },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-xs text-slate-600 font-medium">{row.label}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <div key={d} className={`w-3 h-3 rounded-full ${d <= row.dots ? 'bg-blue-500' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {user.role === 'lawyer' && profile?.verificationStatus !== 'verified' && (
              <section className="bg-white rounded-xl p-6 border-2 border-dashed border-slate-200">
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center mb-4">
                  <Lock size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">NBA Verification</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed font-medium mb-4">
                  Verify your Credentials to begin accepting cases.
                </p>
                <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-all">
                  Submit SCN
                </button>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Missing icon
const Star = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const Gavel = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m14.5 12.5-8 8a2.11 2.11 0 0 1-3-3l8-8"></path>
    <path d="m16 16 2 2"></path>
    <path d="m8 8 2 2"></path>
    <path d="m15 2 6 6"></path>
    <path d="m19 11-8-8"></path>
    <path d="M2 2l20 20"></path>
  </svg>
);
