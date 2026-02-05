import React from 'react';
import { Smartphone, Download, Send, Users, Youtube, CheckCircle, Crown } from 'lucide-react';

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