import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Send, Users, Youtube, CheckCircle, Crown, User, Lock, Phone, Mail, AlertTriangle, XCircle, X, Search, ShieldCheck } from 'lucide-react';
import { supabase } from './supabaseClient';

// --- Landing Page Component ---
export const LandingPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <div className="min-h-screen bg-white text-gray-800 pb-10 font-sans">
      {/* Navbar */}
      <div className="flex justify-between items-center p-5 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">N</div>
           <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Next Level Earn</h1>
        </div>
        <button onClick={() => onNavigate('login')} className="px-5 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-lg hover:bg-emerald-700 transition">
          Login
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-emerald-900 text-white py-16 px-6 rounded-b-[3rem] shadow-2xl">
        <div className="relative z-10 text-center space-y-4">
          <span className="inline-block px-3 py-1 bg-emerald-800 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-700"> #1 Trusted Platform</span>
          <h2 className="text-4xl font-extrabold leading-tight">
            Earn Money From <br/><span className="text-emerald-400">Home Daily</span>
          </h2>
          <p className="text-emerald-100 text-sm max-w-xs mx-auto">
            Trusted by 15k+ users. Complete tasks and withdraw instantly to Bkash/Nagad.
          </p>
          <div className="pt-6 flex flex-col gap-3">
            <button onClick={() => onNavigate('register')} className="w-full bg-white text-emerald-900 py-3 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition transform">
              Join For Free
            </button>
          </div>
        </div>
      </div>

      {/* App Download Section */}
      <div className="mx-4 -mt-10 relative z-20 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-center">
         <Smartphone className="w-12 h-12 text-emerald-600 mx-auto mb-2"/>
         <h3 className="font-bold text-lg text-gray-800">Download Our App</h3>
         <p className="text-xs text-gray-500 mb-4">For better experience and fast work</p>
         <button className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
           <Download size={18}/> Download Android App
         </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-6 mt-8 text-center">
         <div className="bg-emerald-50 p-3 rounded-xl">
            <h4 className="font-bold text-emerald-700">15K+</h4>
            <p className="text-[10px] text-gray-500">Users</p>
         </div>
         <div className="bg-emerald-50 p-3 rounded-xl">
            <h4 className="font-bold text-emerald-700">৳8.5L</h4>
            <p className="text-[10px] text-gray-500">Paid</p>
         </div>
         <div className="bg-emerald-50 p-3 rounded-xl">
            <h4 className="font-bold text-emerald-700">24/7</h4>
            <p className="text-[10px] text-gray-500">Support</p>
         </div>
      </div>

      {/* Social Links */}
      <div className="mt-10 px-6">
        <h3 className="text-center font-bold text-gray-800 mb-4">Connect With Us</h3>
        <div className="grid grid-cols-3 gap-3">
           <button className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-xl text-blue-600">
             <Send size={24} className="mb-1"/>
             <span className="text-[10px] font-bold">Channel</span>
           </button>
           <button className="flex flex-col items-center justify-center p-3 bg-indigo-50 rounded-xl text-indigo-600">
             <Users size={24} className="mb-1"/>
             <span className="text-[10px] font-bold">Group</span>
           </button>
           <button className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-xl text-red-600">
             <Youtube size={24} className="mb-1"/>
             <span className="text-[10px] font-bold">Tutorial</span>
           </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-gray-400 text-xs pb-6">
        <p>© 2024 Next Level Earn. All rights reserved.</p>
        <p className="mt-1">Founder: Md Admin Islam</p>
      </div>
    </div>
  );
};

// --- Custom Auth Popup ---
const AuthPopup = ({ isOpen, type, title, message, onClose }: any) => {
    if (!isOpen) return null;
    
    const colors: any = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-orange-500'
    };
    const icons: any = {
        success: <CheckCircle className="w-12 h-12 text-white mb-2"/>,
        error: <XCircle className="w-12 h-12 text-white mb-2"/>,
        warning: <AlertTriangle className="w-12 h-12 text-white mb-2"/>
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden transform transition-all scale-100 animate-in zoom-in-95">
                <div className={`${colors[type]} p-6 flex flex-col items-center justify-center text-center`}>
                    {icons[type]}
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                </div>
                <div className="p-6 text-center">
                    <p className="text-gray-600 mb-6 text-sm">{message}</p>
                    <button onClick={onClose} className={`w-full py-3 rounded-xl font-bold text-white shadow-md ${colors[type]} brightness-90 hover:brightness-100 transition`}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Auth Component ---
export const Auth = ({ mode, onLogin, onRegister, onBack }: any) => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', refCode: ''
  });
  const [referrer, setReferrer] = useState<any>(null);
  const [refError, setRefError] = useState('');
  
  // Security Code State
  const [needsSecurity, setNeedsSecurity] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  
  // Popup State
  const [popup, setPopup] = useState<{show: boolean, type: 'success' | 'error' | 'warning', title: string, msg: string}>({ show: false, type: 'success', title: '', msg: '' });

  // Handle Referral Lookup
  useEffect(() => {
      const checkReferrer = async () => {
          if (mode === 'register' && formData.refCode.length > 3) {
              // Note: '123456' is handled as special admin case in DB logic usually, or we can check here
              const { data, error } = await supabase
                  .from('users')
                  .select('id, fullName, profileImage, refCode')
                  .eq('refCode', formData.refCode)
                  .single();

              if (data) {
                   setReferrer(data);
                   setRefError('');
              } else {
                   setReferrer(null);
                   setRefError('ভুল রেফারেল কোড! সঠিক কোড দিন।');
              }
          } else {
              setReferrer(null);
              setRefError('');
          }
      };
      
      const debounce = setTimeout(checkReferrer, 500);
      return () => clearTimeout(debounce);
  }, [formData.refCode, mode]);

  const showAlert = (type: 'success' | 'error' | 'warning', title: string, msg: string) => {
      setPopup({ show: true, type, title, msg });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
       if (needsSecurity) {
           // Phase 2: Security Code Check
           const success = await onLogin(formData.phone, formData.password, securityCode);
           if (!success) showAlert('error', 'Login Failed', 'Invalid Security Code.');
           return;
       }

       // Basic validation
       if(formData.phone.length < 11) {
           showAlert('warning', 'Warning', 'Phone number must be at least 11 digits.');
           return;
       }
       
       // Pass to parent. If returns "SECURITY_REQUIRED", show input
       const result = await onLogin(formData.phone, formData.password);
       if (result === 'SECURITY_REQUIRED') {
           setNeedsSecurity(true);
       } else if(!result) {
           showAlert('error', 'Login Failed', 'Invalid Phone Number or Password.');
       }
    } else {
       if(formData.password.length < 6) {
           showAlert('warning', 'Weak Password', 'Password must be at least 6 characters.');
           return;
       }
       if(!formData.refCode) {
           showAlert('warning', 'Referral Code Required', 'You must enter a referral code.');
           return;
       }
       if(refError) {
           showAlert('error', 'Invalid Referral', 'Please enter a valid referral code to proceed.');
           return;
       }
       onRegister(formData);
    }
  };

  const INPUT_STYLE = "w-full pl-10 p-3 rounded-xl border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://files.catbox.moe/oq7gs8.jpg" 
            alt="Logo" 
            className="w-24 h-auto object-contain mb-4 drop-shadow-md rounded-lg"
          />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Next Level Earn</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">{mode === 'login' ? 'Welcome Back!' : 'Create New Account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                <input required type="text" className={INPUT_STYLE} placeholder="Full Name" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                <input required type="email" className={INPUT_STYLE} placeholder="Email Address" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </>
          )}
          
          {/* If security not needed yet, show standard fields */}
          {!needsSecurity && (
              <>
                <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                    <input required type="text" className={INPUT_STYLE} placeholder="Mobile Number" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                    <input required type="password" className={INPUT_STYLE} placeholder="Password" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </>
          )}

          {/* Security Code Input for Admin */}
          {needsSecurity && (
              <div className="animate-in fade-in zoom-in">
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-3 text-center">
                      <p className="text-red-700 font-bold text-xs flex items-center justify-center gap-1"><ShieldCheck size={14}/> Admin Security Verification</p>
                  </div>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3.5 text-red-500" size={18}/>
                    <input autoFocus required type="password" className={`${INPUT_STYLE} border-red-300 focus:ring-red-500`} placeholder="Enter Security Code" 
                        value={securityCode} onChange={e => setSecurityCode(e.target.value)} />
                  </div>
              </div>
          )}

          {mode === 'login' && !needsSecurity && (
            <div className="text-right">
              <button type="button" onClick={() => showAlert('warning', 'Reset Password', 'Please contact admin on Telegram to reset password.')} className="text-xs text-emerald-600 font-bold hover:underline">
                Forgot Password?
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <div className="relative">
                 <Users className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                 <input required type="text" className={`${INPUT_STYLE} ${refError ? 'border-red-500 ring-1 ring-red-500' : referrer ? 'border-green-500 ring-1 ring-green-500' : ''}`} placeholder="Referral Code (Required)" 
                  value={formData.refCode} onChange={e => setFormData({...formData, refCode: e.target.value})} />
              </div>
              
              {refError && <p className="text-xs text-red-500 mt-1 font-bold flex items-center gap-1"><AlertTriangle size={12}/> {refError}</p>}
              
              {referrer && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 animate-in fade-in">
                      <img src={referrer.profileImage || "https://files.catbox.moe/oq7gs8.jpg"} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"/>
                      <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">Referred By</p>
                          <p className="text-sm font-bold text-gray-800">{referrer.fullName}</p>
                          <p className="text-[10px] text-emerald-600 font-mono">ID: {referrer.id.substring(0,8)}...</p>
                      </div>
                  </div>
              )}
            </div>
          )}

          <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform active:scale-95 transition">
            {needsSecurity ? 'VERIFY SECURITY' : mode === 'login' ? 'LOGIN' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-500">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={onBack} className="text-emerald-600 font-bold hover:underline">
              {mode === 'login' ? 'Register Now' : 'Login Here'}
            </button>
          </p>
        </div>
      </div>
      
      <AuthPopup 
        isOpen={popup.show} 
        type={popup.type} 
        title={popup.title} 
        message={popup.msg} 
        onClose={() => setPopup({...popup, show: false})} 
      />
    </div>
  );
};
