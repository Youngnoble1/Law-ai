import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { User, Case, Milestone } from '../types';
import Navigation from '../components/Navigation';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  FileCheck, 
  CreditCard, 
  Video, 
  FileText,
  ChevronRight,
  User as UserIcon,
  AlertCircle,
  Gavel,
  Lock
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

interface CaseDetailProps {
  user: User;
}

export default function CaseDetail({ user }: CaseDetailProps) {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [lawyer, setLawyer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!caseId) return;
      try {
        const caseDoc = await getDoc(doc(db, 'cases', caseId));
        if (caseDoc.exists()) {
          const d = { caseId: caseDoc.id, ...caseDoc.data() } as Case;
          setCaseData(d);

          // Fetch Lawyer info if assigned
          if (d.lawyerId) {
            const lawyerDoc = await getDoc(doc(db, 'users', d.lawyerId));
            if (lawyerDoc.exists()) {
              setLawyer(lawyerDoc.data() as User);
            }
          }

          // Fetch Milestones
          const mQuery = query(collection(db, `cases/${caseId}/milestones`));
          const mSnapshot = await getDocs(mQuery);
          setMilestones(mSnapshot.docs.map(doc => ({ milestoneId: doc.id, ...doc.data() } as Milestone)));
        }
      } catch (err) {
        console.error('Error fetching case detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!caseId || !caseData) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'cases', caseId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setCaseData({ ...caseData, status: newStatus as any });
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-slate-600">Syncing with NBA dockets...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-[#F8F9FD]">
        <Navigation user={user} />
        <div className="max-w-xl mx-auto py-24 text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Case Not Found</h1>
          <Link to="/cases" className="text-emerald-600 font-bold hover:underline">Return to Dockets</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation user={user} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Case Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/cases" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">My Cases</Link>
              <ChevronRight size={10} className="text-slate-300" />
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{caseData.serviceType}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none mb-6">
              {caseData.serviceType} <span className="text-slate-300 font-medium">#{caseData.caseId.slice(0, 5).toUpperCase()}</span>
            </h1>

            <div className="flex flex-wrap gap-3">
              <div className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Tier: {caseData.tier}
              </div>
              <div className={cn(
                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                caseData.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              )}>
                {caseData.status}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Flow: Lifecycle & Milestones */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Service Protocol</h2>
                {user.role === 'lawyer' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateStatus('Drafting')}
                      className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-all border border-slate-200 uppercase tracking-widest"
                    >
                      Drafting
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('Filing')}
                      className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-all border border-slate-200 uppercase tracking-widest"
                    >
                      Filing
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-0">
                <div className="relative pl-10 pb-12 border-l border-blue-500">
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Diagnostic Intake OK</h3>
                  <p className="text-sm text-slate-500 font-medium">Issue categorized and analyzed by AI Engine.</p>
                </div>
                
                <div className={cn(
                  "relative pl-10 pb-12 border-l",
                  ['Drafting', 'Awaiting Client Review', 'Filing', 'Completed'].includes(caseData.status) ? "border-blue-500" : "border-slate-100"
                )}>
                  <div className={cn(
                    "absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ring-4",
                    ['Drafting', 'Awaiting Client Review', 'Filing', 'Completed'].includes(caseData.status) ? "bg-blue-500 ring-blue-50" : "bg-slate-200 ring-slate-50"
                  )} />
                  <h3 className={cn(
                    "text-xs font-bold uppercase tracking-widest mb-1",
                    ['Drafting', 'Awaiting Client Review', 'Filing', 'Completed'].includes(caseData.status) ? "text-slate-900" : "text-slate-400"
                  )}>Drafting Documents</h3>
                  <p className="text-sm text-slate-500 font-medium">Lawyer is preparing initial legal briefs/forms.</p>
                </div>

                <div className={cn(
                  "relative pl-10 pb-12 border-l",
                  ['Filing', 'Completed'].includes(caseData.status) ? "border-blue-500" : "border-slate-100"
                )}>
                  <div className={cn(
                    "absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ring-4",
                    ['Filing', 'Completed'].includes(caseData.status) ? "bg-blue-500 ring-blue-50" : "bg-slate-200 ring-slate-50"
                  )} />
                  <h3 className={cn(
                    "text-xs font-bold uppercase tracking-widest mb-1",
                    ['Filing', 'Completed'].includes(caseData.status) ? "text-slate-900" : "text-slate-400"
                  )}>CAC/Court Filing</h3>
                  <p className="text-sm text-slate-500 font-medium">Official submission to regulatory bodies.</p>
                </div>

                <div className="relative pl-10">
                  <div className={cn(
                    "absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ring-4",
                    caseData.status === 'Completed' ? "bg-blue-500 ring-blue-50" : "bg-slate-200 ring-slate-50"
                  )} />
                  <h3 className={cn(
                    "text-xs font-bold uppercase tracking-widest mb-1",
                    caseData.status === 'Completed' ? "text-slate-900" : "text-slate-400"
                  )}>Matter Resolution</h3>
                  <p className="text-sm text-slate-500 font-medium">Final outcome achieved and case closed by counsel.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">Assigned Counsel</h3>
              {lawyer ? (
                <Link to={`/lawyer/${lawyer.userId}`} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden ring-1 ring-slate-200">
                    {lawyer.avatarUrl ? (
                      <img src={lawyer.avatarUrl} alt={lawyer.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={24} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{lawyer.fullName}</h4>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                      <ShieldCheck size={10} />
                      Verified
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Matching Counsel...</p>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">Action Centre</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold rounded-xl flex items-center justify-between transition-all group">
                  <div className="flex items-center gap-3">
                    <Video size={16} className="text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Video Call</span>
                  </div>
                </button>
                <Link to="/vault" className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold rounded-xl flex items-center justify-between transition-all block">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Document Vault</span>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
