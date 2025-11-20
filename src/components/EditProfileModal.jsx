import React, { useState, useRef } from 'react';
import { X, Save, User, Phone, MapPin, FileText, Camera, AlertCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditProfileModal({ user, db, appId, onClose, onUpdate, forceCompletion = false }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    phone: user.phone || '',
    location: user.location || '',
    bio: user.bio || '',
    photoURL: user.photoURL || ''
  });

  const [error, setError] = useState('');

  // Handle Image Upload (Convert to Base64 for simple storage without Firebase Storage bucket)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        alert("Image is too large! Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.displayName.trim() || !formData.phone.trim() || !formData.location.trim()) {
      setError("Name, Phone, and Location are compulsory.");
      return;
    }

    if (formData.phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        photoURL: formData.photoURL
      });
      
      onUpdate({ ...user, ...formData });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
             <h2 className="text-xl font-bold text-gray-900">{forceCompletion ? "Complete Your Profile" : "Edit Profile"}</h2>
             {forceCompletion && <p className="text-xs text-red-500 font-medium mt-1">Details required to proceed.</p>}
          </div>
          {!forceCompletion && (
            <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-100 border border-gray-200 transition-colors">
              <X size={20} className="text-gray-500"/>
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Image Uploader */}
            <div className="flex flex-col items-center">
               <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                  <img 
                    src={formData.photoURL || "https://via.placeholder.com/150"} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow-sm group-hover:border-emerald-200 transition-all"
                  />
                  <div className="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full text-white shadow-md group-hover:scale-110 transition-transform">
                     <Camera size={16} />
                  </div>
               </div>
               <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
               <p className="text-xs text-gray-400 mt-2">Tap to change photo</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name <span className="text-red-500">*</span></label>
              <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 rounded-xl px-3 py-3 transition-all">
                <User size={18} className="text-gray-400 mr-3"/>
                <input 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="bg-transparent w-full outline-none text-gray-800 font-medium"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number <span className="text-red-500">*</span></label>
              <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 rounded-xl px-3 py-3 transition-all">
                <Phone size={18} className="text-gray-400 mr-3"/>
                <input 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-transparent w-full outline-none text-gray-800 font-medium"
                  placeholder="e.g. 98765 43210"
                  type="tel"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location / Village <span className="text-red-500">*</span></label>
              <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 rounded-xl px-3 py-3 transition-all">
                <MapPin size={18} className="text-gray-400 mr-3"/>
                <input 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="bg-transparent w-full outline-none text-gray-800 font-medium"
                  placeholder="e.g. Ludhiana, Punjab"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / About You</label>
              <div className="flex items-start bg-gray-50 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 rounded-xl px-3 py-3 transition-all">
                <FileText size={18} className="text-gray-400 mr-3 mt-1"/>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="bg-transparent w-full outline-none text-gray-800 font-medium resize-none"
                  placeholder="I own 2 tractors and provide services in..."
                  rows={3}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Saving Profile...' : <>Save Changes <Save size={18}/></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}