import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, Headphones, Home, Wallet, Users, User, LogOut, 
  ChevronRight, PlayCircle, CheckCircle, SmartphoneNfc, Keyboard, 
  Brain, Banknote, PlusCircle, Send, Facebook, Instagram, Youtube,
  Crown, Settings, Lock, Download, ClipboardList, History, Upload,
  RefreshCw, Copy, Eye, AlertCircle, Share2, DollarSign, Briefcase,
  ShieldCheck, HelpCircle, FileText, X, Camera, ToggleLeft, Video,
  Ticket, ExternalLink, Loader2, CreditCard, Gift, Trophy, Globe,
  MessageCircle, LayoutGrid, Star, AlertTriangle, Play, XCircle,
  ShoppingBag, CheckSquare, Zap, Gift as GiftIcon, Clock, Calendar,
  Map, Milestone
} from 'lucide-react';
import { UserData, DB_KEYS } from './types';
import { supabase } from './supabaseClient';

// --- Global Styles ---
const FORM_INPUT_STYLE = "w-full border border-gray-300 p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition shadow-sm placeholder-gray-500";
const PAGE_CONTAINER_STYLE = "min-h-screen bg-gray-50 pb-24"; 

// --- Types & Helpers ---
interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'earning' | 'transfer' | 'bonus' | 'purchase';
  category: 'task' | 'typing' | 'sell' | 'quiz' | 'salary' | 'main' | 'referral' | 'typing_package' | 'quiz_package' | 'gmail_request'; 
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'pending_creds' | 'working' | 'pending_recovery' | 'finalizing' | 'review';
  date: string;
  method?: string; 
  details?: string; 
  senderNumber?: string;
  trxId?: string;
  sourceWallet?: string; 
}

// Fetch Settings from Supabase
const getSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    const defaults = {
        appName: 'Next Level Earn',
        minWithdraw: 100, 
        freeWithdrawLimit: 1, 
        supportLink: 'https://t.me/support',
        bkash: '', nagad: '',
        premiumCost: 500,
        premiumBkash: '', premiumNagad: '',
        sliderImages: [
            "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60"
        ],
        socialRates: { gmail: 10, facebook: 5, instagram: 5, tiktok: 5 },
        promo: { title: 'ধামাকা অফার ২০২৬ রমজানুল মোবারক', desc: 'এই অফারটি সীমিত সময়ের জন্য!', link: '' }
    };
    // Supabase stores JSON in a 'value' column usually, or separate columns. Assuming 'value' JSON column here.
    return data ? { ...defaults, ...data.value } : defaults;
};

// Save Transaction to Supabase
const saveTransaction = async (userId: string, trx: any) => {
  // Remove ID if it exists in trx object because Supabase generates it
  const { id, ...trxData } = trx; 
  await supabase.from('transactions').insert([{ ...trxData, userId }]);
};

// Get User Stats
const getUserStats = async (userId: string) => {
   const { data: trxs } = await supabase.from('transactions').select('*').eq('userId', userId);
   if (!trxs) return { totalEarned: 0, totalWithdraw: 0, pendingWithdraw: 0 };

   return {
      totalEarned: trxs.filter(t => t.type === 'earning' && t.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0),
      totalWithdraw: trxs.filter(t => t.type === 'withdraw' && t.status !== 'rejected').reduce((acc, curr) => acc + curr.amount, 0),
      pendingWithdraw: trxs.filter(t => t.type === 'withdraw' && t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0),
   };
};

// --- Custom Popup Component ---
const CustomPopup = ({ isOpen, type, message, onClose }: { isOpen: boolean, type: 'success' | 'error' | 'warning', message: string, onClose: () => void }) => {
    if (!isOpen) return null;

    const icons = {
        success: <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />,
        error: <XCircle size={48} className="text-red-500 mx-auto mb-3" />,
        warning: <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-3" />
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                {icons[type]}
                <h3 className={`text-xl font-bold mb-2 ${type === 'success' ? 'text-emerald-700' : type === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                    {type === 'success' ? 'সফল হয়েছে!' : type === 'error' ? 'ব্যর্থ হয়েছে!' : 'সতর্কীকরণ!'}
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed whitespace-pre-line">{message}</p>
                <button onClick={onClose} className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition transform active:scale-95 ${type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                    ঠিক আছে
                </button>
            </div>
        </div>
    );
};

// --- Support Modal ---
const SupportModal = ({ onClose }: { onClose: () => void }) => {
    const [settings, setSettings] = useState<any>({});
    useEffect(() => { getSettings().then(setSettings); }, []);

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden relative animate-in slide-in-from-bottom duration-300">
                 <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
                     <h3 className="font-bold flex items-center gap-2"><Headphones size={20}/> সাপোর্ট সেন্টার</h3>
                     <button onClick={onClose}><X size={20}/></button>
                 </div>
                 <div className="p-6 space-y-4">
                     <button onClick={() => window.open(settings.supportLink || 'https://t.me/channel')} className="w-full flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100 hover:bg-blue-100 transition">
                         <div className="bg-blue-500 p-3 rounded-full text-white"><Send size={20}/></div>
                         <div className="text-left">
                             <h4 className="font-bold text-gray-800">Telegram Channel</h4>
                             <p className="text-xs text-gray-500">অফিসিয়াল আপডেট পেতে</p>
                         </div>
                     </button>
                     <button onClick={() => window.open('https://t.me/group')} className="w-full flex items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition">
                         <div className="bg-indigo-500 p-3 rounded-full text-white"><Users size={20}/></div>
                         <div className="text-left">
                             <h4 className="font-bold text-gray-800">Telegram Group</h4>
                             <p className="text-xs text-gray-500">অন্যদের সাথে চ্যাট করুন</p>
                         </div>
                     </button>
                     <button onClick={() => window.open(settings.supportLink)} className="w-full flex items-center gap-4 bg-red-50 p-4 rounded-xl border border-red-100 hover:bg-red-100 transition">
                         <div className="bg-red-500 p-3 rounded-full text-white"><Headphones size={20}/></div>
                         <div className="text-left">
                             <h4 className="font-bold text-gray-800">Admin Contact</h4>
                             <p className="text-xs text-gray-500">সরাসরি কথা বলুন</p>
                         </div>
                     </button>
                 </div>
             </div>
        </div>
    );
};

// --- Premium Required View ---
const PremiumLockView = ({ onGoPremium }: { onGoPremium: () => void }) => (
    <div className="p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[50vh]">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-2 animate-bounce">
            <Lock size={40} className="text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">অ্যাকাউন্ট অ্যাক্টিভেশন প্রয়োজন</h2>
        <p className="text-sm text-gray-500 max-w-xs">
            এই কাজটি করার জন্য আপনার অ্যাকাউন্টটি প্রিমিয়াম হতে হবে। অনুগ্রহ করে অ্যাকাউন্ট অ্যাক্টিভ করুন।
        </p>
        <button onClick={onGoPremium} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition flex items-center gap-2">
            <Crown size={18} /> অ্যাক্টিভ করুন
        </button>
    </div>
);

// --- Reusable Header ---
const Header = ({ title, onBack, rightAction }: any) => (
  <div className="bg-emerald-600 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
     <div className="flex items-center gap-3">
        {onBack && <button onClick={onBack} className="p-1 hover:bg-white/20 rounded-full transition"><ChevronRight className="rotate-180" /></button>}
        <h2 className="font-bold text-lg">{title}</h2>
     </div>
     {rightAction}
  </div>
);

// --- Bottom Navigation ---
const BottomNav = ({ currentView, setView }: any) => (
  <div className="fixed bottom-0 w-full bg-white/95 backdrop-blur-lg border-t border-gray-100 flex justify-around py-3 text-gray-400 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] pb-safe">
    <button onClick={() => setView('dashboard')} className={`flex flex-col items-center transition ${currentView === 'dashboard' ? 'text-emerald-600' : 'hover:text-gray-600'}`}>
       <Home size={24} className={currentView === 'dashboard' ? 'fill-emerald-100' : ''} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
       <span className="text-[10px] mt-1 font-bold">Home</span>
    </button>
    <button onClick={() => setView('wallet')} className={`flex flex-col items-center transition ${currentView === 'wallet' ? 'text-emerald-600' : 'hover:text-gray-600'}`}>
       <Wallet size={24} className={currentView === 'wallet' ? 'fill-emerald-100' : ''} strokeWidth={currentView === 'wallet' ? 2.5 : 2} />
       <span className="text-[10px] mt-1 font-bold">Wallet</span>
    </button>
    <button onClick={() => setView('deposit')} className={`flex flex-col items-center group`}>
       <div className="w-12 h-12 bg-emerald-600 rounded-full -mt-8 flex items-center justify-center shadow-lg border-4 border-white text-white group-hover:scale-105 transition">
          <PlusCircle size={28} />
       </div>
       <span className="text-[10px] mt-1 font-bold text-gray-500 group-hover:text-emerald-600">Add</span>
    </button>
    <button onClick={() => setView('tasks')} className={`flex flex-col items-center transition ${currentView === 'tasks' ? 'text-emerald-600' : 'hover:text-gray-600'}`}>
       <ClipboardList size={24} className={currentView === 'tasks' ? 'fill-emerald-100' : ''} strokeWidth={currentView === 'tasks' ? 2.5 : 2} />
       <span className="text-[10px] mt-1 font-bold">Task</span>
    </button>
    <button onClick={() => setView('profile')} className={`flex flex-col items-center transition ${currentView === 'profile' ? 'text-emerald-600' : 'hover:text-gray-600'}`}>
       <User size={24} className={currentView === 'profile' ? 'fill-emerald-100' : ''} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
       <span className="text-[10px] mt-1 font-bold">Profile</span>
    </button>
  </div>
);

// --- 1. Task Page ---
const TaskPage = ({ user, onBack, setView, showPopup }: any) => {
  const [view, setInternalView] = useState('list');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  
  useEffect(() => {
      const fetchData = async () => {
          const { data: allTasks } = await supabase.from('tasks').select('*');
          const { data: userTrx } = await supabase.from('transactions').select('*').eq('userId', user.id).eq('category', 'task').order('date', {ascending: false});
          
          if (allTasks && userTrx) {
              setHistory(userTrx);
              const submittedDetails = userTrx.map((t: any) => t.details);
              setTasks(allTasks.filter((t: any) => !submittedDetails.includes(`Task: ${t.title}`)));
          }
      };
      fetchData();
  }, [user.id, view]);

  // Premium Check
  if (user.accountType === 'free') {
      return (
          <div className={PAGE_CONTAINER_STYLE}>
              <Header title="ডেইলি টাস্ক" onBack={() => setView('dashboard')} />
              <PremiumLockView onGoPremium={() => setView('premium')} />
          </div>
      );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveTransaction(user.id, {
      type: 'earning',
      category: 'task',
      amount: selectedTask.reward,
      status: 'pending',
      date: new Date().toISOString(),
      details: `Task: ${selectedTask.title}` 
    });
    showPopup('success', 'টাস্ক জমা দেওয়া হয়েছে! অ্যাডমিন চেক করার পর ব্যালেন্স যোগ হবে।');
    setInternalView('list');
  };

  if (view === 'history') {
     return (
        <div className={PAGE_CONTAINER_STYLE}>
           <Header title="Task History" onBack={() => setInternalView('list')} />
           <div className="p-4 space-y-3">
              {history.length === 0 ? (
                 <p className="text-center text-gray-400 mt-10 text-sm">কোনো টাস্ক হিস্টোরি নেই।</p>
              ) : (
                 history.map((h, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                       <div>
                          <p className="font-bold text-gray-800 text-sm">{h.details}</p>
                          <p className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString()}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-emerald-600">৳ {h.amount}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${h.status === 'approved' ? 'bg-green-100 text-green-700' : h.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                             {h.status}
                          </span>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>
     )
  }

  if (view === 'details' && selectedTask) {
    return (
      <div className={PAGE_CONTAINER_STYLE}>
        <Header title="Submit Task" onBack={() => setInternalView('list')} />
        <div className="p-4">
           <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border-l-4 border-emerald-500">
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-bold">Reward: ৳{selectedTask.reward}</span>
              <h1 className="text-lg font-bold mt-2 text-gray-800">{selectedTask.title}</h1>
              <p className="text-sm text-gray-600 mt-2">{selectedTask.desc}</p>
              <a href={selectedTask.link} target="_blank" className="bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 block mt-3">কাজের লিংক ওপেন করুন</a>
           </div>

           <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm space-y-4 border border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-700">কাজের প্রমাণ (Proof Details)</label>
                <textarea required className={FORM_INPUT_STYLE} rows={3} placeholder="আপনার ইউজারনেম বা ইমেইল দিন..."></textarea>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">স্ক্রিনশট (বাধ্যতামূলক)</label>
                <input type="file" required className={FORM_INPUT_STYLE} />
              </div>
              <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition">জমা দিন</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className={PAGE_CONTAINER_STYLE}>
      <Header title="ডেইলি টাস্ক" onBack={() => setView('dashboard')} rightAction={<button onClick={() => setInternalView('history')}><History className="text-white"/></button>} />
      <div className="px-4 py-4">
         <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Available Tasks</h3>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full">{tasks.length} Active</span>
         </div>
         <div className="space-y-3">
            {tasks.map((task: any) => (
              <div key={task.id} className="bg-white p-3 rounded-xl shadow-sm flex gap-3 border border-gray-100 hover:border-emerald-200 transition">
                  <div className="w-20 h-20 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-2xl">
                      {task.title.charAt(0)}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{task.title}</h3>
                      <span className="text-emerald-600 font-extrabold text-sm mt-1 block">৳ {task.reward}</span>
                    </div>
                    <button onClick={() => { setSelectedTask(task); setInternalView('details'); }} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold w-full mt-2 hover:bg-emerald-700">
                      কাজ শুরু করুন
                    </button>
                  </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-center text-gray-400 mt-5">বর্তমানে কোনো কাজ নেই।</p>}
         </div>
      </div>
    </div>
  );
};

// --- 2. Account Sell Page ---
const AccountSellPage = ({ user, onBack, showPopup, onGoPremium }: any) => {
  const [tab, setTab] = useState('gmail_request'); 
  const [subTab, setSubTab] = useState('submit');
  const [history, setHistory] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  const [form, setForm] = useState({
      email: '', password: '', code2fa: '', uid: '', username: '', recovery: ''
  });

  useEffect(() => { getSettings().then(setSettings); }, []);

  const refreshHistory = async () => {
       const { data: txs } = await supabase.from('transactions').select('*').eq('userId', user.id).order('date', {ascending: false});
       if (txs) {
           if (tab === 'gmail_request') {
               setHistory(txs.filter((t: any) => t.category === 'gmail_request'));
           } else {
               setHistory(txs.filter((t: any) => t.category === 'sell' && t.details?.toLowerCase().includes(tab)));
           }
       }
  };

  useEffect(() => {
     refreshHistory();
  }, [user.id, tab, subTab]);

  const rates: any = settings.socialRates || { gmail: 10, facebook: 5, instagram: 5, tiktok: 5 };

  const handleSellSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      let detailsString = "";
      if (tab === 'facebook') {
          detailsString = `FB|${form.email}|${form.password}|${form.code2fa}|${form.uid}`;
      } else if (tab === 'gmail') {
          detailsString = `Gmail|${form.email}|${form.password}`;
      } else if (tab === 'instagram') {
          detailsString = `Insta|${form.username}|${form.password}|${form.code2fa}|${form.uid}`;
      } else if (tab === 'tiktok') {
          detailsString = `TikTok|${form.username}|${form.password}|${form.code2fa}|${form.uid}`;
      }

      await saveTransaction(user.id, {
         type: 'earning',
         category: 'sell',
         amount: rates[tab] || 5, 
         status: 'pending',
         date: new Date().toISOString(),
         details: detailsString
      });
      showPopup('success', 'অ্যাকাউন্ট ডিটেইলস জমা হয়েছে! রিভিউ এর জন্য অপেক্ষা করুন।');
      setForm({ email: '', password: '', code2fa: '', uid: '', username: '', recovery: '' });
      refreshHistory();
  };

  const handleGmailRequest = async () => {
      await saveTransaction(user.id, {
         type: 'earning',
         category: 'gmail_request',
         amount: rates['gmail'] || 10, 
         status: 'pending_creds', 
         date: new Date().toISOString(),
         details: JSON.stringify({ stage: 'requested' })
      });
      showPopup('success', 'রিকুয়েস্ট পাঠানো হয়েছে! অ্যাডমিন ক্রেডেনশিয়াল দিলে আপনি নোটিফিকেশন পাবেন।');
      refreshHistory();
  };

  const updateGmailRequest = async (trx: any, newData: any, newStatus: any, msg: string) => {
    const prevDetails = JSON.parse(trx.details || '{}');
    const newDetails = JSON.stringify({ ...prevDetails, ...newData });
    await supabase.from('transactions').update({ details: newDetails, status: newStatus }).eq('id', trx.id);
    refreshHistory();
    showPopup('success', msg);
  };

  const renderGmailRequestCard = (trx: Transaction) => {
    const data = JSON.parse(trx.details || '{}');
    return (
        <div key={trx.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-3">
            <div className="flex justify-between mb-2">
                 <span className="font-bold text-sm text-indigo-700">Gmail Request #{trx.id.slice(-4)}</span>
                 <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold uppercase">{trx.status.replace('_', ' ')}</span>
            </div>
            {trx.status === 'pending_creds' && <p className="text-xs text-gray-500">অ্যাডমিন ক্রেডেনশিয়াল পাঠানোর জন্য অপেক্ষা করুন...</p>}
            {trx.status === 'working' && (
                <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded text-xs border">
                        <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
                        <p><strong>Email:</strong> {data.adminEmail}</p>
                        <p><strong>Pass:</strong> {data.adminPass}</p>
                    </div>
                    <p className="text-xs text-red-500">নির্দেশনা: উপরের তথ্য দিয়ে জিমেইল খুলুন। তারপর নিচে ক্লিক করুন।</p>
                    <button onClick={() => updateGmailRequest(trx, {}, 'pending_recovery', 'অ্যাডমিনকে রিকভারি ইমেইল দিতে বলা হয়েছে।')} className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold">Submit Recovery Request</button>
                </div>
            )}
            {trx.status === 'pending_recovery' && <p className="text-xs text-gray-500">অ্যাডমিন রিকভারি ইমেইল পাঠানোর জন্য অপেক্ষা করুন...</p>}
            {trx.status === 'finalizing' && (
                <div className="space-y-3">
                     <div className="bg-green-50 p-3 rounded text-xs border border-green-200">
                        <p><strong>Recovery Email:</strong> {data.adminRecovery}</p>
                     </div>
                     <p className="text-xs text-red-500">নির্দেশনা: এই রিকভারি ইমেইলটি সেট করুন এবং কাজ শেষ করুন।</p>
                     <button onClick={() => updateGmailRequest(trx, {}, 'review', 'কাজ জমা দেওয়া হয়েছে! রিভিউ এর পর টাকা পাবেন।')} className="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">Task Completed</button>
                </div>
            )}
            {trx.status === 'review' && <p className="text-xs text-emerald-600 font-bold">কাজ জমা হয়েছে! পেমেন্ট এর জন্য অপেক্ষা করুন।</p>}
            {trx.status === 'approved' && <p className="text-xs text-emerald-600 font-bold">পেমেন্ট সম্পন্ন হয়েছে! ৳{trx.amount}</p>}
        </div>
    )
  };

  const renderSellHistoryItem = (h: Transaction) => {
    let parts = h.details?.split('|') || [];
    let display = { email: '', pass: '', extra: '' };
    if (parts.length < 2) {
        return (
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-2">
                 <p className="text-xs text-gray-800 break-all">{h.details}</p>
                 <div className="flex justify-between mt-2">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${h.status==='approved'?'bg-green-100 text-green-700':h.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{h.status}</span>
                     <span className="text-xs font-bold text-emerald-600">৳{h.amount}</span>
                 </div>
            </div>
        );
    }
    const type = parts[0];
    if (type === 'Gmail') { display.email = parts[1]; display.pass = parts[2]; }
    else { display.email = parts[1]; display.pass = parts[2]; display.extra = parts.slice(3).join(', '); }

    return (
        <div key={h.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-3">
            <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 rounded">{type}</span>
                    <p className="text-sm font-bold text-gray-800 break-all">{display.email}</p>
                </div>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 p-1 rounded px-2">Pass: {display.pass}</p>
                {display.extra && <p className="text-[10px] text-gray-400 break-all">Info: {display.extra}</p>}
            </div>
            <div className="flex justify-between items-center border-t pt-2 border-gray-100">
                <div className="text-left">
                     <span className="text-xs text-gray-400 block">Rate</span>
                     <span className="text-sm font-bold text-emerald-600">৳ {h.amount}</span>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${h.status==='approved'?'bg-green-100 text-green-700':h.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>
                    {h.status}
                </span>
            </div>
        </div>
    );
  };

  const renderForm = () => {
    if (tab === 'facebook') return (<><input required type="text" placeholder="Facebook Email / Number" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={FORM_INPUT_STYLE}/><input required type="text" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={FORM_INPUT_STYLE}/><input required type="text" placeholder="2FA Code" value={form.code2fa} onChange={e => setForm({...form, code2fa: e.target.value})} className={FORM_INPUT_STYLE}/><input required type="text" placeholder="UID (User ID)" value={form.uid} onChange={e => setForm({...form, uid: e.target.value})} className={FORM_INPUT_STYLE}/></>);
    if (tab === 'gmail') return (<><input required type="email" placeholder="Gmail Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={FORM_INPUT_STYLE}/><input required type="text" placeholder="Gmail Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={FORM_INPUT_STYLE}/></>);
    if (tab === 'instagram' || tab === 'tiktok') return (<><input required type="text" placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={FORM_INPUT_STYLE}/><input required type="text" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={FORM_INPUT_STYLE}/><input type="text" placeholder="2FA Code" value={form.code2fa} onChange={e => setForm({...form, code2fa: e.target.value})} className={FORM_INPUT_STYLE}/><input type="text" placeholder="User ID" value={form.uid} onChange={e => setForm({...form, uid: e.target.value})} className={FORM_INPUT_STYLE}/></>);
  };

  return (
    <div className={PAGE_CONTAINER_STYLE}>
      <Header title="অ্যাকাউন্ট মার্কেট" onBack={onBack} />
      <div className="px-4 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
         {['gmail_request', 'gmail', 'facebook', 'instagram', 'tiktok'].map(t => (
            <button key={t} onClick={() => { setTab(t); setForm({email:'', password:'', code2fa:'', uid:'', username:'', recovery:''}); }} className={`px-5 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap shadow-sm transition ${tab === t ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
               {t.replace('_', ' ')}
            </button>
         ))}
      </div>
      <div className="px-4">
         {user.accountType === 'free' && tab !== 'gmail_request' ? (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center mt-4">
                 <Lock className="mx-auto text-amber-500 mb-3" size={40}/>
                 <h3 className="font-bold text-gray-800">প্রিমিয়াম প্রয়োজন</h3>
                 <p className="text-xs text-gray-500 mb-4">এই ক্যাটাগরিতে কাজ করতে আপনার অ্যাকাউন্ট প্রিমিয়াম হতে হবে। শুধুমাত্র "Gmail Request" ফ্রি ইউজারদের জন্য উন্মুক্ত।</p>
                 <button onClick={onGoPremium} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg text-xs font-bold shadow hover:scale-105 transition">প্রিমিয়াম নিন</button>
             </div>
         ) : tab === 'gmail_request' ? (
             <div className="animate-in fade-in">
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 mb-4">
                     <h3 className="font-bold text-gray-800 mb-2">Request Gmail Work</h3>
                     <p className="text-xs text-gray-500 mb-4">{settings.socialDesc?.gmail || 'Admin will provide details. You create account.'}</p>
                     <button onClick={handleGmailRequest} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg">Request New Gmail Task</button>
                 </div>
                 <h3 className="font-bold text-gray-700 text-sm mb-3">Active Requests</h3>
                 {history.length > 0 ? history.map(renderGmailRequestCard) : <p className="text-center text-gray-400">No active requests.</p>}
             </div>
         ) : (
             <>
                 <div className="flex bg-white rounded-xl p-1.5 border border-gray-100 mb-6 shadow-sm">
                    <button onClick={() => setSubTab('submit')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${subTab === 'submit' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>অ্যাকাউন্ট জমা</button>
                    <button onClick={() => setSubTab('history')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${subTab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>হিস্টোরি</button>
                 </div>
                 {subTab === 'submit' ? (
                     <form onSubmit={handleSellSubmit} className="bg-white p-5 rounded-xl shadow-sm space-y-4 border border-gray-100 animate-in fade-in">
                        <div className="flex justify-between items-center mb-2">
                           <h3 className="font-bold text-gray-800 capitalize">{tab} Sell Form</h3>
                           <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">Rate: ৳{rates[tab]}</span>
                        </div>
                        <p className="text-xs text-gray-500">{settings.socialDesc?.[tab]}</p>
                        {renderForm()}
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">জমা দিন ({tab})</button>
                     </form>
                 ) : (
                     <div className="space-y-3 animate-in fade-in">
                        {history.length > 0 ? history.map(renderSellHistoryItem) : <p className="text-center text-gray-400 py-10">কোনো হিস্টোরি নেই।</p>}
                     </div>
                 )}
             </>
         )}
      </div>
    </div>
  );
};

// --- 3. Typing Job ---
const TypingJobPage = ({ user, onBack, updateUser, showPopup, onGoPremium }: any) => {
  const [tab, setTab] = useState('referral'); 
  const [view, setView] = useState('list'); 
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adTimer, setAdTimer] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
      const fetchData = async () => {
          const { data: allJobs } = await supabase.from('typing_jobs').select('*');
          const { data: transactions } = await supabase.from('transactions').select('*').eq('userId', user.id).eq('category', 'typing');
          
          if (allJobs && transactions) {
              const completedJobIds = transactions
                .filter((t: any) => t.details?.startsWith('Typing ID:'))
                .map((t: any) => t.details?.split(':')[1]?.trim());

              setJobs(allJobs.filter((j: any) => 
                  !completedJobIds.includes(String(j.id)) && 
                  (tab === 'referral' ? j.category === 'referral' : j.category !== 'referral')
              ));
          }
      };
      fetchData();
  }, [user.id, tab]);

  const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim().toLowerCase();

  const handleWorkSubmit = () => {
    if (!selectedJob) return;
    if (normalizeText(typedText) !== normalizeText(selectedJob.text)) {
        showPopup('warning', "সতর্কতা: আপনার লেখা ভুল হয়েছে! দয়া করে ঠিকভাবে লিখুন।");
        return;
    }
    if (tab === 'referral' && (user.referralJobQuota || 0) <= 0) {
        showPopup('error', "আপনার রেফারেল জব কোটা শেষ!");
        return;
    }
    const linkToOpen = selectedJob.link && selectedJob.link.startsWith('http') ? selectedJob.link : 'https://google.com';
    window.open(linkToOpen, '_blank');
    setIsAdLoading(true);
    setAdTimer(selectedJob.waitTime || 10);
  };

  useEffect(() => {
    let interval: any;
    if (isAdLoading && adTimer > 0) {
        interval = setInterval(() => { setAdTimer((prev) => prev - 1); }, 1000);
    } else if (isAdLoading && adTimer === 0) {
        setIsAdLoading(false);
        const completeJob = async () => {
            if(selectedJob) {
                 await saveTransaction(user.id, {
                    type: 'earning',
                    category: 'typing',
                    amount: selectedJob.reward,
                    status: 'approved',
                    date: new Date().toISOString(),
                    details: `Typing ID: ${selectedJob.id}` 
                });
                
                if (tab === 'referral') {
                    await supabase.from('users')
                        .update({ referralJobQuota: Math.max(0, (user.referralJobQuota || 0) - 1) })
                        .eq('id', user.id);
                    if(updateUser) updateUser({ ...user, referralJobQuota: Math.max(0, (user.referralJobQuota || 0) - 1) });
                }
                // Balance update handled via direct Supabase call in helper, but updating local state for UI responsiveness
                await supabase.rpc('increment_balance', { user_id: user.id, amount: selectedJob.reward, field: 'balanceFree' });
                if(updateUser) updateUser({ ...user, balanceFree: user.balanceFree + selectedJob.reward });

                showPopup('success', `অভিনন্দন! ৳${selectedJob.reward} আপনার ব্যালেন্সে যোগ হয়েছে।`);
                setView('list');
                setTypedText('');
                setSelectedJob(null);
            }
        };
        completeJob();
    }
    return () => clearInterval(interval);
  }, [isAdLoading, adTimer, user.id, selectedJob]);

  if (view === 'work' && selectedJob) {
      return (
        <div className={PAGE_CONTAINER_STYLE}>
            <Header title="টাইপিং কাজ" onBack={() => { setView('list'); }} />
            <div className="p-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800">দেখে দেখে লিখুন</h3>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded font-bold">আয় ৳{selectedJob.reward}</span>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-4 font-serif leading-relaxed border border-gray-200 select-none" style={{ userSelect: 'none' }} onCopy={(e) => e.preventDefault()}>
                      {selectedJob.text}
                   </div>
                   <textarea value={typedText} onChange={(e) => setTypedText(e.target.value)} className={`${FORM_INPUT_STYLE} h-40`} rows={6} placeholder="উপরের লেখাটি হুবহু এখানে লিখুন..." onPaste={(e) => { e.preventDefault(); showPopup('error', "কপি পেস্ট করা যাবে না!"); }} onCopy={(e) => e.preventDefault()}></textarea>
                   <button onClick={handleWorkSubmit} disabled={isAdLoading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition mt-4 flex justify-center items-center gap-2">
                      {isAdLoading ? (<><Loader2 className="animate-spin" size={20}/> অ্যাড দেখা হচ্ছে ({adTimer}s)...</>) : 'সাবমিট ও রিওয়ার্ড ক্লেইম'}
                   </button>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className={PAGE_CONTAINER_STYLE}>
      <Header title="টাইপিং জব" onBack={onBack} />
      <div className="p-4 flex gap-2">
         <button onClick={() => { setView('list'); setTab('referral'); }} className={`flex-1 py-3 rounded-xl font-bold text-xs shadow-sm ${tab === 'referral' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}>Referral Typing ({user.referralJobQuota || 0})</button>
         <button onClick={() => { setView('list'); setTab('premium'); }} className={`flex-1 py-3 rounded-xl font-bold text-xs shadow-sm ${tab === 'premium' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600'}`}>Premium Typing</button>
      </div>
      <div className="px-4 space-y-3">
         {tab === 'referral' && (user.referralJobQuota || 0) === 0 && <div className="bg-red-50 p-4 rounded-xl text-center text-red-500 text-xs border border-red-100">আপনার রেফারেল কোটা শেষ। আরও জব পেতে রেফার করুন।</div>}
         {tab === 'premium' && user.accountType !== 'premium' && 
            <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-200">
                 <p className="text-amber-800 text-xs font-bold mb-2">এই কাজগুলো শুধুমাত্র প্রিমিয়াম ইউজারদের জন্য।</p>
                 <button onClick={onGoPremium} className="bg-amber-500 text-white px-4 py-1 rounded text-xs">প্রিমিয়াম করুন</button>
            </div>
         }
         {jobs.length > 0 ? jobs.map((job: any) => (
             <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                 <div className="flex-1 mr-2 overflow-hidden">
                     <p className="font-bold text-gray-800 truncate">{job.text.substring(0, 30)}...</p>
                     <p className="text-xs text-gray-500">রিওয়ার্ড: ৳{job.reward} • সময়: {job.waitTime}s</p>
                 </div>
                 <button disabled={ (tab === 'referral' && (user.referralJobQuota || 0) <= 0) || (tab === 'premium' && user.accountType !== 'premium') } onClick={() => { setSelectedJob(job); setView('work'); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed">কাজ শুরু</button>
             </div>
         )) : (
             <div className="text-center py-10"><Keyboard size={48} className="mx-auto text-gray-300 mb-2"/><p className="text-gray-400">বর্তমানে কোনো কাজ নেই।</p></div>
         )}
      </div>
    </div>
  );
};

// --- 4. Quiz Page ---
const QuizPage = ({ user, onBack, showPopup, updateUser }: any) => {
   const [view, setView] = useState('packages'); 
   const [activePkgDetails, setActivePkgDetails] = useState<any>(null);
   const [questions, setQuestions] = useState<any[]>([]);
   const [packages, setPackages] = useState<any[]>([]);
   const [stats, setStats] = useState({ answered: 0, earnings: 0, daysLeft: 0, hoursLeft: 0, isExpired: false });

   const [currentIndex, setCurrentIndex] = useState(0);
   const [ans, setAns] = useState('');
   const [isAdLoading, setIsAdLoading] = useState(false);
   const [adTimer, setAdTimer] = useState(0);

   useEffect(() => {
       const loadData = async () => {
           const { data: pkgs } = await supabase.from('quiz_packages').select('*');
           const { data: allQ } = await supabase.from('quiz_list').select('*');
           const { data: trxs } = await supabase.from('transactions').select('*').eq('userId', user.id);
           
           if(pkgs && trxs) {
               setPackages(pkgs);
               // Find active package
               const pkgPurchase = trxs.find((t:any) => t.category === 'quiz_package');
               if (pkgPurchase) {
                   const pkgInfo = pkgs.find((p: any) => pkgPurchase.details?.includes(p.name));
                   if (pkgInfo) {
                       const purchaseDate = new Date(pkgPurchase.date);
                       const expiryDate = new Date(purchaseDate);
                       expiryDate.setDate(purchaseDate.getDate() + parseInt(pkgInfo.duration));
                       const now = new Date();
                       
                       let days = 0, hours = 0, expired = false;
                       if (now < expiryDate) {
                           const diffMs = expiryDate.getTime() - now.getTime();
                           days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                           hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                           setActivePkgDetails(pkgInfo);
                       } else {
                           expired = true;
                       }

                       // Calculate Stats
                       const answeredIds = trxs.filter((t:any) => t.category === 'quiz' && t.details?.startsWith('Quiz ID:')).map((t:any) => t.details?.split(':')[1]?.trim());
                       const earnings = trxs.filter((t:any) => t.category === 'quiz').reduce((acc:number, curr:any) => acc + curr.amount, 0);
                       const answeredCount = answeredIds.length;
                       const validQuestions = allQ ? allQ.filter((q: any) => q.packageId === pkgInfo.id && !answeredIds.includes(String(q.id))) : [];
                       
                       setStats({ answered: answeredCount, earnings, daysLeft: days, hoursLeft: hours, isExpired: expired });
                       setQuestions(validQuestions);
                   }
               }
           }
       };
       loadData();
   }, [user.id, view]);

   const handleBuyPackage = async (pkg: any) => {
      if (activePkgDetails) return showPopup('warning', "আপনার ইতিমধ্যে একটি প্যাকেজ চালু আছে!");
      if (user.balancePremium >= pkg.price) {
          await supabase.from('users').update({ balancePremium: user.balancePremium - pkg.price }).eq('id', user.id);
          if(updateUser) updateUser({ ...user, balancePremium: user.balancePremium - pkg.price });
          
          await saveTransaction(user.id, {
              type: 'purchase',
              category: 'quiz_package',
              amount: pkg.price,
              status: 'approved',
              date: new Date().toISOString(),
              details: `Active Package: ${pkg.name}`
          });
          showPopup('success', "প্যাকেজ কেনা সফল হয়েছে! এটি এখন 'Active' ট্যাবে আছে।");
          setView('my_plan');
      } else {
          showPopup('error', "পর্যাপ্ত ডিপোজিট ব্যালেন্স নেই!");
      }
   };

   const handleQuizSubmit = () => {
       const currentQ = questions[currentIndex % questions.length];
       if (!currentQ) return;
       if (ans.trim().toLowerCase() !== currentQ.ans.trim().toLowerCase()) {
           showPopup('error', "ভুল উত্তর!"); return;
       }
       const adLink = currentQ.adLink && currentQ.adLink.startsWith('http') ? currentQ.adLink : 'https://google.com';
       window.open(adLink, '_blank');
       setIsAdLoading(true);
       setAdTimer(currentQ.wait || 5);
   };

   useEffect(() => {
    let interval: any;
    if (isAdLoading && adTimer > 0) {
        interval = setInterval(() => { setAdTimer((prev) => prev - 1); }, 1000);
    } else if (isAdLoading && adTimer === 0) {
        setIsAdLoading(false);
        const complete = async () => {
            const currentQ = questions[currentIndex % questions.length];
            if(currentQ) {
                await saveTransaction(user.id, {
                   type: 'earning',
                   category: 'quiz',
                   amount: currentQ.reward,
                   status: 'approved',
                   date: new Date().toISOString(),
                   details: `Quiz ID: ${currentQ.id}`
                });
                await supabase.rpc('increment_balance', { user_id: user.id, amount: currentQ.reward, field: 'balanceFree' });
                if(updateUser) updateUser({ ...user, balanceFree: user.balanceFree + currentQ.reward });
                
                setAns(''); setCurrentIndex(0); 
                showPopup('success', `সঠিক উত্তর! ৳${currentQ.reward} যোগ হয়েছে।`);
                // Refresh list
                setView('my_plan');
            }
        };
        complete();
    }
    return () => clearInterval(interval);
   }, [isAdLoading, adTimer]);

   return (
      <div className={PAGE_CONTAINER_STYLE}>
         <Header title="কুইজ প্ল্যান" onBack={onBack} />
         <div className="p-4 flex gap-2 overflow-x-auto">
             <button onClick={() => setView('packages')} className={`flex-1 py-3 rounded-xl font-bold text-xs border transition ${view === 'packages' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600'}`}>প্যাকেজ কিনুন</button>
             <button onClick={() => setView('my_plan')} className={`flex-1 py-3 rounded-xl font-bold text-xs border transition ${view === 'my_plan' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600'}`}>Active / Analytics</button>
         </div>
         <div className="px-4 pb-6">
            {view === 'packages' && (
                <div className="space-y-4">
                    {packages.filter((p: any) => !activePkgDetails || p.id !== activePkgDetails.id).map((pkg: any) => (
                        <div key={pkg.id} className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 relative overflow-hidden">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h3 className="font-bold text-lg text-gray-800">{pkg.name}</h3>
                                     <p className="text-xs text-gray-500">মেয়াদ: {pkg.duration} দিন</p>
                                 </div>
                                 <h2 className="text-2xl font-bold text-indigo-600">৳{pkg.price}</h2>
                             </div>
                             <p className="text-xs text-gray-600 mt-2">{pkg.desc}</p>
                             <div className="mt-4 flex gap-4 text-sm text-gray-600">
                                 <span className="flex items-center gap-1"><CheckSquare size={14}/> {pkg.dailyLimit} কুইজ/দিন</span>
                                 <span className="flex items-center gap-1"><Zap size={14}/> Profit: ৳{pkg.profit}</span>
                             </div>
                             <button onClick={() => handleBuyPackage(pkg)} className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-bold shadow-md hover:scale-105 transition">
                                 প্যাকেজটি কিনুন
                             </button>
                        </div>
                    ))}
                    {packages.length === 0 && <p className="text-center text-gray-400 mt-10">আর কোনো প্যাকেজ নেই।</p>}
                </div>
            )}
            {view === 'my_plan' && (
                <div className="space-y-4">
                    {activePkgDetails ? (
                        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100 text-center">
                            <div className="flex justify-between items-start mb-6 border-b pb-4">
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-gray-800">{activePkgDetails.name}</h3>
                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Total Profit</p>
                                    <p className="text-lg font-bold text-emerald-600">৳{stats.earnings.toFixed(2)}</p>
                                </div>
                            </div>
                            <h4 className="text-left font-bold text-gray-700 mb-2 flex items-center gap-2"><Briefcase size={16}/> কুইজ অ্যানালিটিক্স</h4>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                                    <p className="text-2xl font-bold text-gray-800">{questions.length}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Remaining Tasks</p>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                                    <p className="text-2xl font-bold text-emerald-600">{stats.answered}</p>
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase">Completed</p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                                    <p className="text-lg font-bold text-blue-600 flex items-center justify-center gap-1"><Calendar size={16}/> {stats.daysLeft}D</p>
                                    <p className="text-[10px] font-bold text-blue-700 uppercase">Days Left</p>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-center">
                                    <p className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1"><Clock size={16}/> {stats.hoursLeft}H</p>
                                    <p className="text-[10px] font-bold text-orange-700 uppercase">Hours Left</p>
                                </div>
                            </div>
                            <button onClick={() => setView('start_quiz')} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg animate-pulse flex items-center justify-center gap-2">
                                <PlayCircle size={20}/> কুইজ শুরু করুন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white p-10 rounded-xl text-center shadow-sm">
                            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-2"/>
                            <p className="text-gray-500">আপনার কোনো সক্রিয় প্যাকেজ নেই।</p>
                            {stats.isExpired && <p className="text-xs text-red-400 mt-2">আপনার আগের প্যাকেজটির মেয়াদ শেষ হয়ে গেছে।</p>}
                            <button onClick={() => setView('packages')} className="mt-4 text-purple-600 font-bold underline">নতুন প্যাকেজ কিনুন</button>
                        </div>
                    )}
                </div>
            )}
            {view === 'start_quiz' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 text-center relative overflow-hidden">
                    {questions.length > 0 ? (
                        <>
                            <Brain className="mx-auto text-emerald-500 mb-6" size={48} />
                            <h2 className="text-gray-500 font-medium mb-4 uppercase tracking-widest text-xs">উত্তর দিন</h2>
                            <div className="text-2xl font-extrabold text-gray-800 mb-8 font-mono bg-gray-50 p-4 rounded-lg">
                                {questions[currentIndex % questions.length]?.question}
                            </div>
                            <input type="text" value={ans} onChange={e => setAns(e.target.value)} placeholder="উত্তর লিখুন..." className="w-full border-2 border-emerald-100 p-4 rounded-xl text-center text-xl font-bold text-gray-900 focus:border-emerald-500 outline-none mb-4 bg-white"/>
                            <button onClick={handleQuizSubmit} disabled={isAdLoading} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {isAdLoading ? `অপেক্ষা করুন (${adTimer}s)...` : 'সাবমিট করুন'}
                            </button>
                            <p className="text-xs text-gray-400 mt-4">রিওয়ার্ড: ৳{questions[currentIndex % questions.length]?.reward}</p>
                        </>
                    ) : (
                        <p className="text-gray-400 py-10">আজকের কুইজ শেষ বা প্যাকেজ কমপ্লিট।</p>
                    )}
                </div>
            )}
         </div>
      </div>
   )
};

// --- 5. Premium Page ---
const PremiumPage = ({ user, onBack, showPopup }: any) => {
    const [settings, setSettings] = useState<any>({});
    const [method, setMethod] = useState('Bkash');
    const [trxId, setTrxId] = useState('');
    const [sender, setSender] = useState('');

    useEffect(() => { getSettings().then(setSettings); }, []);

    const handlePremiumRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveTransaction(user.id, {
            type: 'purchase',
            category: 'main',
            amount: settings.premiumCost,
            status: 'pending',
            date: new Date().toISOString(),
            details: 'Premium Account Request',
            method, senderNumber: sender, trxId
        });
        showPopup('success', 'রিকুয়েস্ট জমা হয়েছে! অ্যাডমিন এপ্রুভ করলে অ্যাকাউন্ট প্রিমিয়াম হবে।');
        onBack();
    };
    
    const paymentNumber = method === 'Bkash' ? (settings.premiumBkash || settings.bkash) : (settings.premiumNagad || settings.nagad);

    return (
        <div className={PAGE_CONTAINER_STYLE}>
            <Header title="একাউন্ট প্রিমিয়াম করুন" onBack={onBack}/>
            <div className="p-4 space-y-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-2xl text-white shadow-lg text-center relative overflow-hidden">
                    <Crown size={48} className="mx-auto mb-2 text-white/90" />
                    <h2 className="text-2xl font-bold mb-1">প্রিমিয়াম মেম্বারশিপ</h2>
                    <p className="text-white/80 text-sm">আনলিমিটেড কাজ এবং রেফার ইনকাম</p>
                    <div className="mt-4 bg-white/20 p-2 rounded-lg backdrop-blur-sm inline-block px-6">
                        <span className="text-2xl font-extrabold">৳ {settings.premiumCost}</span>
                    </div>
                </div>
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                    <p className="text-red-600 font-bold text-sm">⚠️ মোবাইল রিচার্জ গ্রহণযোগ্য না। শুধুমাত্র "Send Money" (Personal) করতে হবে।</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-xs mb-2">টাকা পাঠানোর নাম্বার</p>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-2xl font-mono font-bold text-black">{paymentNumber}</span>
                        <button onClick={() => navigator.clipboard.writeText(paymentNumber)} className="bg-gray-200 p-2 rounded hover:bg-gray-300 text-gray-800"><Copy size={16}/></button>
                    </div>
                </div>
                <form onSubmit={handlePremiumRequest} className="bg-white p-5 rounded-xl shadow-sm space-y-4">
                     <div><label className="text-xs font-bold text-gray-600 mb-1 block">পেমেন্ট মেথড</label><select value={method} onChange={e => setMethod(e.target.value)} className={FORM_INPUT_STYLE}><option value="Bkash">Bkash</option><option value="Nagad">Nagad</option></select></div>
                     <div><label className="text-xs font-bold text-gray-600 mb-1 block">সেন্ডার নাম্বার</label><input required type="text" value={sender} onChange={e => setSender(e.target.value)} className={FORM_INPUT_STYLE}/></div>
                     <div><label className="text-xs font-bold text-gray-600 mb-1 block">TrxID</label><input required type="text" value={trxId} onChange={e => setTrxId(e.target.value)} className={FORM_INPUT_STYLE}/></div>
                     <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl font-bold shadow-lg mt-2">সাবমিট করুন</button>
                </form>
            </div>
        </div>
    );
};

// --- 6. Wallet Page ---
const WalletPage = ({ user, onBack, initialView = 'main', showPopup, onGoPremium, onUpdateUser }: any) => {
   const [view, setView] = useState(initialView);
   const [amount, setAmount] = useState('');
   const [method, setMethod] = useState('Bkash');
   const [number, setNumber] = useState('');
   const [sourceWallet, setSourceWallet] = useState('task');
   const [trxId, setTrxId] = useState('');
   const [settings, setSettings] = useState<any>({});
   const [trxs, setTrxs] = useState<any[]>([]);

   useEffect(() => { 
       getSettings().then(setSettings); 
       const loadTrxs = async () => {
           const { data } = await supabase.from('transactions').select('*').eq('userId', user.id).order('date', {ascending: false});
           if(data) setTrxs(data);
       };
       loadTrxs();
   }, [user.id, view]); // Reload when view changes (e.g. after transfer)

   const getBalance = (cat: string) => {
       const earnings = trxs.filter(t => t.category === cat && t.type === 'earning' && t.status === 'approved').reduce((acc, c) => acc + c.amount, 0);
       const transfersOut = trxs.filter(t => t.type === 'transfer' && t.sourceWallet === cat && t.status === 'approved').reduce((acc, c) => acc + c.amount, 0);
       return Math.max(0, earnings - transfersOut);
   };
   
   const taskBal = getBalance('task');
   const typingBal = getBalance('typing');
   const quizBal = getBalance('quiz');
   const sellBal = getBalance('sell');
   const salaryBal = getBalance('salary');

   const handleTransfer = async (e: React.FormEvent) => {
      e.preventDefault();
      const transferAmount = parseFloat(amount);
      if (transferAmount < 50) return showPopup('warning', "সর্বনিম্ন ট্রান্সফার অ্যামাউন্ট ৫০ টাকা।");
      let available = 0;
      if (sourceWallet === 'task') available = taskBal;
      if (sourceWallet === 'typing') available = typingBal;
      if (sourceWallet === 'quiz') available = quizBal;
      if (sourceWallet === 'sell') available = sellBal;
      if (sourceWallet === 'salary') available = salaryBal;
      if (transferAmount > available) return showPopup('error', "সিলেক্ট করা ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!");

      await saveTransaction(user.id, {
         type: 'transfer',
         category: 'main',
         sourceWallet: sourceWallet,
         amount: transferAmount,
         status: 'approved',
         date: new Date().toISOString(),
         details: `Transfer from ${sourceWallet}`
      });
      // Update Main Balance
      await supabase.rpc('increment_balance', { user_id: user.id, amount: transferAmount, field: 'balanceFree' });
      if(onUpdateUser) onUpdateUser({ ...user, balanceFree: user.balanceFree + transferAmount });

      showPopup('success', "ট্রান্সফার সফল হয়েছে! মেইন ব্যালেন্সে টাকা যোগ হয়েছে।");
      setView('main');
   };

   const handleDeposit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!amount || !number || !trxId) return showPopup('error', "দয়া করে সব তথ্য সঠিকভাবে দিন।");
      await saveTransaction(user.id, {
         type: 'deposit',
         category: 'main',
         amount: parseFloat(amount),
         status: 'pending',
         date: new Date().toISOString(),
         details: 'Add Balance Request',
         method, senderNumber: number, trxId
      });
      showPopup('success', "ডিপোজিট রিকুয়েস্ট পাঠানো হয়েছে! অ্যাডমিন অ্যাপ্রুভ করবে।");
      setView('main');
   };

   const handleWithdraw = async (e: React.FormEvent) => {
      e.preventDefault();
      const amt = parseFloat(amount);
      
      if (user.accountType === 'free') {
          const pastWithdrawals = trxs.filter(t => t.type === 'withdraw' && t.status !== 'rejected');
          if (pastWithdrawals.length >= 1) return showPopup('warning', "ফ্রি ইউজাররা মাত্র একবার উত্তোলন করতে পারবেন।");
          if (amt > 20) return showPopup('warning', "ফ্রি ইউজাররা সর্বোচ্চ ২০ টাকা উত্তোলন করতে পারবেন।");
      } else {
          if (amt < settings.minWithdraw) return showPopup('warning', `সর্বনিম্ন উত্তোলন ৳${settings.minWithdraw}`);
      }

      if (amt > user.balanceFree) return showPopup('error', "পর্যাপ্ত ব্যালেন্স নেই!");
      await saveTransaction(user.id, {
         type: 'withdraw',
         category: 'main',
         amount: amt,
         status: 'pending',
         date: new Date().toISOString(),
         details: 'Withdraw Request',
         method, senderNumber: number
      });
      
      // Deduct balance
      await supabase.rpc('increment_balance', { user_id: user.id, amount: -amt, field: 'balanceFree' });
      if(onUpdateUser) onUpdateUser({ ...user, balanceFree: user.balanceFree - amt });

      showPopup('success', "উত্তোলন রিকুয়েস্ট সফল হয়েছে!");
      setView('main');
   };

   if (view === 'withdraw') {
      const withdraws = trxs.filter(t => t.type === 'withdraw');
      return (
         <div className={PAGE_CONTAINER_STYLE}>
            <Header title="টাকা উত্তোলন" onBack={() => setView('main')} />
            <div className="p-4">
               <div className="bg-emerald-600 text-white p-6 rounded-2xl mb-6 shadow-lg text-center">
                  <p className="text-emerald-100 text-sm">উত্তোলনযোগ্য ব্যালেন্স</p>
                  <h1 className="text-4xl font-bold mt-2">৳ {user.balanceFree.toFixed(2)}</h1>
               </div>
               {user.accountType === 'free' && (
                   <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4 text-xs text-amber-800">
                       <p className="font-bold mb-1">ফ্রি ইউজার রেস্ট্রিকশন:</p>
                       <ul className="list-disc ml-4"><li>সর্বোচ্চ উত্তোলন: ২০ টাকা</li><li>মাত্র ১ বার উত্তোলন করা যাবে</li></ul>
                       <button onClick={onGoPremium} className="mt-2 text-indigo-600 underline font-bold">লিমিট সরাতে প্রিমিয়াম করুন</button>
                   </div>
               )}
               <form onSubmit={handleWithdraw} className="bg-white p-4 rounded-xl shadow-sm space-y-4 mb-6">
                  <div><label className="text-xs font-bold text-gray-700">মাধ্যম</label><div className="grid grid-cols-2 gap-2 mt-1">{['Bkash', 'Nagad', 'Rocket', 'Upay'].map(m => (<button type="button" key={m} onClick={() => setMethod(m)} className={`py-2 border rounded-lg text-xs font-bold ${method === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-600'}`}>{m}</button>))}</div></div>
                  <input required type="number" placeholder={user.accountType === 'free' ? "টাকার পরিমাণ (ম্যাক্স ২০)" : `টাকার পরিমাণ (মিন ${settings.minWithdraw})`} value={amount} onChange={e => setAmount(e.target.value)} className={FORM_INPUT_STYLE}/>
                  <input required type="text" placeholder="রিসিভ নম্বর" value={number} onChange={e => setNumber(e.target.value)} className={FORM_INPUT_STYLE}/>
                  <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg">উত্তোলন নিশ্চিত করুন</button>
               </form>
               <h3 className="font-bold text-gray-700 mb-2">উত্তোলন হিস্টোরি</h3>
               <div className="space-y-2">{withdraws.length === 0 ? <p className="text-center text-gray-400 text-xs">কোনো রেকর্ড নেই।</p> : withdraws.map((t, i) => (<div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center"><div><p className="font-bold text-gray-800 text-sm">{t.method} - {t.senderNumber}</p><p className="text-[10px] text-gray-500">{new Date(t.date).toLocaleDateString()}</p></div><div className="text-right"><p className="font-bold text-rose-600">-৳{t.amount}</p><span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${t.status === 'approved' ? 'bg-green-100 text-green-700' : t.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span></div></div>))}</div>
            </div>
         </div>
      )
   }

   if (view === 'deposit') {
      return (
         <div className={PAGE_CONTAINER_STYLE}>
            <Header title="ব্যালেন্স অ্যাড" onBack={() => setView('main')} />
            <div className="p-4 space-y-4">
               <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
                  <h3 className="font-bold text-gray-800 mb-3">টাকা পাঠানোর নাম্বার:</h3>
                  <div className="space-y-2">
                     <div className="flex justify-between items-center bg-pink-50 p-3 rounded-lg border border-pink-100">
                        <div className="flex items-center gap-2"><span className="text-pink-600 font-bold">বিকাশ</span> <span className="font-bold text-black font-mono">{settings.bkash}</span></div>
                        <button onClick={() => navigator.clipboard.writeText(settings.bkash)} className="bg-white border px-2 py-1 rounded text-xs text-black font-bold">কপি</button>
                     </div>
                     <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-2"><span className="text-orange-600 font-bold">নগদ</span> <span className="font-bold text-black font-mono">{settings.nagad}</span></div>
                        <button onClick={() => navigator.clipboard.writeText(settings.nagad)} className="bg-white border px-2 py-1 rounded text-xs text-black font-bold">কপি</button>
                     </div>
                  </div>
               </div>
               <form onSubmit={handleDeposit} className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                  <select value={method} onChange={e => setMethod(e.target.value)} className={FORM_INPUT_STYLE}><option>Bkash</option><option>Nagad</option></select>
                  <input required type="number" placeholder="টাকার পরিমাণ (মিন ৫০)" value={amount} onChange={e => setAmount(e.target.value)} className={FORM_INPUT_STYLE}/>
                  <input required type="text" placeholder="যে নম্বর থেকে পাঠিয়েছেন" value={number} onChange={e => setNumber(e.target.value)} className={FORM_INPUT_STYLE}/>
                  <input required type="text" placeholder="Transaction ID" value={trxId} onChange={e => setTrxId(e.target.value)} className={FORM_INPUT_STYLE}/>
                  <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">রিকুয়েস্ট সাবমিট</button>
               </form>
            </div>
         </div>
      )
   }
   if (view === 'transfer') {
      return (
         <div className={PAGE_CONTAINER_STYLE}>
            <Header title="ব্যালেন্স ট্রান্সফার" onBack={() => setView('main')} />
            <div className="p-4">
               <form onSubmit={handleTransfer} className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                  <div>
                     <label className="text-xs font-bold text-gray-700">কোন ওয়ালেট থেকে?</label>
                     <select value={sourceWallet} onChange={e => setSourceWallet(e.target.value)} className={FORM_INPUT_STYLE}>
                        <option value="task">টাস্ক ওয়ালেট (৳{taskBal})</option>
                        <option value="typing">টাইপিং ওয়ালেট (৳{typingBal})</option>
                        <option value="sell">সেল ওয়ালেট (৳{sellBal})</option>
                        <option value="quiz">কুইজ ওয়ালেট (৳{quizBal})</option>
                        <option value="salary">স্যালারি ওয়ালেট (৳{salaryBal})</option>
                     </select>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                     নোট: সর্বনিম্ন ট্রান্সফার ৫০ টাকা। টাকা সরাসরি মেইন ব্যালেন্সে যোগ হবে।
                  </div>
                  <input required type="number" placeholder="টাকার পরিমাণ" value={amount} onChange={e => setAmount(e.target.value)} className={FORM_INPUT_STYLE}/>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">ট্রান্সফার করুন</button>
               </form>
            </div>
         </div>
      )
   }

   return (
      <div className={PAGE_CONTAINER_STYLE}>
         <Header title="আমার ওয়ালেট" onBack={onBack} />
         <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden">
                  <p className="text-emerald-100 text-xs font-medium">মেইন ব্যালেন্স</p>
                  <h2 className="text-2xl font-bold mt-1">৳ {user.balanceFree.toFixed(2)}</h2>
                  <div className="absolute -right-2 -bottom-2 opacity-20"><Wallet size={60}/></div>
               </div>
               <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden">
                  <p className="text-gray-400 text-xs font-medium">ডিপোজিট ব্যালেন্স</p>
                  <h2 className="text-2xl font-bold mt-1">৳ {user.balancePremium.toFixed(2)}</h2>
                  <div className="absolute -right-2 -bottom-2 opacity-20"><Crown size={60}/></div>
               </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setView('deposit')} className="flex-1 bg-emerald-100 text-emerald-700 py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 hover:bg-emerald-200 transition"><PlusCircle size={20}/> অ্যাড ব্যালেন্স</button>
               <button onClick={() => setView('withdraw')} className="flex-1 bg-rose-100 text-rose-700 py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 hover:bg-rose-200 transition"><Download size={20}/> উত্তোলন</button>
               <button onClick={() => setView('transfer')} className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 hover:bg-blue-200 transition"><RefreshCw size={20}/> ট্রান্সফার</button>
            </div>
            <div>
               <h3 className="font-bold text-gray-700 mb-2">আয়ের বিবরণ</h3>
               <div className="grid grid-cols-2 gap-2">
                  {[{ l: 'টাস্ক ইনকাম', b: taskBal, c: 'text-blue-600 bg-blue-50' }, { l: 'টাইপিং ইনকাম', b: typingBal, c: 'text-purple-600 bg-purple-50' }, { l: 'কুইজ ইনকাম', b: quizBal, c: 'text-orange-600 bg-orange-50' }, { l: 'সেল প্রফিট', b: sellBal, c: 'text-pink-600 bg-pink-50' }, { l: 'স্যালারি ইনকাম', b: salaryBal, c: 'text-emerald-600 bg-emerald-50' }].map((w, i) => (
                     <div key={i} className={`p-3 rounded-xl border border-gray-100 ${w.c}`}>
                        <p className="text-[10px] font-bold uppercase opacity-70">{w.l}</p>
                        <p className="text-lg font-bold">৳ {w.b.toFixed(2)}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

// --- 7. Team Page ---
const TeamPageImpl = ({ user, onBack }: any) => {
    const [level1, setLevel1] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchTeam = async () => {
            const { data } = await supabase.from('users').select('*').eq('uplineRefCode', user.refCode);
            if(data) setLevel1(data);
        };
        fetchTeam();
    }, [user.refCode]);

    const regLink = `${window.location.origin}?ref=${user.refCode}`;
    return (
       <div className={PAGE_CONTAINER_STYLE}>
          <Header title="আমার টিম" onBack={onBack} />
          <div className="p-4 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">আপনার রেফার কোড</p>
                  <div className="flex items-center justify-center gap-3 mt-2 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">
                      <span className="text-2xl font-mono font-bold text-emerald-600 tracking-widest">{user.refCode}</span>
                      <button onClick={() => navigator.clipboard.writeText(user.refCode)} className="text-gray-400 hover:text-emerald-600"><Copy size={20}/></button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                     <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">রেজিস্ট্রেশন লিংক</p>
                     <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg text-xs text-blue-800 break-all">
                         <span>{regLink}</span>
                         <button onClick={() => navigator.clipboard.writeText(regLink)} className="ml-auto bg-white p-1 rounded shadow"><Copy size={14}/></button>
                     </div>
                  </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <h3 className="font-bold text-gray-700 p-4 bg-gray-50 border-b">রেফার করা ইউজার ({level1.length})</h3>
                  <div className="max-h-96 overflow-y-auto">
                      {level1.length > 0 ? level1.map((u: UserData) => (
                          <div key={u.id} className="p-3 border-b last:border-0 flex items-center gap-3">
                              <img src={u.profileImage || "https://files.catbox.moe/oq7gs8.jpg"} className="w-10 h-10 rounded-full object-cover border"/>
                              <div className="flex-1">
                                  <p className="font-bold text-sm text-gray-800">{u.fullName}</p>
                                  <p className="text-xs text-gray-500">{u.phone}</p>
                              </div>
                              <div className="text-right">
                                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${u.accountType === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                      {u.accountType}
                                  </span>
                              </div>
                          </div>
                      )) : <p className="p-4 text-center text-gray-400 text-sm">কোনো মেম্বার নেই।</p>}
                  </div>
              </div>
          </div>
       </div>
    )
 };

 // --- 8. Salary Page ---
 const SalaryPage = ({ user, onBack }: any) => {
    const [plans, setPlans] = useState<any[]>([]);
    const [myReferrals, setMyReferrals] = useState(0);
    const [myPackages, setMyPackages] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const { data: p } = await supabase.from('salary_plans').select('*');
            if(p) setPlans(p);

            // Count premium referrals
            const { count: refCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('uplineRefCode', user.refCode).eq('accountType', 'premium');
            setMyReferrals(refCount || 0);

            // Count packages & fetch transactions for Claim logic
            const { data: trxs } = await supabase.from('transactions').select('*').eq('userId', user.id);
            if(trxs) {
                setTransactions(trxs);
                setMyPackages(trxs.filter((t:any) => t.category === 'quiz_package' || t.category === 'typing_package').length);
            }
        };
        loadData();
    }, [user.id, user.refCode]);
    
    const handleClaim = async (plan: any) => {
        const claimed = transactions.find(t => t.category === 'salary' && t.details === `Salary: ${plan.title}`);
        if(claimed) return alert('আপনি ইতিমধ্যে এই স্যালারি ক্লেইম করেছেন!');

        await saveTransaction(user.id, {
            type: 'earning',
            category: 'salary',
            amount: plan.reward,
            status: 'approved',
            date: new Date().toISOString(),
            details: `Salary: ${plan.title}`
        });
        
        await supabase.rpc('increment_balance', { user_id: user.id, amount: plan.reward, field: 'balanceFree' });
        
        alert(`অভিনন্দন! ৳${plan.reward} আপনার স্যালারি ওয়ালেটে যোগ হয়েছে।`);
    };

    return (
       <div className={PAGE_CONTAINER_STYLE}>
          <Header title="ফিক্সড স্যালারি" onBack={onBack} />
          <div className="p-4 space-y-4">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 rounded-2xl text-white shadow-lg text-center relative overflow-hidden">
                  <div className="relative z-10">
                      <h2 className="text-2xl font-bold">মাসিক স্যালারি</h2>
                      <p className="text-emerald-100 text-sm mt-1">আপনার টিম গঠন করুন এবং প্রতি মাসে ফিক্সড ইনকাম করুন।</p>
                  </div>
                  <Briefcase size={80} className="absolute -right-4 -bottom-4 text-emerald-700 opacity-50"/>
              </div>
              <div className="flex items-center gap-2 mb-2">
                  <Milestone className="text-emerald-600"/>
                  <h3 className="font-bold text-gray-800">স্যালারি রোডম্যাপ</h3>
              </div>
              {plans.length > 0 ? plans.map((plan: any, i: number) => {
                  const refProgress = Math.min(100, (myReferrals / plan.targetRefers) * 100);
                  const pkgProgress = Math.min(100, (myPackages / (plan.requiredPackages || 1)) * 100);
                  const isEligible = myReferrals >= plan.targetRefers && myPackages >= (plan.requiredPackages || 0);
                  const claimed = transactions.find(t => t.category === 'salary' && t.details === `Salary: ${plan.title}`);

                  return (
                      <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative">
                          <div className="flex justify-between items-start mb-3">
                              <div>
                                  <h3 className="font-bold text-gray-800 text-lg">{plan.title}</h3>
                                  <p className="text-xs text-gray-500">{plan.desc}</p>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-emerald-600 text-lg">৳{plan.reward}</p>
                                  <p className="text-[10px] text-gray-400">Monthly</p>
                              </div>
                          </div>
                          <div className="space-y-3 mb-4">
                              <div>
                                  <div className="flex justify-between text-xs mb-1">
                                      <span className="text-gray-600">Premium Referrals ({myReferrals}/{plan.targetRefers})</span>
                                      <span className="font-bold text-emerald-600">{Math.floor(refProgress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                      <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${refProgress}%` }}></div>
                                  </div>
                              </div>
                              <div>
                                  <div className="flex justify-between text-xs mb-1">
                                      <span className="text-gray-600">Packages ({myPackages}/{plan.requiredPackages || 0})</span>
                                      <span className="font-bold text-blue-600">{Math.floor(pkgProgress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pkgProgress}%` }}></div>
                                  </div>
                              </div>
                          </div>
                          {claimed ? (
                              <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-lg font-bold text-sm cursor-not-allowed">Claimed</button>
                          ) : isEligible ? (
                              <button onClick={() => handleClaim(plan)} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm shadow-md hover:bg-emerald-700 animate-pulse">Claim Salary</button>
                          ) : (
                              <button disabled className="w-full bg-gray-200 text-gray-500 py-2 rounded-lg font-bold text-sm cursor-not-allowed">Locked</button>
                          )}
                      </div>
                  );
              }) : <p className="text-center text-gray-400">No plans available.</p>}
          </div>
       </div>
    );
 };

 // --- 9. Profile Page ---
 const ProfilePage = ({ user, onBack, onLogout, onUpdateUser, showPopup }: any) => {
    const [view, setProfileView] = useState('main'); 
    const [name, setName] = useState(user.fullName);
    const [password, setPassword] = useState(user.password);
    const [imgUrl, setImgUrl] = useState(user.profileImage || '');
    const [stats, setStats] = useState({ totalEarned: 0, totalWithdraw: 0 });
    const [trxs, setTrxs] = useState<any[]>([]);

    useEffect(() => {
        getUserStats(user.id).then(setStats as any);
        const loadTrxs = async () => {
            const { data } = await supabase.from('transactions').select('*').eq('userId', user.id).order('date', {ascending: false});
            if(data) setTrxs(data);
        };
        loadTrxs();
    }, [user.id]);
    
    // Image Upload Handler
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImgUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
       await supabase.from('users').update({ fullName: name, password: password, profileImage: imgUrl }).eq('id', user.id);
       const updatedUser = { ...user, fullName: name, password: password, profileImage: imgUrl };
       onUpdateUser(updatedUser); 
       showPopup('success', "প্রোফাইল আপডেট সম্পন্ন হয়েছে!");
       setProfileView('main');
    };

    if (view === 'dep_hist') {
        const deps = trxs.filter(t => t.type === 'deposit');
        return (
            <div className={PAGE_CONTAINER_STYLE}>
                <Header title="ডিপোজিট হিস্টোরি" onBack={() => setProfileView('main')}/>
                <div className="p-4 space-y-3">
                    {deps.length === 0 ? <p className="text-center text-gray-400">কোনো হিস্টোরি নেই</p> : deps.map((t, i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="font-bold text-gray-800">{t.method} - {t.trxId}</p>
                                <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-indigo-600">+৳{t.amount}</p>
                                <span className={`text-[10px] font-bold uppercase ${t.status==='approved'?'text-green-500':'text-yellow-500'}`}>{t.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (view === 'inc_hist') {
        const incs = trxs.filter(t => t.type === 'earning');
        return (
            <div className={PAGE_CONTAINER_STYLE}>
                <Header title="ইনকাম হিস্টোরি" onBack={() => setProfileView('main')}/>
                <div className="p-4 space-y-3">
                    {incs.length === 0 ? <p className="text-center text-gray-400">কোনো হিস্টোরি নেই</p> : incs.map((t, i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="font-bold text-gray-800 text-xs">{t.details || t.category.toUpperCase()}</p>
                                <p className="text-[10px] text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-emerald-600">+৳{t.amount}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (view === 'edit') {
        return (
            <div className={PAGE_CONTAINER_STYLE}>
                <Header title="Edit Profile" onBack={() => setProfileView('main')}/>
                <div className="p-6">
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                      <div className="flex justify-center mb-2">
                           <div className="relative">
                               <img src={imgUrl || "https://files.catbox.moe/oq7gs8.jpg"} className="w-20 h-20 rounded-full object-cover border"/>
                               <label className="absolute bottom-0 right-0 bg-emerald-600 p-1 rounded-full text-white cursor-pointer hover:bg-emerald-700">
                                   <Camera size={14}/>
                                   <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                               </label>
                           </div>
                      </div>
                      <div><label className="text-xs font-bold text-gray-600">Full Name</label><input value={name} onChange={e => setName(e.target.value)} className={FORM_INPUT_STYLE}/></div>
                      <div><label className="text-xs font-bold text-gray-600">Password</label><input value={password} onChange={e => setPassword(e.target.value)} className={FORM_INPUT_STYLE}/></div>
                      
                      <button onClick={handleSave} className="block w-full bg-emerald-600 text-white py-3 rounded-lg font-bold shadow-lg">Save Changes</button>
                   </div>
                </div>
            </div>
        )
    }

    return (
       <div className={PAGE_CONTAINER_STYLE}>
          <Header title="আমার প্রোফাইল" onBack={onBack} />
          <div className="p-6 bg-white rounded-b-3xl shadow-sm mb-4 text-center border-b border-gray-100">
              <div className="w-24 h-24 rounded-full p-1 border-2 border-emerald-500 mx-auto relative mb-3">
                  <img src={user.profileImage || "https://files.catbox.moe/oq7gs8.jpg"} className="w-full h-full rounded-full object-cover"/>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
              <p className="text-gray-500 text-sm">{user.phone}</p>
              <div className="mt-2 text-xs bg-gray-100 inline-block px-3 py-1 rounded-full text-gray-600 font-bold">Ref: {user.refCode}</div>
          </div>

          <div className="px-4 grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center"><p className="text-xs text-gray-500 font-bold">মোট আয়</p><p className="text-xl font-bold text-emerald-600">৳ {stats.totalEarned.toFixed(2)}</p></div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center"><p className="text-xs text-gray-500 font-bold">মোট উত্তোলন</p><p className="text-xl font-bold text-gray-800">৳ {stats.totalWithdraw.toFixed(2)}</p></div>
          </div>

          <div className="px-4 space-y-3">
              <button onClick={() => setProfileView('dep_hist')} className="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <span className="flex items-center gap-3 font-bold text-gray-700"><Wallet size={20} className="text-indigo-500"/> ডিপোজিট হিস্টোরি</span>
                  <ChevronRight size={18} className="text-gray-400"/>
              </button>
              <button onClick={() => setProfileView('inc_hist')} className="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <span className="flex items-center gap-3 font-bold text-gray-700"><Banknote size={20} className="text-emerald-500"/> ইনকাম হিস্টোরি</span>
                  <ChevronRight size={18} className="text-gray-400"/>
              </button>
              <button onClick={() => setProfileView('edit')} className="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <span className="flex items-center gap-3 font-bold text-gray-700"><User size={20} className="text-blue-500"/> এডিট প্রোফাইল</span>
                  <ChevronRight size={18} className="text-gray-400"/>
              </button>
              <button onClick={onLogout} className="w-full flex items-center justify-between bg-red-50 p-4 rounded-xl shadow-sm border border-red-100 text-red-600">
                  <span className="flex items-center gap-3 font-bold"><LogOut size={20}/> লগ আউট</span>
              </button>
          </div>
       </div>
    );
 };

// --- 10. Auto Slider ---
const AutoSlider = ({ images }: { images: string[] }) => {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (!images || images.length === 0) return;
        const t = setInterval(() => setIdx(i => (i + 1) % images.length), 3000);
        return () => clearInterval(t);
    }, [images]);
    if (!images || !images.length) return null;
    return (
        <div className="rounded-xl overflow-hidden h-40 relative shadow-sm">
            <img src={images[idx]} className="w-full h-full object-cover transition-all duration-500" alt="Slide" />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">
                {idx + 1}/{images.length}
            </div>
        </div>
    );
};

// --- 11. Modals & Pages ---
const WelcomeModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-emerald-600 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-6 text-sm">Welcome to Next Level Earn. Start earning today!</p>
            <button onClick={onClose} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg">Let's Go</button>
        </div>
    </div>
);

const SupportPage = ({ onBack }: { onBack: () => void }) => (
    <div className={PAGE_CONTAINER_STYLE}>
        <Header title="Support" onBack={onBack} />
        <div className="p-6 text-center text-gray-500 mt-10">
            <Headphones size={48} className="mx-auto mb-4 text-gray-300"/>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Need Help?</h3>
            <p className="text-sm">Contact us via Telegram for 24/7 support.</p>
        </div>
    </div>
);

const DhamakaPage = ({ onBack }: { onBack: () => void }) => (
    <div className={PAGE_CONTAINER_STYLE}>
        <Header title="Dhamaka Offer" onBack={onBack} />
        <div className="p-6 text-center text-gray-500 mt-10">
            <GiftIcon size={48} className="mx-auto mb-4 text-purple-300"/>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Special Offers</h3>
            <p className="text-sm">Exciting offers coming soon for Ramadan 2026!</p>
        </div>
    </div>
);

// --- User Panel (Main Export) ---
export const UserPanel = ({ user, onLogout, onUpdateUser }: any) => {
    // States
    const [currentView, setCurrentView] = useState('dashboard');
    const [menuOpen, setMenuOpen] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [popup, setPopup] = useState<{isOpen: boolean, type: 'success' | 'error' | 'warning', message: string}>({ isOpen: false, type: 'success', message: '' });
    const [settings, setSettings] = useState<any>({ sliderImages: [] });

    useEffect(() => {
        getSettings().then(setSettings);
        const hasSeen = sessionStorage.getItem('hasSeenWelcome');
        if (!hasSeen) {
            setShowWelcome(true);
            sessionStorage.setItem('hasSeenWelcome', 'true');
        }
    }, []);

    const showPopup = (type: 'success' | 'error' | 'warning', message: string) => setPopup({ isOpen: true, type, message });
    const closePopup = () => setPopup({ ...popup, isOpen: false });

    // Dashboard Internal Component to access state
    const Dashboard = () => {
        const HomeButton = ({ icon: Icon, title, onClick, color }: any) => (
            <button onClick={onClick} className="flex flex-col items-center justify-center p-1 active:scale-95 transition w-full group">
              <div className={`p-3 rounded-2xl mb-2 ${color} bg-opacity-10 shadow-sm border border-gray-50 w-14 h-14 flex items-center justify-center`}>
                <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold text-gray-700 text-center leading-tight whitespace-nowrap">{title}</span>
            </button>
        );

        return (
            <div className={PAGE_CONTAINER_STYLE}>
              {/* Header */}
              <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-40 border-b border-gray-100">
                 <div className="flex items-center gap-3">
                    <button onClick={() => setMenuOpen(true)} className="p-1 hover:bg-gray-100 rounded-lg transition"><Menu className="text-gray-700" /></button>
                    <div className="flex items-center gap-2">
                       <img src="https://files.catbox.moe/oq7gs8.jpg" className="w-8 h-8 object-contain" />
                       <h1 className="font-bold text-emerald-600 text-lg">Next Level Earn</h1>
                    </div>
                 </div>
                 <div className="flex gap-3 text-gray-600">
                    <button onClick={() => setShowSupport(true)} className="hover:bg-gray-100 p-1 rounded-full"><Headphones size={22} className="text-emerald-600" /></button>
                    <Bell size={22} className="cursor-pointer hover:text-emerald-600 transition" />
                 </div>
              </div>

              {/* Drawer */}
              {menuOpen && (
                <div className="fixed inset-0 z-50 flex">
                   <div className="w-72 bg-white h-full shadow-2xl flex flex-col">
                      <div className="p-6 bg-gray-900 text-white flex items-center gap-3">
                         <img src={user.profileImage || "https://files.catbox.moe/oq7gs8.jpg"} className="w-12 h-12 rounded-full border"/>
                         <div><h3 className="font-bold">{user.fullName}</h3><p className="text-xs text-gray-400">{user.phone}</p></div>
                      </div>
                      <div className="flex-1 p-4 space-y-2">
                         <button onClick={() => { setCurrentView('dashboard'); setMenuOpen(false); }} className="w-full text-left p-3 hover:bg-gray-50 rounded font-bold text-gray-700 flex gap-3"><Home size={20}/> হোম</button>
                         <button onClick={() => { setCurrentView('wallet'); setMenuOpen(false); }} className="w-full text-left p-3 hover:bg-gray-50 rounded font-bold text-gray-700 flex gap-3"><Wallet size={20}/> ওয়ালেট</button>
                         <button onClick={() => { setCurrentView('team'); setMenuOpen(false); }} className="w-full text-left p-3 hover:bg-gray-50 rounded font-bold text-gray-700 flex gap-3"><Users size={20}/> টিম</button>
                         <button onClick={() => { setShowSupport(true); setMenuOpen(false); }} className="w-full text-left p-3 hover:bg-gray-50 rounded font-bold text-gray-700 flex gap-3"><Headphones size={20}/> সাপোর্ট</button>
                         <button onClick={onLogout} className="w-full text-left p-3 text-red-600 rounded font-bold flex gap-3 mt-4"><LogOut size={20}/> লগ আউট</button>
                      </div>
                   </div>
                   <div className="flex-1 bg-black/50" onClick={() => setMenuOpen(false)}></div>
                </div>
              )}

              {/* Promo Button */}
              <div className="px-4 mt-4">
                  <button onClick={() => setCurrentView('dhamaka')} className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg animate-pulse flex items-center justify-center gap-2">
                      <GiftIcon size={18} /> {settings.promo?.title || 'ধামাকা অফার'}
                  </button>
              </div>

              {/* Profile Card */}
              <div className="p-4">
                 <div className="bg-gray-900 p-5 rounded-2xl shadow-xl text-white relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                            <img src={user.profileImage || "https://files.catbox.moe/oq7gs8.jpg"} className="w-12 h-12 rounded-full border-2 border-emerald-500"/>
                            <div><h2 className="font-bold text-lg">{user.fullName}</h2><p className="text-xs text-gray-400">{user.phone}</p></div>
                        </div>
                        <div className="bg-emerald-600/20 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-emerald-400">
                           <Crown size={12}/> {user.accountType.toUpperCase()}
                        </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-800 flex justify-between items-end relative z-10">
                        <div><p className="text-xs text-gray-400">মেইন ব্যালেন্স</p><p className="text-xl font-bold text-white">৳ {user.balanceFree.toFixed(2)}</p></div>
                        <button onClick={() => setCurrentView('team')} className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold">ইনভাইট</button>
                    </div>
                 </div>
              </div>

              {/* Notice */}
              <div className="px-4 mb-2">
                  <div className="flex items-center bg-white border-y border-emerald-100 h-9 shadow-sm rounded-lg overflow-hidden">
                      <div className="bg-emerald-600 text-white text-[10px] font-bold px-3 h-full flex items-center justify-center">নোটিশ</div>
                      <div className="flex-1 overflow-hidden relative h-full flex items-center bg-emerald-50">
                          <div className="animate-marquee whitespace-nowrap text-xs text-emerald-900 font-medium px-4">📢 {settings.appName} এ আপনাকে স্বাগতম! উইথড্র চালু আছে।</div>
                      </div>
                  </div>
              </div>

              {/* Premium CTA */}
              <div className="px-4 py-2 mt-2">
                  <button onClick={() => setCurrentView('premium')} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 p-0.5 rounded-xl shadow-md active:scale-95 transition group">
                     <div className="bg-white/95 backdrop-blur rounded-[10px] p-3 flex items-center justify-between group-hover:bg-white/90 transition">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600"><Crown size={24} className="fill-yellow-600"/></div>
                           <div className="text-left"><h3 className="font-bold text-gray-800 text-sm">একাউন্ট প্রিমিয়াম করুন</h3><p className="text-[10px] text-gray-500">প্যাকেজ কিনুন এবং দ্বিগুণ ইনকাম করুন</p></div>
                        </div>
                        <ChevronRight size={18} className="text-gray-400"/>
                     </div>
                  </button>
              </div>

              {/* Grid */}
              <div className="px-4 py-2">
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                        <HomeButton icon={ClipboardList} title="টাস্ক" color="bg-blue-500" onClick={() => setCurrentView('tasks')}/>
                        <HomeButton icon={SmartphoneNfc} title="একাউন্ট সেল" color="bg-orange-500" onClick={() => setCurrentView('account_sell')}/>
                        <HomeButton icon={Keyboard} title="টাইপিং জব" color="bg-purple-500" onClick={() => setCurrentView('typing_job')}/>
                        <HomeButton icon={Brain} title="কুইজ" color="bg-indigo-500" onClick={() => setCurrentView('quiz')}/>
                        <HomeButton icon={Banknote} title="স্যালারি" color="bg-emerald-500" onClick={() => setCurrentView('salary')}/>
                        <HomeButton icon={Users} title="টিম" color="bg-pink-500" onClick={() => setCurrentView('team')}/>
                        <HomeButton icon={Wallet} title="ওয়ালেট" color="bg-cyan-500" onClick={() => setCurrentView('wallet')}/>
                        <HomeButton icon={PlusCircle} title="এড ব্যালেন্স" color="bg-red-500" onClick={() => setCurrentView('deposit')}/>
                    </div>
                 </div>
              </div>
              
              {/* Auto Slider */}
              <div className="px-4 mt-2">
                  <AutoSlider images={settings.sliderImages} />
              </div>

              {/* Footer Links */}
              <div className="px-4 grid grid-cols-3 gap-3 my-6">
                 <button onClick={() => window.open(settings.supportLink)} className="bg-white py-4 rounded-xl shadow-sm text-[10px] font-bold text-gray-600 flex flex-col items-center gap-2 border border-gray-100"><Send size={24} className="text-blue-500"/> Telegram</button>
                 <button onClick={() => window.open(settings.supportLink)} className="bg-white py-4 rounded-xl shadow-sm text-[10px] font-bold text-gray-600 flex flex-col items-center gap-2 border border-gray-100"><Users size={24} className="text-emerald-500"/> Group</button>
                 <button onClick={() => setShowSupport(true)} className="bg-white py-4 rounded-xl shadow-sm text-[10px] font-bold text-gray-600 flex flex-col items-center gap-2 border border-gray-100"><Headphones size={24} className="text-red-500"/> Support</button>
              </div>

              {/* Welcome Modal */}
              {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
            </div>
        );
    };

    const renderContent = () => {
        switch(currentView) {
            case 'dashboard': return <Dashboard />;
            case 'wallet': return <WalletPage user={user} onBack={() => setCurrentView('dashboard')} initialView="main" showPopup={showPopup} onGoPremium={() => setCurrentView('premium')} onUpdateUser={onUpdateUser} />;
            case 'deposit': return <WalletPage user={user} onBack={() => setCurrentView('dashboard')} initialView="deposit" showPopup={showPopup} />;
            case 'tasks': return <TaskPage user={user} onBack={() => setCurrentView('dashboard')} setView={setCurrentView} showPopup={showPopup} />;
            case 'account_sell': return <AccountSellPage user={user} onBack={() => setCurrentView('dashboard')} showPopup={showPopup} onGoPremium={() => setCurrentView('premium')} />;
            case 'typing_job': return <TypingJobPage user={user} onBack={() => setCurrentView('dashboard')} updateUser={onUpdateUser} showPopup={showPopup} onGoPremium={() => setCurrentView('premium')} />;
            case 'quiz': return <QuizPage user={user} onBack={() => setCurrentView('dashboard')} showPopup={showPopup} updateUser={onUpdateUser} />;
            case 'salary': return <SalaryPage user={user} onBack={() => setCurrentView('dashboard')} />;
            case 'team': return <TeamPageImpl user={user} onBack={() => setCurrentView('dashboard')} />;
            case 'premium': return <PremiumPage user={user} onBack={() => setCurrentView('dashboard')} showPopup={showPopup} />;
            case 'profile': return <ProfilePage user={user} onBack={() => setCurrentView('dashboard')} onLogout={onLogout} onUpdateUser={onUpdateUser} showPopup={showPopup} />;
            case 'support': return <SupportPage onBack={() => setCurrentView('dashboard')} />;
            case 'dhamaka': return <DhamakaPage onBack={() => setCurrentView('dashboard')} />;
            default: return <Dashboard />;
        }
    };

    return (
        <>
          {renderContent()}
          <BottomNav currentView={currentView} setView={setCurrentView} />
          <CustomPopup isOpen={popup.isOpen} type={popup.type} message={popup.message} onClose={closePopup}/>
          {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
        </>
    );
};
