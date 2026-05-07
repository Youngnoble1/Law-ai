import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, LawyerProfile as Profile } from '../types';
import Navigation from '../components/Navigation';
import { ShieldCheck, Star, Clock, Gavel, Award, MessageSquare, MapPin, User as UserIcon, Camera, Loader2, Edit2, Save, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface LawyerProfileProps {
  currentUser: User | null;
}

export default function LawyerProfile({ currentUser }: LawyerProfileProps) {
  const { lawyerId } = useParams<{ lawyerId: string }>();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = currentUser?.userId === lawyerId;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lawyerId) return;

    // Check file size (limit to 500KB to ensure it fits in Firestore comfortably)
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
          await updateDoc(doc(db, 'users', lawyerId), {
            avatarUrl: base64String
          });
          
          setLawyer(prev => prev ? { ...prev, avatarUrl: base64String } : null);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${lawyerId}`);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleBioSave = async () => {
    if (!lawyerId || !profile) return;
    try {
      await updateDoc(doc(db, 'lawyers', lawyerId), {
        bio: bioInput
      });
      setProfile({ ...profile, bio: bioInput });
      setIsEditingBio(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `lawyers/${lawyerId}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!lawyerId) return;
      try {
        // If viewing own profile, skip fetching lawyer user doc as we have it in currentUser
        if (currentUser?.userId === lawyerId) {
          setLawyer(currentUser);
        } else {
          const userDoc = await getDoc(doc(db, 'users', lawyerId));
          if (userDoc.exists()) setLawyer(userDoc.data() as User);
        }

        const profileDoc = await getDoc(doc(db, 'lawyers', lawyerId));
        if (profileDoc.exists()) {
          const data = profileDoc.data() as Profile;
          setProfile(data);
          setBioInput(data.bio || '');
        }
      } catch (err) {
        console.error('Error fetching lawyer profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lawyerId, currentUser]);

  if (loading) return <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  if (!lawyer || !profile) return <div>Lawyer not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation user={currentUser} />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left Col: Photo & Basic Stats */}
            <aside className="md:w-64 space-y-6">
              <div className="relative group">
                <div className="w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border-4 border-white shadow-sm ring-1 ring-slate-100">
                  {lawyer.avatarUrl ? (
                    <img src={lawyer.avatarUrl} alt={lawyer.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <UserIcon size={64} />
                    </div>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-10 rounded-2xl backdrop-blur-[2px]">
                      <Loader2 className="text-white animate-spin" size={32} />
                    </div>
                  )}
                </div>

                {isOwner && (
                  <>
                    <button 
                      onClick={handleUploadClick}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all border-4 border-white active:scale-95"
                      title="Update Profile Picture"
                    >
                      <Camera size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                  <div className="text-blue-600 font-bold text-xl leading-none mb-1">{profile.averageRating.toFixed(1)}</div>
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Score</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <div className="text-slate-900 font-bold text-xl leading-none mb-1">100+</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cases</div>
                </div>
              </div>
            </aside>

            {/* Right Col: Bio & Pricing */}
            <div className="flex-grow space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">{lawyer.fullName}</h1>
                  {profile.verificationStatus === 'verified' && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-widest">
                      <ShieldCheck size={10} />
                      Verified
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} /> Lagos, NG
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={14} /> Senior Advocate
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} /> Fast Responder
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.specialties.map(spec => (
                  <span key={spec} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-widest border border-slate-200">
                    {spec}
                  </span>
                ))}
              </div>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic whitespace-nowrap">Professional Bio</h3>
                  {isOwner && !isEditingBio && (
                    <button 
                      onClick={() => setIsEditingBio(true)}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
                
                {isEditingBio ? (
                  <div className="space-y-4">
                    <textarea 
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      className="w-full min-h-[160px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-700 text-sm font-medium resize-none transition-all"
                      placeholder="Describe your legal experience, specialties, and professional background..."
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleBioSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all"
                      >
                        <Save size={14} /> Save Bio
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingBio(false);
                          setBioInput(profile.bio || '');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg text-slate-700 leading-relaxed font-medium">
                    {profile.bio ? (
                      profile.bio
                    ) : (
                      <>
                        Expert legal representative specializing in {profile.specialties.join(', ')}. 
                        Dedicated to professional excellence and client success in the Nigerian legal landscape.
                      </>
                    )}
                  </p>
                )}
              </section>

              <div className="p-8 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Consultation Fee</p>
                  <p className="text-4xl font-bold tracking-tight">{formatCurrency(profile.consultationFee)}</p>
                </div>
                <button 
                  onClick={() => navigate('/intake')}
                  className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm active:scale-95 uppercase tracking-widest"
                >
                  Book Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
