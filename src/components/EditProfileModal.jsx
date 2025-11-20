import React, { useState } from 'react';
import { X, Save, User, Phone, MapPin } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditProfileModal({ user, db, appId, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    phone: user.phone || '',
    location: user.location || ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        phone: formData.phone,
        location: formData.location
      });
      // Update local state in parent
      onUpdate({ ...user, ...formData });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
              <User size={18} className="text-gray-400 mr-3"/>
              <input 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="bg-transparent w-full outline-none text-gray-800 font-medium"
                placeholder="Your Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
              <Phone size={18} className="text-gray-400 mr-3"/>
              <input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-transparent w-full outline-none text-gray-800 font-medium"
                placeholder="+91 98765 43210"
                type="tel"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location / Village</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
              <MapPin size={18} className="text-gray-400 mr-3"/>
              <input 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="bg-transparent w-full outline-none text-gray-800 font-medium"
                placeholder="e.g. Ludhiana, Punjab"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4 hover:bg-emerald-700 flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : <>Save Changes <Save size={18}/></>}
          </button>
        </form>
      </div>
    </div>
  );
}