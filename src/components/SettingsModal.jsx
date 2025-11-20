import React, { useState } from 'react';
import { X, Globe, Bell, Shield, FileText, ChevronRight, Moon, Trash2, Check } from 'lucide-react';
import { deleteUser } from 'firebase/auth';

export default function SettingsModal({ user, auth, onClose }) {
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState('System'); // System, On, Off

  const handleDeleteAccount = async () => {
    if (window.confirm("ARE YOU SURE? This will permanently delete your account and data. This action cannot be undone.")) {
        try {
            await deleteUser(auth.currentUser);
            // App.jsx auth listener will handle the redirect
            alert("Account deleted.");
        } catch (error) {
            alert("Please log in again recently to delete your account.");
        }
    }
  };

  const SettingToggle = ({ icon: Icon, label, value, onToggle, color }) => (
    <div className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 mb-3">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gray-50 ${color}`}><Icon size={20} /></div>
            <span className="font-medium text-gray-700">{label}</span>
        </div>
        <button 
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-7' : 'left-1'}`}></div>
        </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-gray-100 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
         <h2 className="text-xl font-bold text-gray-900">Settings</h2>
         <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={24}/></button>
      </div>

      <div className="p-4 space-y-6 pb-20">
        {/* Personalization */}
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Personalization</h3>
            
            {/* Language Picker */}
            <div className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Globe size={20} /></div>
                    <span className="font-medium text-gray-700">Language</span>
                </div>
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-gray-50 border-none text-sm font-bold text-gray-600 outline-none p-1 rounded"
                >
                    <option>English</option>
                    <option>Hindi (हिंदी)</option>
                    <option>Punjabi (ਪੰਜਾਬੀ)</option>
                    <option>Marathi (मराठी)</option>
                    <option>Tamil (தமிழ்)</option>
                </select>
            </div>

            <SettingToggle 
                icon={Bell} 
                label="Notifications" 
                value={notifications} 
                onToggle={() => setNotifications(!notifications)} 
                color="text-orange-500" 
            />

            {/* Dark Mode Dropdown */}
            <div className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><Moon size={20} /></div>
                    <span className="font-medium text-gray-700">Dark Mode</span>
                </div>
                <select 
                    value={darkMode} 
                    onChange={(e) => setDarkMode(e.target.value)}
                    className="bg-gray-50 border-none text-sm font-bold text-gray-600 outline-none p-1 rounded"
                >
                    <option>System</option>
                    <option>On</option>
                    <option>Off</option>
                </select>
            </div>
        </div>

        {/* Legal */}
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Support & Legal</h3>
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50 text-green-600"><Shield size={20} /></div>
                    <span className="font-medium text-gray-700">Privacy Policy</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 text-gray-600"><FileText size={20} /></div>
                    <span className="font-medium text-gray-700">Terms of Service</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
            </button>
        </div>

        {/* Danger Zone */}
        <div>
            <h3 className="text-xs font-bold text-red-400 uppercase mb-3 tracking-wider">Danger Zone</h3>
            <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white text-red-600"><Trash2 size={20} /></div>
                    <span className="font-medium text-red-700">Delete Account</span>
                </div>
            </button>
        </div>

        <div className="text-center mt-4">
            <p className="text-xs text-gray-400">TractorShare v2.0 (Production)</p>
        </div>
      </div>
    </div>
  );
}