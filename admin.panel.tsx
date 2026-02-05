import React, { useState, useEffect } from 'react';
import { 
  Menu, LayoutDashboard, Users, Crown, ClipboardList, 
  SmartphoneNfc, Headphones, Settings, LogOut, X, 
  Search, Edit, Trash2, CheckCircle, XCircle, Plus, 
  Save, DollarSign, Bell, Image as ImageIcon, ToggleLeft, 
  ToggleRight, AlertTriangle, Link, Eye, CreditCard,
  Send, Keyboard, HelpCircle, Briefcase, ChevronRight,
  TrendingUp, Shield, Lock, FileText, BarChart3, Wallet,
  Wand2, Gift, MessageSquare
} from 'lucide-react';
import { UserData, DB_KEYS, AccountType } from './types';
import { supabase } from './supabaseClient';

// --- Global Styles for Admin ---
const CARD_STYLE = "bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-gray-900";
const INPUT_STYLE = "w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-medium placeholder-gray-400";
const LABEL_STYLE = "block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5";
const BTN_PRIMARY = "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition shadow-sm flex items-center justify-center gap-2";
const BTN_DANGER = "bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm";
const TABLE_HEAD = "bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-wider text-left p-4 border-b border-gray-200";
const TABLE_CELL = "p-4 border-b border-gray-100 text-sm text-gray-700";

export const AdminPanel = ({ user, onLogout }: { user: UserData, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Data States
  const [users, setUsers] = useState<UserData[]>([]);
  const [trxs, setTrxs] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  // Feature States
  const [typingJobs, setTypingJobs] = useState<any[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizPackages, setQuizPackages] = useState<any[]>([]);
  const [salaryPlans, setSalaryPlans] = useState<any[]>([]);
  
  // Refresh Data
  const refreshData = async () => {
      const { data: userData } = await supabase.from('users').select('*');
      setUsers(userData || []);

      const { data: trxData } = await supabase.from('transactions').select('*').order('date', {ascending: false});
      setTrxs(trxData || []);

      const { data: taskData } = await supabase.from('tasks').select('*');
      setTasks(taskData || []);

      const { data: jobData } = await supabase.from('typing_jobs').select('*');
      setTypingJobs(jobData || []);

      const { data: quizP } = await supabase.from('quiz_packages').select('*');
      setQuizPackages(quizP || []);

      const { data: quizQ } = await supabase.from('quiz_list').select('*');
      setQuizQuestions(quizQ || []);

      const { data: salP } = await supabase.from('salary_plans').select('*');
      setSalaryPlans(salP || []);

      const { data: settingData } = await supabase.from('settings').select('*').single();
      const existingSettings = settingData ? settingData.value : null;

      setSettings(existingSettings ? existingSettings : {
          appName: 'Next Level Earn',
          supportLink: 'https://t.me/support',
          bkash: '01700000000', 
          nagad: '01800000000',
          minWithdraw: 100,
          maxWithdraw: 10000,
          minDeposit: 50,
          freeWithdrawLimit: 1,
          taskEnabled: true,
          premiumCost: 500,
          premiumEnabled: true,
          refComL1: 100,
          refComL2: 50,
          refComL3: 20,
          premiumBkash: '',
          premiumNagad: '',
          socialRates: { gmail: 10, facebook: 5, instagram: 5, tiktok: 5 },
          socialDesc: { gmail: '', facebook: '', instagram: '', tiktok: '' },
          promo: { title: 'ধামাকা অফার ২০২৬', desc: 'বিস্তারিত আসছে...', link: '' },
          sliderImages: []
      });
  };

  useEffect(() => {
      refreshData();
  }, []);

  const saveSettings = async (newSettings: any) => {
      setSettings(newSettings);
      const { data } = await supabase.from('settings').select('*').single();
      if(data) {
          await supabase.from('settings').update({ value: newSettings }).eq('id', data.id);
      } else {
          await supabase.from('settings').insert([{ value: newSettings }]);
      }
      alert("Configuration Saved Successfully!");
  };

  const getUserInfo = (userId: string) => users.find(u => u.id === userId);

  // Helper for Transaction Actions (Approve/Reject)
  const handleTransactionAction = async (trxId: string, action: 'approved' | 'rejected') => {
      const trx = trxs.find(t => t.id === trxId);
      if (!trx) return;

      // Update Transaction
      await supabase.from('transactions').update({ status: action }).eq('id', trxId);
      
      if (action === 'approved') {
          const u = users.find(user => user.id === trx.userId);
          if (u) {
              let updatedFields: any = {};
              
              if (trx.type === 'deposit') updatedFields.balancePremium = u.balancePremium + Number(trx.amount);
              // For earning (task, social, quiz), we add to balanceFree
              if (trx.type === 'earning') updatedFields.balanceFree = u.balanceFree + Number(trx.amount);
              // For purchase (premium), enable premium
              if (trx.type === 'purchase') updatedFields.accountType = 'premium'; 
              
              if (Object.keys(updatedFields).length > 0) {
                  await supabase.from('users').update(updatedFields).eq('id', trx.userId);
              }

              // Referral Commission Logic for Premium Purchase
              if (trx.type === 'purchase' && u.uplineRefCode) {
                  const { data: l1 } = await supabase.from('users').select('*').eq('refCode', u.uplineRefCode).single();
                  if (l1) {
                      await supabase.from('users').update({ balanceFree: l1.balanceFree + (settings.refComL1 || 0) }).eq('id', l1.id);
                      await supabase.from('transactions').insert([{
                          userId: l1.id, type: 'bonus', category: 'referral', amount: settings.refComL1 || 0,
                          status: 'approved', date: new Date().toISOString(), details: `Ref Bonus L1 from ${u.fullName}`
                      }]);
                      
                      const { data: l2 } = await supabase.from('users').select('*').eq('refCode', l1.uplineRefCode).single();
                      if (l2) {
                          await supabase.from('users').update({ balanceFree: l2.balanceFree + (settings.refComL2 || 0) }).eq('id', l2.id);
                          await supabase.from('transactions').insert([{
                              userId: l2.id, type: 'bonus', category: 'referral', amount: settings.refComL2 || 0,
                              status: 'approved', date: new Date().toISOString(), details: `Ref Bonus L2 from ${u.fullName}`
                          }]);
                          
                          const { data: l3 } = await supabase.from('users').select('*').eq('refCode', l2.uplineRefCode).single();
                          if (l3) {
                              await supabase.from('users').update({ balanceFree: l3.balanceFree + (settings.refComL3 || 0) }).eq('id', l3.id);
                              await supabase.from('transactions').insert([{
                                  userId: l3.id, type: 'bonus', category: 'referral', amount: settings.refComL3 || 0,
                                  status: 'approved', date: new Date().toISOString(), details: `Ref Bonus L3 from ${u.fullName}`
                              }]);
                          }
                      }
                  }
              }
          }
      } else if (action === 'rejected' && trx.type === 'withdraw') {
          // Refund on reject
          const u = users.find(user => user.id === trx.userId);
          if(u) {
              await supabase.from('users').update({ balanceFree: u.balanceFree + Number(trx.amount) }).eq('id', u.id);
          }
      }

      refreshData();
  };

  // --- Components ---

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button 
        onClick={() => { setActiveTab(id); setMenuOpen(false); }} 
        className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition mb-1 font-medium text-sm ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
        <Icon size={18} strokeWidth={2.5}/> <span>{label}</span>
        {activeTab === id && <ChevronRight size={16} className="ml-auto opacity-50"/>}
    </button>
  );

  const StatCard = ({ label, value, color, icon: Icon, sub }: any) => (
      <div className={`${CARD_STYLE} flex items-center justify-between border-l-4 ${color}`}>
          <div>
              <p className="text-gray-500 text-xs font-extrabold uppercase tracking-widest mb-1">{label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
          <div className={`p-4 rounded-full ${color.replace('border-', 'bg-').replace('500', '100')}`}>
              <Icon className={color.replace('border-', 'text-')} size={28}/>
          </div>
      </div>
  );

  const UserInfoCard = ({ userId }: { userId: string }) => {
      const u = getUserInfo(userId);
      if (!u) return <span className="text-red-500 text-xs">User Not Found</span>;
      return (
          <div className="flex items-center gap-3 mb-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <img src={u.profileImage || "https://files.catbox.moe/oq7gs8.jpg"} className="w-10 h-10 rounded-full object-cover border"/>
              <div>
                  <p className="font-bold text-sm text-gray-800">{u.fullName} <span className="text-[10px] text-gray-400">({u.phone})</span></p>
                  <p className="text-[10px] text-gray-500 font-medium">Main: ৳{u.balanceFree.toFixed(2)} | Dep: ৳{u.balancePremium.toFixed(2)}</p>
              </div>
          </div>
      );
  };

  // --- 1. Dashboard ---
  const DashboardView = () => {
      const stats = {
          totalUsers: users.length,
          premiumUsers: users.filter(u => u.accountType === 'premium').length,
          freeUsers: users.filter(u => u.accountType === 'free').length,
          userBalance: users.reduce((a, b) => a + b.balanceFree, 0),
          totalDeposit: trxs.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((a, b) => a + b.amount, 0),
          totalWithdraw: trxs.filter(t => t.type === 'withdraw' && t.status === 'approved').reduce((a, b) => a + b.amount, 0),
          pendingWithdraw: trxs.filter(t => t.type === 'withdraw' && t.status === 'pending').length,
          pendingTasks: trxs.filter(t => t.category === 'task' && t.status === 'pending').length,
      };

      return (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={stats.totalUsers} color="border-indigo-500" icon={Users} sub={`${stats.freeUsers} Free / ${stats.premiumUsers} Pro`}/>
                  <StatCard label="Total Deposit" value={`৳${stats.totalDeposit}`} color="border-emerald-500" icon={TrendingUp}/>
                  <StatCard label="Total Withdraw" value={`৳${stats.totalWithdraw}`} color="border-rose-500" icon={CreditCard}/>
                  <StatCard label="User Liabilities" value={`৳${stats.userBalance.toFixed(0)}`} color="border-orange-500" icon={DollarSign} sub="Total User Wallet Balance"/>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`${CARD_STYLE} bg-rose-50 border-rose-100`}>
                      <div className="flex justify-between items-center">
                          <h4 className="font-bold text-rose-800">Pending Withdrawals</h4>
                          <span className="bg-rose-200 text-rose-800 px-2 py-1 rounded text-xs font-bold">{stats.pendingWithdraw}</span>
                      </div>
                      <button onClick={() => setActiveTab('deposit')} className="mt-4 text-xs font-bold text-rose-600 underline">Process Now</button>
                  </div>
                  <div className={`${CARD_STYLE} bg-blue-50 border-blue-100`}>
                      <div className="flex justify-between items-center">
                          <h4 className="font-bold text-blue-800">Pending Task Proofs</h4>
                          <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-bold">{stats.pendingTasks}</span>
                      </div>
                      <button onClick={() => setActiveTab('tasks')} className="mt-4 text-xs font-bold text-blue-600 underline">Check Proofs</button>
                  </div>
                  <div className={`${CARD_STYLE} bg-emerald-50 border-emerald-100`}>
                      <div className="flex justify-between items-center">
                          <h4 className="font-bold text-emerald-800">System Status</h4>
                          <div className="flex items-center gap-1">
                             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                             <span className="text-xs font-bold text-emerald-600">Live</span>
                          </div>
                      </div>
                      <p className="text-xs text-emerald-600 mt-4">Version 2.5 Updated</p>
                  </div>
              </div>
          </div>
      );
  };

  // --- 2. User Manager (Full Edit) ---
  const UserManagerView = () => {
      const [editUser, setEditUser] = useState<UserData | null>(null);
      const [search, setSearch] = useState('');

      const filtered = users.filter(u => u.phone.includes(search) || u.fullName.toLowerCase().includes(search.toLowerCase()));

      const handleSaveUser = async () => {
          if(!editUser) return;
          await supabase.from('users').update(editUser).eq('id', editUser.id);
          refreshData();
          setEditUser(null);
          alert("User profile updated successfully!");
      };

      const handleDelete = async (id: string) => {
          if(confirm("Delete this user permanently? This cannot be undone.")) {
              await supabase.from('users').delete().eq('id', id);
              refreshData();
          }
      };

      return (
          <div className={CARD_STYLE}>
              {editUser ? (
                  <div className="max-w-2xl mx-auto">
                      <div className="flex justify-between items-center mb-6 border-b pb-4">
                          <h3 className="font-bold text-xl text-gray-800">Edit User: {editUser.fullName}</h3>
                          <button onClick={() => setEditUser(null)}><X size={20}/></button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className={LABEL_STYLE}>Full Name</label><input className={INPUT_STYLE} value={editUser.fullName} onChange={e => setEditUser({...editUser, fullName: e.target.value})}/></div>
                          <div><label className={LABEL_STYLE}>Phone Number</label><input className={INPUT_STYLE} value={editUser.phone} readOnly disabled/></div>
                          <div><label className={LABEL_STYLE}>Password</label><input className={INPUT_STYLE} value={editUser.password} onChange={e => setEditUser({...editUser, password: e.target.value})}/></div>
                          <div><label className={LABEL_STYLE}>Account Status</label>
                             <select className={INPUT_STYLE} value={editUser.isBlocked ? 'blocked' : 'active'} onChange={e => setEditUser({...editUser, isBlocked: e.target.value === 'blocked'})}>
                                 <option value="active">Active</option>
                                 <option value="blocked">Blocked</option>
                             </select>
                          </div>
                          <div className="col-span-2 border-t pt-4 mt-2">
                              <h4 className="font-bold text-sm mb-3 text-indigo-600">Financial Adjustments</h4>
                          </div>
                          <div><label className={LABEL_STYLE}>Main Balance (৳)</label><input type="number" className={INPUT_STYLE} value={editUser.balanceFree} onChange={e => setEditUser({...editUser, balanceFree: parseFloat(e.target.value)})}/></div>
                          <div><label className={LABEL_STYLE}>Deposit Balance (৳)</label><input type="number" className={INPUT_STYLE} value={editUser.balancePremium} onChange={e => setEditUser({...editUser, balancePremium: parseFloat(e.target.value)})}/></div>
                          <div><label className={LABEL_STYLE}>Account Type</label>
                             <select className={INPUT_STYLE} value={editUser.accountType} onChange={e => setEditUser({...editUser, accountType: e.target.value as any})}>
                                 <option value="free">Free User</option>
                                 <option value="premium">Premium User</option>
                             </select>
                          </div>
                          <div><label className={LABEL_STYLE}>Referral Job Quota</label><input type="number" className={INPUT_STYLE} value={editUser.referralJobQuota || 0} onChange={e => setEditUser({...editUser, referralJobQuota: parseInt(e.target.value)})}/></div>
                      </div>
                      <div className="flex gap-3 mt-8">
                          <button onClick={handleSaveUser} className={BTN_PRIMARY}>Save Changes</button>
                          <button onClick={() => setEditUser(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm">Cancel</button>
                      </div>
                  </div>
              ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">User Management</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input className={`${INPUT_STYLE} pl-10`} placeholder="Search by phone/name..." value={search} onChange={e => setSearch(e.target.value)}/>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className={TABLE_HEAD}>User Info</th>
                                    <th className={TABLE_HEAD}>Balances</th>
                                    <th className={TABLE_HEAD}>Status</th>
                                    <th className={TABLE_HEAD}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className={TABLE_CELL}>
                                            <p className="font-bold text-gray-900">{u.fullName}</p>
                                            <p className="text-xs text-gray-500">{u.phone}</p>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="flex gap-2 text-xs">
                                                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Main: ৳{u.balanceFree.toFixed(1)}</span>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Dep: ৳{u.balancePremium.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${u.accountType === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{u.accountType.toUpperCase()}</span>
                                            {u.isBlocked && <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">BLOCKED</span>}
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditUser(u)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit size={16}/></button>
                                                <button onClick={() => handleDelete(u.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </>
              )}
          </div>
      );
  };

  // --- 3. Task Manager (Create & Approve) ---
  const TaskManagerView = () => {
      const [view, setView] = useState('list');
      const [newTask, setNewTask] = useState({ title: '', desc: '', reward: 0, link: '', image: '', type: 'free' });

      const handleAddTask = async () => {
          await supabase.from('tasks').insert([newTask]);
          refreshData();
          setView('list');
      };

      const handleDeleteTask = async (id: any) => {
          await supabase.from('tasks').delete().eq('id', id);
          refreshData();
      };

      return (
          <div className={CARD_STYLE}>
              <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
                  {['list', 'add', 'submissions', 'settings'].map(v => (
                      <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${view === v ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {v}
                      </button>
                  ))}
              </div>

              {view === 'settings' && (
                  <div className="max-w-md space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                          <div>
                              <span className="font-bold text-gray-700 block">Enable Tasks Globally</span>
                              <span className="text-xs text-gray-500">Show/Hide task menu for users</span>
                          </div>
                          <button onClick={() => saveSettings({...settings, taskEnabled: !settings.taskEnabled})} className={`text-2xl ${settings.taskEnabled ? 'text-green-500' : 'text-gray-300'}`}>
                              {settings.taskEnabled ? <ToggleRight size={40}/> : <ToggleLeft size={40}/>}
                          </button>
                      </div>
                  </div>
              )}

              {view === 'add' && (
                  <div className="max-w-lg space-y-4">
                      <div><label className={LABEL_STYLE}>Task Title</label><input className={INPUT_STYLE} onChange={e => setNewTask({...newTask, title: e.target.value})}/></div>
                      <div><label className={LABEL_STYLE}>Description</label><textarea className={INPUT_STYLE} rows={3} onChange={e => setNewTask({...newTask, desc: e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className={LABEL_STYLE}>Reward (৳)</label><input type="number" className={INPUT_STYLE} onChange={e => setNewTask({...newTask, reward: parseFloat(e.target.value)})}/></div>
                          <div><label className={LABEL_STYLE}>User Type</label>
                              <select className={INPUT_STYLE} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                                  <option value="free">Free Users</option>
                                  <option value="premium">Premium Users</option>
                              </select>
                          </div>
                      </div>
                      <div><label className={LABEL_STYLE}>Work Link</label><input className={INPUT_STYLE} onChange={e => setNewTask({...newTask, link: e.target.value})}/></div>
                      <button onClick={handleAddTask} className={BTN_PRIMARY}>Create Task</button>
                  </div>
              )}

              {view === 'list' && (
                  <div className="space-y-3">
                      {tasks.map((t: any) => (
                          <div key={t.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50">
                              <div>
                                  <h4 className="font-bold text-gray-800">{t.title}</h4>
                                  <p className="text-xs text-gray-500">Reward: ৳{t.reward} • {t.type.toUpperCase()}</p>
                              </div>
                              <button onClick={() => handleDeleteTask(t.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                          </div>
                      ))}
                      {tasks.length === 0 && <p className="text-gray-400 text-sm">No tasks available.</p>}
                  </div>
              )}

              {view === 'submissions' && (
                  <div className="space-y-3">
                      {trxs.filter(t => t.category === 'task' && t.status === 'pending').map(t => (
                          <div key={t.id} className="p-4 border rounded-xl bg-blue-50/50 flex justify-between items-center">
                              <div>
                                  <p className="font-bold text-sm text-gray-800">{t.details}</p>
                                  <p className="text-xs text-gray-500">User: {t.userId} • Amount: ৳{t.amount}</p>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => handleTransactionAction(t.id, 'approved')} className="bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold">Approve</button>
                                  <button onClick={() => handleTransactionAction(t.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Reject</button>
                              </div>
                          </div>
                      ))}
                      {trxs.filter(t => t.category === 'task' && t.status === 'pending').length === 0 && <p className="text-center text-gray-400 py-4">No pending proofs.</p>}
                  </div>
              )}
          </div>
      );
  };

  // --- 4. Typing Manager (Jobs & Updated Referral Logic) ---
  const TypingManagerView = () => {
      const [job, setJob] = useState({ text: '', reward: 0.5, link: '', waitTime: 10, category: 'premium' });

      const addJob = async () => {
          await supabase.from('typing_jobs').insert([job]);
          refreshData();
          alert("Job Added");
      };

      const generateRandomTyping = () => {
         const dummyTexts = [
             "The quick brown fox jumps over the lazy dog. Efficiency is key to success.",
             "Digital marketing refers to advertising delivered through digital channels.",
             "Artificial intelligence (AI) is intelligence demonstrated by machines.",
             "Cryptocurrency is a digital or virtual currency that is secured by cryptography."
         ];
         const randomText = dummyTexts[Math.floor(Math.random() * dummyTexts.length)];
         setJob({...job, text: randomText});
      };

      return (
          <div className={CARD_STYLE}>
              <h3 className="font-bold mb-4">Manage Typing Jobs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 border-r pr-6">
                      <div className="flex justify-between items-center">
                           <h4 className="font-bold text-indigo-600">Add New Typing Paragraph</h4>
                           <button onClick={generateRandomTyping} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-purple-200"><Wand2 size={12}/> Auto Gen</button>
                      </div>
                      <div><label className={LABEL_STYLE}>Paragraph Text</label><textarea rows={3} className={INPUT_STYLE} value={job.text} onChange={e => setJob({...job, text: e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className={LABEL_STYLE}>Reward (৳)</label><input type="number" className={INPUT_STYLE} value={job.reward} onChange={e => setJob({...job, reward: parseFloat(e.target.value)})}/></div>
                          <div><label className={LABEL_STYLE}>Job Type</label>
                              <select className={INPUT_STYLE} value={job.category} onChange={e => setJob({...job, category: e.target.value})}>
                                  <option value="premium">Premium Typing</option>
                                  <option value="referral">Referral Typing</option>
                              </select>
                          </div>
                      </div>
                      <div><label className={LABEL_STYLE}>Wait Time (Sec)</label><input type="number" className={INPUT_STYLE} value={job.waitTime} onChange={e => setJob({...job, waitTime: parseFloat(e.target.value)})}/></div>
                      <div><label className={LABEL_STYLE}>Ad Link (Optional)</label><input className={INPUT_STYLE} value={job.link} onChange={e => setJob({...job, link: e.target.value})}/></div>
                      <button onClick={addJob} className={BTN_PRIMARY}>Add Job</button>
                  </div>
                  <div className="space-y-2 overflow-y-auto max-h-96">
                      <h4 className="font-bold text-gray-700">Existing Jobs</h4>
                      {typingJobs.map((j: any) => (
                          <div key={j.id} className="border p-2 mb-2 rounded flex justify-between">
                              <div className="w-2/3">
                                  <span className="text-xs font-bold block">{j.category.toUpperCase()} | ৳{j.reward}</span>
                                  <span className="text-xs truncate block">{j.text}</span>
                              </div>
                              <button onClick={async () => {
                                      await supabase.from('typing_jobs').delete().eq('id', j.id);
                                      refreshData();
                                  }} className="text-red-500 text-xs">Del</button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  // --- 5. Quiz Manager (Updated with Packages) ---
  const QuizManagerView = () => {
      const [view, setView] = useState('packages'); // packages | questions
      const [selectedPkg, setSelectedPkg] = useState<any>(null);
      
      const [pkg, setPkg] = useState({ name: '', desc: '', price: 0, duration: 30, dailyLimit: 10, profit: 0 });
      const [q, setQ] = useState({ question: '', ans: '', reward: 0.5, wait: 5, adLink: '' });

      const addPackage = async () => {
          await supabase.from('quiz_packages').insert([pkg]);
          refreshData();
          alert("Package Added");
      };

      const addQuestionToPkg = async () => {
          if (!selectedPkg) return;
          await supabase.from('quiz_list').insert([{ ...q, packageId: selectedPkg.id }]);
          refreshData();
          alert("Question Added to " + selectedPkg.name);
      };

      if (view === 'questions') {
          return (
              <div className={CARD_STYLE}>
                  <div className="flex items-center gap-3 mb-4">
                      <button onClick={() => setView('packages')} className="text-sm font-bold text-gray-500 hover:text-black">Back</button>
                      <h3 className="font-bold text-lg">Manage Questions: {selectedPkg?.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                          <input placeholder="Question" className={INPUT_STYLE} onChange={e => setQ({...q, question: e.target.value})}/>
                          <input placeholder="Answer" className={INPUT_STYLE} onChange={e => setQ({...q, ans: e.target.value})}/>
                          <div className="grid grid-cols-2 gap-2">
                              <input type="number" placeholder="Reward" className={INPUT_STYLE} onChange={e => setQ({...q, reward: parseFloat(e.target.value)})}/>
                              <input type="number" placeholder="Wait (s)" className={INPUT_STYLE} onChange={e => setQ({...q, wait: parseFloat(e.target.value)})}/>
                          </div>
                          <input placeholder="Ad Link" className={INPUT_STYLE} onChange={e => setQ({...q, adLink: e.target.value})}/>
                          <button onClick={addQuestionToPkg} className={BTN_PRIMARY}>Add Question</button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded h-64 overflow-y-auto">
                           {quizQuestions.filter((x: any) => x.packageId === selectedPkg?.id).map((i: any) => (
                               <div key={i.id} className="p-2 border-b text-xs flex justify-between">
                                   <span>{i.question}</span>
                                   <button onClick={async () => {
                                       await supabase.from('quiz_list').delete().eq('id', i.id);
                                       refreshData();
                                   }} className="text-red-500">Del</button>
                               </div>
                           ))}
                      </div>
                  </div>
              </div>
          );
      }

      return (
          <div className={CARD_STYLE}>
              <h3 className="font-bold mb-4">Quiz Packages</h3>
              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
                  <input placeholder="Package Name" className={INPUT_STYLE} onChange={e => setPkg({...pkg, name: e.target.value})}/>
                  <input placeholder="Desc" className={INPUT_STYLE} onChange={e => setPkg({...pkg, desc: e.target.value})}/>
                  <input type="number" placeholder="Price" className={INPUT_STYLE} onChange={e => setPkg({...pkg, price: parseFloat(e.target.value)})}/>
                  <input type="number" placeholder="Days" className={INPUT_STYLE} onChange={e => setPkg({...pkg, duration: parseFloat(e.target.value)})}/>
                  <input type="number" placeholder="Daily Limit" className={INPUT_STYLE} onChange={e => setPkg({...pkg, dailyLimit: parseFloat(e.target.value)})}/>
                  <input type="number" placeholder="Total Profit" className={INPUT_STYLE} onChange={e => setPkg({...pkg, profit: parseFloat(e.target.value)})}/>
                  <button onClick={addPackage} className={`${BTN_PRIMARY} col-span-2`}>Create Package</button>
              </div>
              <div className="space-y-2">
                  {quizPackages.map((p: any) => (
                      <div key={p.id} className="p-4 border rounded flex justify-between items-center">
                          <div>
                              <h4 className="font-bold">{p.name}</h4>
                              <p className="text-xs text-gray-500">৳{p.price} | {p.duration} Days</p>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => { setSelectedPkg(p); setView('questions'); }} className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded text-xs font-bold">Add Quiz</button>
                              <button onClick={async () => {
                                  await supabase.from('quiz_packages').delete().eq('id', p.id);
                                  refreshData();
                              }} className="text-red-500 text-xs">Delete</button>
                          </div>
                      </div>
                  ))}
                  {quizPackages.length === 0 && <p className="text-gray-400">No packages created yet.</p>}
              </div>
          </div>
      );
  };

  // --- 6. Salary Manager ---
  const SalaryManagerView = () => {
      const [plan, setPlan] = useState({ title: '', targetRefers: 0, reward: 0, desc: '', requiredPackages: 0 });
      
      const addPlan = async () => {
          await supabase.from('salary_plans').insert([plan]);
          refreshData();
      };

      return (
          <div className={CARD_STYLE}>
              <h3 className="font-bold text-lg mb-4">Monthly Salary Plans</h3>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                      <div><label className={LABEL_STYLE}>Plan Title</label><input className={INPUT_STYLE} placeholder="e.g. Level 1 Leader" onChange={e => setPlan({...plan, title: e.target.value})}/></div>
                      <div><label className={LABEL_STYLE}>Target Refers</label><input type="number" className={INPUT_STYLE} onChange={e => setPlan({...plan, targetRefers: parseFloat(e.target.value)})}/></div>
                      <div><label className={LABEL_STYLE}>Salary (৳)</label><input type="number" className={INPUT_STYLE} onChange={e => setPlan({...plan, reward: parseFloat(e.target.value)})}/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className={LABEL_STYLE}>Required Packages</label><input type="number" className={INPUT_STYLE} placeholder="Qty" onChange={e => setPlan({...plan, requiredPackages: parseFloat(e.target.value)})}/></div>
                      <div><label className={LABEL_STYLE}>Description</label><input className={INPUT_STYLE} placeholder="Short Description" onChange={e => setPlan({...plan, desc: e.target.value})}/></div>
                  </div>
                  <button onClick={addPlan} className={BTN_PRIMARY}>Create Salary Plan</button>
              </div>

              <div className="space-y-3">
                  {salaryPlans.map((p: any) => (
                      <div key={p.id} className="p-4 border rounded-xl flex justify-between items-center">
                          <div>
                              <h4 className="font-bold text-emerald-900">{p.title}</h4>
                              <p className="text-sm text-gray-600">Refers: {p.targetRefers} | Packages: {p.requiredPackages || 0}</p>
                              <p className="text-xs text-gray-400 italic">{p.desc}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xl font-bold text-emerald-600">৳{p.reward}/mo</p>
                              <button onClick={async () => {
                                  await supabase.from('salary_plans').delete().eq('id', p.id);
                                  refreshData();
                              }} className="text-xs text-red-500 underline">Delete</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  // --- 7. Global Settings (Added Promo & Dhamaka Offer) ---
  const GlobalSettingsView = () => {
      const [localSet, setLocalSet] = useState(settings);
      
      return (
          <div className={CARD_STYLE}>
              <h3 className="font-bold text-xl mb-6 border-b pb-4">Global App Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <h4 className="font-bold text-gray-700">General Information</h4>
                      <div><label className={LABEL_STYLE}>App Name</label><input className={INPUT_STYLE} value={localSet.appName} onChange={e => setLocalSet({...localSet, appName: e.target.value})}/></div>
                      <div><label className={LABEL_STYLE}>Support Link (Telegram)</label><input className={INPUT_STYLE} value={localSet.supportLink} onChange={e => setLocalSet({...localSet, supportLink: e.target.value})}/></div>
                  </div>
                  
                  <div className="space-y-4">
                      <h4 className="font-bold text-gray-700">Payment & Withdrawals</h4>
                      <div className="grid grid-cols-2 gap-3">
                          <div><label className={LABEL_STYLE}>Bkash Number</label><input className={INPUT_STYLE} value={localSet.bkash} onChange={e => setLocalSet({...localSet, bkash: e.target.value})}/></div>
                          <div><label className={LABEL_STYLE}>Nagad Number</label><input className={INPUT_STYLE} value={localSet.nagad} onChange={e => setLocalSet({...localSet, nagad: e.target.value})}/></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div><label className={LABEL_STYLE}>Min Withdraw (৳)</label><input type="number" className={INPUT_STYLE} value={localSet.minWithdraw} onChange={e => setLocalSet({...localSet, minWithdraw: parseFloat(e.target.value)})}/></div>
                          <div><label className={LABEL_STYLE}>Free User Withdraw Limit</label><input type="number" className={INPUT_STYLE} value={localSet.freeWithdrawLimit} onChange={e => setLocalSet({...localSet, freeWithdrawLimit: parseFloat(e.target.value)})}/></div>
                      </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t">
                      <h4 className="font-bold text-indigo-600 mb-2">Dhamaka Offer Settings</h4>
                      <div><label className={LABEL_STYLE}>Promo Title</label><input className={INPUT_STYLE} value={localSet.promo?.title} onChange={e => setLocalSet({...localSet, promo: {...localSet.promo, title: e.target.value}})}/></div>
                      <div><label className={LABEL_STYLE}>Promo Description</label><input className={INPUT_STYLE} value={localSet.promo?.desc} onChange={e => setLocalSet({...localSet, promo: {...localSet.promo, desc: e.target.value}})}/></div>
                      <div><label className={LABEL_STYLE}>Promo Link (Empty = Coming Soon)</label><input className={INPUT_STYLE} value={localSet.promo?.link} onChange={e => setLocalSet({...localSet, promo: {...localSet.promo, link: e.target.value}})}/></div>
                  </div>

                  <div className="col-span-1 md:col-span-2 pt-6">
                      <button onClick={() => saveSettings(localSet)} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">Save Global Settings</button>
                  </div>
              </div>
          </div>
      );
  };

  // --- 8. Social Manager (Updated with Gmail Request Flow) ---
  const SocialManagerView = () => {
      const [view, setView] = useState('gmail_request'); // Default to gmail request
      const [adminInput, setAdminInput] = useState({ firstName: '', lastName: '', adminEmail: '', adminPass: '', adminRecovery: '' });

      const handleGmailAction = async (trx: any, actionType: string) => {
          let newData = {};
          let newStatus = trx.status;
          
          if (actionType === 'send_creds') {
              newData = { ...adminInput };
              newStatus = 'working'; // Step 2
          } else if (actionType === 'send_recovery') {
              newData = { adminRecovery: adminInput.adminRecovery };
              newStatus = 'finalizing'; // Step 4
          } else if (actionType === 'approve_final') {
              newStatus = 'approved';
              handleTransactionAction(trx.id, 'approved'); // Pay user
              return; 
          }

          const prevDetails = JSON.parse(trx.details || '{}');
          const newDetails = JSON.stringify({ ...prevDetails, ...newData });
          
          await supabase.from('transactions').update({ details: newDetails, status: newStatus }).eq('id', trx.id);
          refreshData();
          alert("Update sent to user.");
          setAdminInput({ firstName: '', lastName: '', adminEmail: '', adminPass: '', adminRecovery: '' });
      };

      const renderGmailRequests = () => {
          const requests = trxs.filter(t => t.category === 'gmail_request' && t.status !== 'approved' && t.status !== 'rejected');
          return (
              <div className="space-y-4">
                  <h4 className="font-bold text-indigo-700">Manage Gmail Requests</h4>
                  {requests.map(t => {
                      const data = JSON.parse(t.details || '{}');
                      return (
                          <div key={t.id} className="border p-4 rounded-xl bg-gray-50 shadow-sm">
                              <div className="flex justify-between mb-2">
                                  <span className="font-bold text-sm">User: {t.userId}</span>
                                  <span className="text-xs bg-yellow-200 px-2 py-1 rounded uppercase font-bold">{t.status}</span>
                              </div>

                              {/* Step 1: Pending Creds */}
                              {t.status === 'pending_creds' && (
                                  <div className="grid grid-cols-2 gap-2 mt-2 bg-white p-3 rounded border">
                                      <p className="col-span-2 text-xs text-gray-500 mb-1">Provide credentials for user to create account:</p>
                                      <input placeholder="First Name" className={INPUT_STYLE} onChange={e => setAdminInput({...adminInput, firstName: e.target.value})}/>
                                      <input placeholder="Last Name" className={INPUT_STYLE} onChange={e => setAdminInput({...adminInput, lastName: e.target.value})}/>
                                      <input placeholder="Email" className={INPUT_STYLE} onChange={e => setAdminInput({...adminInput, adminEmail: e.target.value})}/>
                                      <input placeholder="Password" className={INPUT_STYLE} onChange={e => setAdminInput({...adminInput, adminPass: e.target.value})}/>
                                      <button onClick={() => handleGmailAction(t, 'send_creds')} className="col-span-2 bg-blue-600 text-white py-2 rounded text-xs font-bold mt-1">Send Credentials</button>
                                  </div>
                              )}

                              {/* Step 3: Pending Recovery */}
                              {t.status === 'pending_recovery' && (
                                  <div className="mt-2 bg-white p-3 rounded border">
                                      <p className="text-xs text-red-500 mb-1 font-bold">User requested recovery email.</p>
                                      <input placeholder="Recovery Email" className={INPUT_STYLE} onChange={e => setAdminInput({...adminInput, adminRecovery: e.target.value})}/>
                                      <button onClick={() => handleGmailAction(t, 'send_recovery')} className="w-full mt-2 bg-blue-600 text-white py-2 rounded text-xs font-bold">Send Recovery Email</button>
                                  </div>
                              )}

                              {/* Step 5: Review */}
                              {t.status === 'review' && (
                                  <div className="mt-2 bg-white p-3 rounded border">
                                      <p className="text-xs text-green-600 font-bold mb-2">User Completed Task. Review Info:</p>
                                      <div className="text-xs bg-gray-50 p-2 border mb-2 font-mono break-all">
                                          {t.details}
                                      </div>
                                      <button onClick={() => handleGmailAction(t, 'approve_final')} className="w-full bg-emerald-600 text-white py-2 rounded text-xs font-bold">Approve Payment (৳{t.amount})</button>
                                  </div>
                              )}
                              
                              {/* Working State */}
                              {t.status === 'working' && <p className="text-xs text-gray-400 mt-2">User is currently working...</p>}
                              {t.status === 'finalizing' && <p className="text-xs text-gray-400 mt-2">User is verifying recovery...</p>}
                          </div>
                      )
                  })}
                  {requests.length === 0 && <p className="text-gray-400 text-sm">No pending Gmail requests.</p>}
              </div>
          );
      };

      const renderSettings = () => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['gmail', 'facebook', 'instagram', 'tiktok'].map(platform => (
                  <div key={platform} className="p-4 border rounded-xl bg-gray-50">
                      <h4 className="font-bold capitalize text-gray-800 mb-3">{platform} Settings</h4>
                      <div className="space-y-2">
                          <div><label className={LABEL_STYLE}>Buying Rate (৳)</label>
                              <input type="number" className={INPUT_STYLE} defaultValue={settings.socialRates?.[platform]} 
                                  onChange={e => {
                                      const newRates = { ...settings.socialRates, [platform]: parseFloat(e.target.value) };
                                      setSettings({ ...settings, socialRates: newRates });
                                  }}
                              />
                          </div>
                          <div><label className={LABEL_STYLE}>Description / Rules</label>
                              <textarea className={INPUT_STYLE} rows={2} defaultValue={settings.socialDesc?.[platform]} 
                                  placeholder={`Enter rules for ${platform}...`}
                                  onChange={e => {
                                      const newDesc = { ...settings.socialDesc, [platform]: e.target.value };
                                      setSettings({ ...settings, socialDesc: newDesc });
                                  }}
                              />
                          </div>
                      </div>
                  </div>
              ))}
              <div className="col-span-1 md:col-span-2">
                  <button onClick={() => saveSettings(settings)} className={BTN_PRIMARY}>Save All Social Settings</button>
              </div>
          </div>
      );

      return (
          <div className={CARD_STYLE}>
              <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4 overflow-x-auto">
                  <button onClick={() => setView('gmail_request')} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${view === 'gmail_request' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Gmail Requests</button>
                  <button onClick={() => setView('settings')} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${view === 'settings' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Settings</button>
              </div>
              
              {view === 'gmail_request' && renderGmailRequests()}
              {view === 'settings' && renderSettings()}
          </div>
      );
  };

  // --- 9. Notice Manager ---
  const NoticeManagerView = () => {
      const [notice, setNotice] = useState({ title: '', desc: '', type: 'text' });
      return (
          <div className={`${CARD_STYLE} max-w-xl`}>
              <h3 className="font-bold text-lg mb-4">Broadcast Notification</h3>
              <div className="space-y-4">
                  <div><label className={LABEL_STYLE}>Notification Title</label><input className={INPUT_STYLE} onChange={e => setNotice({...notice, title: e.target.value})}/></div>
                  <div><label className={LABEL_STYLE}>Message Body</label><textarea rows={4} className={INPUT_STYLE} onChange={e => setNotice({...notice, desc: e.target.value})}/></div>
                  <div><label className={LABEL_STYLE}>Type</label>
                      <select className={INPUT_STYLE} onChange={e => setNotice({...notice, type: e.target.value})}>
                          <option value="text">Text Only</option>
                          <option value="popup">Popup Alert</option>
                      </select>
                  </div>
                  <button onClick={() => alert("Notice sent to all users!")} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                      <Send size={18}/> Send Broadcast
                  </button>
              </div>
          </div>
      )
  };

  // --- 10. Premium Manager ---
  const PremiumManagerView = () => {
      const [view, setView] = useState('requests');

      return (
          <div className={CARD_STYLE}>
              <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
                  <button onClick={() => setView('requests')} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${view === 'requests' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Requests</button>
                  <button onClick={() => setView('settings')} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${view === 'settings' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Settings</button>
              </div>

              {view === 'requests' && (
                  <div className="space-y-3">
                      {trxs.filter(t => t.type === 'purchase' && t.status === 'pending').map(t => (
                          <div key={t.id} className="p-4 border rounded-xl bg-amber-50 border-amber-200">
                              <div className="flex justify-between items-start">
                                  <UserInfoCard userId={t.userId} />
                                  <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded text-xs font-bold">Premium Request</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs mt-2 border-t border-amber-200 pt-2">
                                  <div><span className="block font-bold opacity-50">Method</span>{t.method}</div>
                                  <div><span className="block font-bold opacity-50">Number</span>{t.senderNumber}</div>
                                  <div><span className="block font-bold opacity-50">TrxID</span>{t.trxId}</div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                  <button onClick={() => handleTransactionAction(t.id, 'approved')} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold text-xs shadow-sm">Approve (Activate)</button>
                                  <button onClick={() => handleTransactionAction(t.id, 'rejected')} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold text-xs shadow-sm">Reject</button>
                              </div>
                          </div>
                      ))}
                      {trxs.filter(t => t.type === 'purchase' && t.status === 'pending').length === 0 && <div className="text-center py-10 text-gray-400">No pending premium requests.</div>}
                  </div>
              )}

              {view === 'settings' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <h4 className="font-bold text-indigo-600 border-b pb-2">General Config</h4>
                          <div><label className={LABEL_STYLE}>Activation Cost (৳)</label><input type="number" className={INPUT_STYLE} value={settings.premiumCost} onChange={e => setSettings({...settings, premiumCost: parseFloat(e.target.value)})}/></div>
                          <div className="flex items-center justify-between p-3 border rounded bg-gray-50">
                              <span className="text-sm font-bold">Enable Premium Features</span>
                              <button onClick={() => setSettings({...settings, premiumEnabled: !settings.premiumEnabled})} className={`text-2xl ${settings.premiumEnabled ? 'text-green-500' : 'text-gray-300'}`}>
                                  {settings.premiumEnabled ? <ToggleRight size={32}/> : <ToggleLeft size={32}/>}
                              </button>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <h4 className="font-bold text-indigo-600 border-b pb-2">Referral Commissions</h4>
                          <div className="grid grid-cols-3 gap-2">
                              <div><label className={LABEL_STYLE}>Level 1</label><input type="number" className={INPUT_STYLE} value={settings.refComL1} onChange={e => setSettings({...settings, refComL1: parseFloat(e.target.value)})}/></div>
                              <div><label className={LABEL_STYLE}>Level 2</label><input type="number" className={INPUT_STYLE} value={settings.refComL2} onChange={e => setSettings({...settings, refComL2: parseFloat(e.target.value)})}/></div>
                              <div><label className={LABEL_STYLE}>Level 3</label><input type="number" className={INPUT_STYLE} value={settings.refComL3} onChange={e => setSettings({...settings, refComL3: parseFloat(e.target.value)})}/></div>
                          </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-4">
                          <h4 className="font-bold text-indigo-600 border-b pb-2">Payment Numbers (Premium Only)</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className={LABEL_STYLE}>Bkash Personal/Merchant</label><input className={INPUT_STYLE} value={settings.premiumBkash} placeholder="Leave empty to use global" onChange={e => setSettings({...settings, premiumBkash: e.target.value})}/></div>
                              <div><label className={LABEL_STYLE}>Nagad Personal/Merchant</label><input className={INPUT_STYLE} value={settings.premiumNagad} placeholder="Leave empty to use global" onChange={e => setSettings({...settings, premiumNagad: e.target.value})}/></div>
                          </div>
                          <button onClick={() => saveSettings(settings)} className={BTN_PRIMARY}>Save Premium Settings</button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  // --- 11. Deposit Manager ---
  const DepositManagerView = () => {
      const [view, setView] = useState('requests');

      return (
          <div className={CARD_STYLE}>
              <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
                  <button onClick={() => setView('requests')} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${view === 'requests' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Requests</button>
                  <button onClick={() => setView('settings')} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${view === 'settings' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Settings</button>
              </div>

              {view === 'requests' && (
                  <div className="space-y-3">
                      {trxs.filter(t => t.type === 'deposit' && t.status === 'pending').map(t => (
                          <div key={t.id} className="p-4 border rounded-xl bg-purple-50 border-purple-200">
                              <UserInfoCard userId={t.userId} />
                              <div className="grid grid-cols-2 gap-4 mt-3 mb-3 bg-white p-3 rounded border">
                                  <div><span className="text-xs font-bold text-gray-500 block">Amount</span><span className="text-lg font-bold text-purple-700">৳{t.amount}</span></div>
                                  <div><span className="text-xs font-bold text-gray-500 block">Method</span><span className="text-sm font-bold">{t.method}</span></div>
                                  <div><span className="text-xs font-bold text-gray-500 block">Sender</span><span className="text-sm font-mono">{t.senderNumber}</span></div>
                                  <div><span className="text-xs font-bold text-gray-500 block">TrxID</span><span className="text-sm font-mono">{t.trxId}</span></div>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => handleTransactionAction(t.id, 'approved')} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold text-xs shadow-sm">Approve Balance</button>
                                  <button onClick={() => handleTransactionAction(t.id, 'rejected')} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold text-xs shadow-sm">Reject</button>
                              </div>
                          </div>
                      ))}
                      {trxs.filter(t => t.type === 'deposit' && t.status === 'pending').length === 0 && <div className="text-center py-10 text-gray-400">No pending deposits.</div>}
                  </div>
              )}

              {view === 'settings' && (
                  <div className="max-w-lg space-y-4">
                      <div><label className={LABEL_STYLE}>Global Bkash Number</label><input className={INPUT_STYLE} value={settings.bkash} onChange={e => setSettings({...settings, bkash: e.target.value})}/></div>
                      <div><label className={LABEL_STYLE}>Global Nagad Number</label><input className={INPUT_STYLE} value={settings.nagad} onChange={e => setSettings({...settings, nagad: e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className={LABEL_STYLE}>Min Deposit</label><input type="number" className={INPUT_STYLE} value={settings.minDeposit} onChange={e => setSettings({...settings, minDeposit: parseFloat(e.target.value)})}/></div>
                          <div><label className={LABEL_STYLE}>Max Deposit</label><input type="number" className={INPUT_STYLE} value={settings.maxDeposit} onChange={e => setSettings({...settings, maxDeposit: parseFloat(e.target.value)})}/></div>
                      </div>
                      <button onClick={() => saveSettings(settings)} className={BTN_PRIMARY}>Update Deposit Settings</button>
                  </div>
              )}
          </div>
      );
  };

  // --- Layout Render ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-gray-900 text-white transform transition-transform duration-300 z-50 ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col shadow-2xl`}>
         <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">A</div>
                <div>
                    <h2 className="font-bold text-lg leading-tight">Admin Panel</h2>
                    <p className="text-[10px] text-gray-400">V2.5 Pro</p>
                </div>
            </div>
            <button onClick={() => setMenuOpen(false)} className="md:hidden text-gray-400"><X /></button>
         </div>
         
         <nav className="p-4 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
            <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <div className="pt-4 pb-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Management</div>
            <SidebarItem id="deposit" icon={Wallet} label="Deposit Manager" />
            <SidebarItem id="users" icon={Users} label="User Manager" />
            <SidebarItem id="tasks" icon={ClipboardList} label="Task Manager" />
            <SidebarItem id="typing" icon={Keyboard} label="Typing Jobs" />
            <SidebarItem id="quiz" icon={HelpCircle} label="Quiz Manager" />
            <SidebarItem id="social" icon={SmartphoneNfc} label="Account Sales" />
            <div className="pt-4 pb-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Financial</div>
            <SidebarItem id="premium" icon={Crown} label="Premium Manager" />
            <SidebarItem id="salary" icon={DollarSign} label="Salary Plans" />
            <div className="pt-4 pb-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">System</div>
            <SidebarItem id="notice" icon={Bell} label="Send Notice" />
            <SidebarItem id="global" icon={Settings} label="Global Settings" />
         </nav>

         <div className="p-4 border-t border-gray-800">
             <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-500 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition">
                 <LogOut size={18}/> Log Out
             </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* Topbar */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu className="text-gray-700" /></button>
                <h2 className="font-bold text-xl text-gray-800 capitalize">{activeTab.replace('_', ' ')}</h2>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> Admin Online
                </div>
            </div>
        </div>

        {/* Content Container */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
           {activeTab === 'dashboard' && <DashboardView />}
           {activeTab === 'users' && <UserManagerView />}
           {activeTab === 'tasks' && <TaskManagerView />}
           {activeTab === 'premium' && <PremiumManagerView />}
           {activeTab === 'typing' && <TypingManagerView />}
           {activeTab === 'quiz' && <QuizManagerView />}
           {activeTab === 'salary' && <SalaryManagerView />}
           {activeTab === 'social' && <SocialManagerView />}
           {activeTab === 'deposit' && <DepositManagerView />}
           {activeTab === 'notice' && <NoticeManagerView />}
           {activeTab === 'global' && <GlobalSettingsView />}
        </div>
      </div>
    </div>
  );
};
