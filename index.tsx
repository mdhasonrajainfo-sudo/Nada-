
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LandingPage, Auth } from './learning'; 
import { UserPanel } from './user.panel';
import { AdminPanel } from './admin.panel';
import { UserData } from './types';
import { supabase } from './supabaseClient';

// --- ADMIN CREDENTIALS CONFIGURATION ---
const ADMIN_CONFIG = {
    PHONE: '01455875542', 
    PASS: '855#@#@Gfewghu',
    SECURITY_CODE: '09464646',
    ID: 'admin_01', 
    REF_CODE: '123456' 
};

// --- SPECIFIC USER CONFIG (Auto-create if missing) ---
const USER_CONFIG = {
    PHONE: '01772209016',
    PASS: '01772209016',
    ID: 'user_01_demo'
};

const App = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [currentView, setCurrentView] = useState('landing'); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    const checkSession = async () => {
        const session = localStorage.getItem('supabase_session_user_id');
        if (session) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session)
                .maybeSingle();
            
            if (data && !error) {
                setCurrentUser(data);
            } else {
                // Session invalid
                localStorage.removeItem('supabase_session_user_id');
            }
        }
        setIsLoading(false);
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setCurrentView('admin_panel');
      } else {
        setCurrentView('user_panel');
      }
    }
  }, [currentUser]);

  const handleRegister = async (data: any) => {
    // Check if phone exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', data.phone)
        .maybeSingle();

    if (existingUser) {
      alert("User already exists! This phone number is registered.");
      return;
    }
    
    // Validate Referral
    let referrer = null;
    
    // Bypass DB check for default admin code
    if (data.refCode === ADMIN_CONFIG.REF_CODE) {
        referrer = { id: ADMIN_CONFIG.ID, referralJobQuota: 100 }; 
    } else {
        const { data: refData } = await supabase
            .from('users')
            .select('id, refCode, referralJobQuota')
            .eq('refCode', data.refCode)
            .maybeSingle();
        referrer = refData;
    }
    
    if (!referrer) {
        alert("Invalid Referral Code! Please use a valid code.");
        return;
    }
    
    // Update Referrer (Add 2 typing jobs bonus) - Only if it's a real user in DB
    if (referrer && referrer.id !== ADMIN_CONFIG.ID) {
       await supabase.from('users')
           .update({ referralJobQuota: (referrer.referralJobQuota || 0) + 2 })
           .eq('id', referrer.id);
    }

    // Generate a Unique ID
    const newUserId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const newUser: any = {
      id: newUserId, // FIXED: Added Explicit ID
      fullName: data.name,
      phone: data.phone,
      email: data.email,
      password: data.password,
      refCode: Math.floor(100000 + Math.random() * 900000).toString(),
      uplineRefCode: data.refCode,
      role: 'user',
      accountType: 'free',
      joiningDate: new Date().toISOString(),
      balanceFree: 0, // No sign up bonus
      balancePremium: 0,
      totalWithdraw: 0,
      isBlocked: false,
      referralJobQuota: 2,
      profileImage: "https://files.catbox.moe/oq7gs8.jpg"
    };

    const { data: created, error } = await supabase.from('users').insert([newUser]).select().single();

    if (error) {
        console.error("Registration Error:", error);
        alert("Registration Failed: " + error.message);
        return;
    }
    
    // Auto login
    if (created) {
        localStorage.setItem('supabase_session_user_id', created.id);
        setCurrentUser(created);
        alert(`Registration Successful! Welcome to Next Level Earn, ${created.fullName}.`);
    }
  };

  const handleLogin = async (phone: string, pass: string, securityCode?: string) => {
    // 1. ADMIN LOGIN LOGIC
    if (phone === ADMIN_CONFIG.PHONE && pass === ADMIN_CONFIG.PASS) {
        if (!securityCode) {
            return 'SECURITY_REQUIRED';
        }
        if (securityCode === ADMIN_CONFIG.SECURITY_CODE) {
            // Fetch admin user data
            let { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', ADMIN_CONFIG.ID)
                .maybeSingle();
            
            if (!data) {
                // Admin doesn't exist in new DB, create it automatically
                const newAdmin = {
                    id: ADMIN_CONFIG.ID,
                    fullName: 'Super Admin',
                    phone: ADMIN_CONFIG.PHONE,
                    password: ADMIN_CONFIG.PASS,
                    email: 'admin@system.com',
                    role: 'admin',
                    accountType: 'premium',
                    refCode: ADMIN_CONFIG.REF_CODE, 
                    uplineRefCode: 'MASTER',
                    joiningDate: new Date().toISOString(),
                    balanceFree: 0,
                    balancePremium: 0,
                    totalWithdraw: 0,
                    isBlocked: false,
                    referralJobQuota: 100,
                    profileImage: "https://files.catbox.moe/oq7gs8.jpg"
                };
                
                const { data: createdAdmin, error: createError } = await supabase.from('users').insert([newAdmin]).select().single();
                if (createdAdmin) {
                    data = createdAdmin;
                } else {
                    console.error("Admin creation failed:", createError);
                    alert("System Error: Could not initialize admin account.");
                    return false;
                }
            } else {
                if (data.phone !== ADMIN_CONFIG.PHONE) {
                     await supabase.from('users').update({ phone: ADMIN_CONFIG.PHONE }).eq('id', ADMIN_CONFIG.ID);
                     data.phone = ADMIN_CONFIG.PHONE;
                }
            }
            
            if (data) {
                localStorage.setItem('supabase_session_user_id', data.id);
                setCurrentUser(data);
                return true;
            }
        } else {
            return false; // Wrong security code
        }
    }

    // 2. SPECIFIC USER LOGIN
    if (phone === USER_CONFIG.PHONE && pass === USER_CONFIG.PASS) {
        let { data, error } = await supabase.from('users').select('*').eq('phone', USER_CONFIG.PHONE).maybeSingle();
        if (!data) {
             const demoUser = {
                id: USER_CONFIG.ID,
                fullName: 'Specific User',
                phone: USER_CONFIG.PHONE,
                password: USER_CONFIG.PASS,
                email: 'user@specific.com',
                refCode: '999999',
                uplineRefCode: ADMIN_CONFIG.REF_CODE,
                role: 'user',
                accountType: 'free',
                joiningDate: new Date().toISOString(),
                balanceFree: 0,
                balancePremium: 0,
                totalWithdraw: 0,
                isBlocked: false,
                referralJobQuota: 5,
                profileImage: "https://files.catbox.moe/oq7gs8.jpg"
            };
            const { data: createdUser } = await supabase.from('users').insert([demoUser]).select().single();
            if(createdUser) data = createdUser;
        }
        
        if (data) {
            localStorage.setItem('supabase_session_user_id', data.id);
            setCurrentUser(data);
            alert(`Login Successful! Welcome back, ${data.fullName}.`);
            return true;
        }
    }

    // 3. NORMAL USER LOGIN
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .eq('password', pass)
        .maybeSingle();

    if (data) {
      if(data.isBlocked) {
          alert("Account Blocked by Admin.");
          return false;
      }
      localStorage.setItem('supabase_session_user_id', data.id);
      setCurrentUser(data);
      alert(`Login Successful! Welcome back, ${data.fullName}.`);
      return true;
    } else {
      return false; 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('supabase_session_user_id');
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const handleProfileUpdate = (updatedUser: UserData) => {
     setCurrentUser(updatedUser);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center text-emerald-600 font-bold bg-gray-50">
      <div className="text-center animate-pulse">
          <h2 className="text-xl">Next Level Earn</h2>
          <p className="text-xs text-gray-400">Loading Application...</p>
      </div>
  </div>;

  // Routing Logic
  if (currentView === 'landing') return <LandingPage onNavigate={(page) => setCurrentView(page)} />;
  if (currentView === 'login') return <Auth mode="login" onLogin={handleLogin} onBack={() => setCurrentView('register')} />;
  if (currentView === 'register') return <Auth mode="register" onRegister={handleRegister} onBack={() => setCurrentView('login')} />;

  if (currentView === 'admin_panel' && currentUser) return <AdminPanel user={currentUser} onLogout={handleLogout} />;
  if (currentView === 'user_panel' && currentUser) return <UserPanel user={currentUser} onLogout={handleLogout} onUpdateUser={handleProfileUpdate} />;

  return <div>Loading...</div>;
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
