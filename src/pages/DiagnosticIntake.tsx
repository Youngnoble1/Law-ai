import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { processDiagnosticIntake, IntakeResult } from '../lib/gemini';
import Navigation from '../components/Navigation';
import { Search, Zap, CheckCircle, ArrowRight, Loader2, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn, formatCurrency } from '../lib/utils';

interface DiagnosticIntakeProps {
  user: User | null;
}

export default function DiagnosticIntake({ user }: DiagnosticIntakeProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [issue, setIssue] = useState('');
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartDiagnosis = async () => {
    if (!issue.trim() || issue.length < 20) {
      setError('Please provide a more detailed description (at least 20 characters).');
      return;
    }
    
    setLoading(true);
    setStep('processing');
    setError(null);
    
    try {
      const diagnosis = await processDiagnosticIntake(issue);
      setResult(diagnosis);
      setStep('result');
    } catch (err: any) {
      setError('Diagnosis failed. Please try again.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async () => {
    if (!user) {
      navigate('/auth?signup=true');
      return;
    }

    if (!result) return;

    try {
      const caseRef = await addDoc(collection(db, 'cases'), {
        clientId: user.userId,
        serviceType: result.category,
        tier: result.tier,
        status: 'Diagnostic',
        totalFee: 0, // Lawyer will set this
        description: issue,
        aiDiagnosis: result,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      navigate(`/cases/${caseRef.id}`);
    } catch (err) {
      console.error('Error creating case:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <Navigation user={user} />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-white"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Zap size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Diagnosis</h1>
                  <p className="text-slate-500 font-medium text-sm">Powered by Gemini 3 Flash</p>
                </div>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <span className="text-slate-700 font-bold text-lg mb-2 block">What legal issue are you facing today?</span>
                  <textarea
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="E.g., My landlord is trying to evict me without 6 months notice, but my rent is paid up to June..."
                    className="w-full h-48 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-lg resize-none"
                  />
                  {error && (
                    <p className="mt-2 text-rose-500 text-sm font-semibold flex items-center gap-1">
                      <AlertCircle size={14} />
                      {error}
                    </p>
                  )}
                </label>

                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                  <div className="text-blue-500 shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <p className="text-blue-700 text-sm font-medium leading-relaxed">
                    Be as descriptive as possible. Include dates, amounts, and specific 
                    actions taken. Our AI will analyze this according to the Nigerian Constitution 
                    and relevant Acts.
                  </p>
                </div>

                <button
                  onClick={handleStartDiagnosis}
                  disabled={loading}
                  className="w-full py-5 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Start Professional Diagnosis
                  <ArrowRight size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="relative mb-12">
                <div className="w-24 h-24 border-4 border-slate-100 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight uppercase tracking-wider">Analyzing Case...</h2>
              <div className="space-y-3 max-w-sm mx-auto text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                <p className="animate-pulse">Consulting Law Reports...</p>
                <p className="animate-pulse delay-75">Categorizing Frequency...</p>
                <p className="animate-pulse delay-150">Estimating Costs...</p>
              </div>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8">
                  <div className={cn(
                    "px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest",
                    result.tier === 'High' ? "bg-rose-100 text-rose-600" :
                    result.tier === 'Medium' ? "bg-amber-100 text-amber-600" :
                    "bg-emerald-100 text-emerald-600"
                  )}>
                    {result.tier} Frequency
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{result.category}</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Case Diagnosis Complete</p>
                  </div>
                </div>

                <div className="space-y-10">
                  <section>
                    <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4">AI Summary</h3>
                    <p className="text-xl text-slate-700 leading-relaxed font-medium">
                      {result.summary}
                    </p>
                  </section>

                  <div className="grid md:grid-cols-2 gap-10">
                    <section>
                      <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-6">Recommended Actions</h3>
                      <ul className="space-y-4 font-bold text-slate-700">
                        {result.recommendedActions.map((action, i) => (
                          <li key={i} className="flex gap-3">
                            <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                      <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-6">Market Estimate</h3>
                      <div className="mb-6">
                        <div className="text-4xl font-black text-slate-900 mb-2">{result.estimatedCostRange}</div>
                        <p className="text-sm text-slate-500 font-medium">Average cost for this service type in Nigeria</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-200">
                        <p className="text-xs text-slate-500 leading-relaxed italic">
                          *Fees are SaaS subscriptions for lawyers and convenience fees for clients. 
                          Actual legal fees are negotiated between you and the counsel.
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCreateCase}
                  className="flex-grow py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Appoint Verified Lawyer
                  <Gavel size={20} />
                </button>
                <button
                  onClick={() => setStep('input')}
                  className="px-8 py-5 bg-white text-slate-700 border-2 border-slate-200 rounded-3xl font-bold hover:border-emerald-600 transition-all"
                >
                  Edit Issue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Missing icon
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
