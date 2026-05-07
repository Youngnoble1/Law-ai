import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Navigation from '../components/Navigation';
import { Search, ShieldCheck, Zap, Gavel, FileText, Scale, Landmark, UserCheck, Briefcase } from 'lucide-react';

const CATEGORIES = [
  { id: 'tenancy', title: 'Tenancy Issues', icon: <Landmark className="text-blue-500" />, freq: 'High' },
  { id: 'business', title: 'Business Filing', icon: <Briefcase className="text-emerald-500" />, freq: 'High' },
  { id: 'debt', title: 'Debt Recovery', icon: <Zap className="text-amber-500" />, freq: 'High' },
  { id: 'family', title: 'Family/Divorce', icon: <UserCheck className="text-rose-500" />, freq: 'Medium' },
  { id: 'criminal', title: 'Legal Advice', icon: <Scale className="text-slate-500" />, freq: 'Medium' },
  { id: 'property', title: 'Property Docs', icon: <FileText className="text-indigo-500" />, freq: 'High' },
  { id: 'mergers', title: 'M&A and Restructure', icon: <Landmark className="text-orange-500" />, freq: 'Low' },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation user={null} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-8 border border-blue-100 uppercase tracking-widest"
            >
              Verified Legal Infrastructure
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.05]"
            >
              Legal Expertise. <br />
              <span className="text-blue-600">and Solutions.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-500 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              All legal services and expertise at the tap of a button. 
              Diagnosed by AI, executed by NBA-verified lawyers.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                to="/intake" 
                className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Get Diagnostic Setup
              </Link>
              <Link 
                to="/auth?signup=true&role=lawyer" 
                className="bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Join as Lawyer
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Diagnostic Categories */}
        <section className="bg-slate-50 py-24 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Legal Marketplace</h2>
              <p className="text-slate-500">Select a diagnostic category to begin assessment.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CATEGORIES.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-500 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{cat.title}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {cat.freq} Frequency
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Trust */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight uppercase tracking-wider">NBA Verified Protocol</h2>
              <div className="w-12 h-1 bg-blue-600 mx-auto" />
            </div>
            <div className="grid md:grid-cols-3 gap-16">
              <div className="flex flex-col">
                <div className="text-blue-600 mb-6 font-black text-4xl">01</div>
                <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">Direct Matching</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  Connect directly with specialized legal counsel verified for your specific diagnostic needs and jurisdiction.
                </p>
              </div>
              
              <div className="flex flex-col">
                <div className="text-blue-600 mb-6 font-black text-4xl">02</div>
                <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">Professional Sync</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  Every lawyer is matched to their specific SCN enrollment number and verified against the National database.
                </p>
              </div>
              
              <div className="flex flex-col">
                <div className="text-blue-600 mb-6 font-black text-4xl">03</div>
                <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">Market Integrity</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  No commissions on legal fees. Platform operates on SaaS subscriptions and transparent access fees.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Law ai</span>
            </div>
            <div className="flex gap-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <Link to="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link to="#" className="hover:text-blue-600 transition-colors">NBA RPC</Link>
            </div>
            <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">
              © 2026 LAW AI • NIGERIAN LEGAL TECH
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
