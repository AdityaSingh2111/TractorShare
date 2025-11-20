import React from 'react';
import { X, Globe, Bell, Shield, FileText, ChevronRight, Moon } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  const SettingItem = ({ icon: Icon, label, value, color = "text-gray-600" }) => (
    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors mb-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-white rounded-lg shadow-sm ${color}`}>
          <Icon size={20} />
        </div>
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs font-bold text-gray-400">{value}</span>}
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-gray-100 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
         <h2 className="text-xl font-bold text-gray-900">Settings</h2>
         <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={24}/></button>
      </div>

      <div className="p-4 space-y-6">
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Preferences</h3>
            <SettingItem icon={Globe} label="Language" value="English" color="text-blue-500" />
            <SettingItem icon={Bell} label="Notifications" value="On" color="text-orange-500" />
            <SettingItem icon={Moon} label="Dark Mode" value="Off" color="text-purple-500" />
        </div>

        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Support & Legal</h3>
            <SettingItem icon={Shield} label="Privacy Policy" color="text-green-500" />
            <SettingItem icon={FileText} label="Terms of Service" color="text-gray-500" />
        </div>

        <div className="text-center mt-8">
            <p className="text-xs text-gray-400">TractorShare v1.0.2 (Build 2025)</p>
            <p className="text-xs text-gray-300 mt-1">Made with ❤️ for Farmers</p>
        </div>
      </div>
    </div>
  );
}