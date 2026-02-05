
import React, { useState, useEffect } from 'react';
import { User, Lock, Phone, Mail, CheckCircle, AlertTriangle, XCircle, X, ShieldCheck, Users } from 'lucide-react';
import { supabase } from './supabaseClient';

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
              
              // Handle default admin code explicitly to avoid "Invalid" error if admin isn't in DB yet
              if (formData.refCode === '123456') {
                   setReferrer({
                       fullName: 'Official Admin',
                       id: 'admin_01',
                       profileImage: 'https://files.catbox.moe/oq7gs8.jpg'
                   });
                   setRefError('');
                   return;
              }

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
              
              <div className="text-center mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 mb-1">ডিফল্ট রেফারেল কোড</p>
                  <p className="text-lg font-bold text-emerald-600 tracking-widest">123456</p>
                  <p className="text-[10px] text-red-400 mt-1">*সঠিক রেফার কোড ছাড়া একাউন্ট হবে না</p>
              </div>
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
