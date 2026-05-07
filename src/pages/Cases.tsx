import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { User, Case } from '../types';
import Navigation from '../components/Navigation';
import { Briefcase, Search, Filter, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface CasesProps {
  user: User;
}

export default function Cases({ user }: CasesProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const q = query(
          collection(db, 'cases'),
          where(user.role === 'lawyer' ? 'lawyerId' : 'clientId', '==', user.userId),
          orderBy('updatedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const casesData = querySnapshot.docs.map(doc => ({ caseId: doc.id, ...doc.data() } as Case));
        setCases(casesData);
      } catch (err) {
        console.error('Error fetching cases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [user]);

  const filteredCases = cases.filter(c => 
    c.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation user={user} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none mb-2">My Dockets</h1>
            <p className="text-slate-500 font-medium text-sm">Manage all active and closed legal engagements</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search matter ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-64 shadow-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c, idx) => (
              <motion.div
                key={c.caseId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link 
                  to={`/cases/${c.caseId}`}
                  className="block bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-blue-500 transition-all group h-full"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border",
                      c.status === 'Completed' ? "bg-green-50 text-green-600 border-green-100" : "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      {c.status === 'Completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Matter #{c.caseId.slice(0, 5).toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none">
                    {c.serviceType}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-10 italic">
                    {c.description || 'System initialized matching protocol.'}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5 tracking-widest">Protocol Phase</p>
                      <p className="font-bold text-[10px] text-blue-600 uppercase tracking-widest">
                        {c.status}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Docket Empty</h3>
            <p className="text-slate-400 font-medium mb-8 text-sm">
              {searchTerm ? 'No matches in current dockets.' : 'Establish your first matter via AI Intake.'}
            </p>
            {!searchTerm && (
              <Link to="/intake" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
                New Diagnosis
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
