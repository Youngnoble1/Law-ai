import { useState } from 'react';
import { motion } from 'motion/react';
import Navigation from '../components/Navigation';
import { User } from '../types';
import { FileText, Download, Shield, Lock, Search, Filter, Plus, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface DocumentVaultProps {
  user: User;
}

const MOCK_DOCS = [
  { id: '1', name: 'Landlord_Eviction_Notice.pdf', type: 'Evidence', date: '2026-04-10', size: '1.2 MB' },
  { id: '2', name: 'Lease_Agreement_Scan.pdf', type: 'Foundation', date: '2026-04-11', size: '4.5 MB' },
  { id: '3', name: 'Payment_Receipts_Bundle.zip', type: 'Evidence', date: '2026-04-12', size: '12.8 MB' },
];

export default function DocumentVault({ user }: DocumentVaultProps) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation user={user} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-4">
              <Shield size={14} />
              Vault-Level Security
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Matter Evidence</h1>
            <p className="text-slate-500 font-medium">Securely store and share sensitive legal filings</p>
          </div>
          
          <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <Plus size={20} />
            Secure Upload
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Filter size={14} />
                PROTOCOL Filter
              </h3>
              <div className="space-y-1">
                {['All Files', 'Evidence', 'Foundation', 'Drafts', 'Court Filings'].map(cat => (
                  <button key={cat} className="w-full text-left px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 text-slate-600 transition-colors uppercase tracking-widest">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-600 text-white rounded-2xl p-8 shadow-lg shadow-blue-200 overflow-hidden relative">
              <Lock className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
              <h3 className="text-lg font-bold mb-4">Zero-Knowledge</h3>
              <p className="text-blue-100/60 text-[10px] leading-relaxed font-bold uppercase tracking-widest">
                Your documents are encrypted before they reach our servers. Total privacy.
              </p>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search matter ref or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-8 py-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filename</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_DOCS.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center">
                              <FileText size={16} />
                            </div>
                            <span className="font-bold text-slate-900 text-sm">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-widest">
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          {doc.date}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
