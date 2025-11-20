import GeminiAssistant from './components/ai/GeminiAssistant';
import LoginScreen from './components/LoginScreen';
import EditProfileModal from './components/EditProfileModal';
import SettingsModal from './components/SettingsModal';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Search, MapPin, Calendar, User, ShieldCheck, Star, 
  PlusCircle, Home, Clock, CheckCircle, ChevronLeft, DollarSign, 
  Settings, LogOut, Edit2, TrendingUp, XCircle, Check, AlertTriangle
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, query, onSnapshot, 
  doc, serverTimestamp, setDoc, getDoc, where, updateDoc 
} from 'firebase/firestore';

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAizMFLZ4Z6UxDwXGIe5wsQ1fE5dYHbPxs",
  authDomain: "tractorshare-d8902.firebaseapp.com",
  projectId: "tractorshare-d8902",
  storageBucket: "tractorshare-d8902.firebasestorage.app",
  messagingSenderId: "237464199962",
  appId: "1:237464199962:web:82514e50fc849d5c8d02a3",
  measurementId: "G-JJLV4LMSLM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = '1:237464199962:web:82514e50fc849d5c8d02a3';

const ensureUserProfile = async (user) => {
  const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const newProfile = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role: 'renter', 
      phone: '',
      location: '',
      bio: '',
      createdAt: serverTimestamp()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    return userSnap.data();
  }
};

// --- COMPONENTS ---
// (Nav, Header, etc. remain mostly same, but using better transition classes)
const Header = ({ onOpenSettings }) => (
  <div className="bg-emerald-600 text-white p-4 sticky top-0 z-40 shadow-md flex justify-between items-center">
    <div className="flex items-center gap-2">
      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
        <Tractor size={24} className="text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight">TractorShare</h1>
        <p className="text-xs text-emerald-100 opacity-90">Rent. Farm. Grow.</p>
      </div>
    </div>
    <button onClick={onOpenSettings} className="bg-emerald-700/50 p-2 rounded-full hover:bg-emerald-700 transition-all active:scale-95">
      <Settings size={20} />
    </button>
  </div>
);

const ListingCard = ({ item, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group">
    <div className="relative h-40 bg-gray-200 overflow-hidden">
      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-emerald-800 flex items-center gap-1 shadow-sm">
        <Star size={12} className="fill-yellow-400 text-yellow-400" /> {item.rating}
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
      <div className="flex items-center text-gray-500 text-xs mb-2 mt-1">
        <MapPin size={12} className="mr-1 text-emerald-500" /> {item.location}
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wider">{item.type}</span>
        <span className="block font-bold text-gray-900">₹{item.price}<span className="text-gray-400 text-xs font-normal">/hr</span></span>
      </div>
    </div>
  </div>
);

const BottomNav = ({ activeTab, setActiveTab }) => {
  const NavIcon = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center w-16 transition-colors ${activeTab === id ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} className={`transition-transform ${activeTab === id ? 'scale-110' : ''}`} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe">
      <NavIcon icon={Home} label="Home" id="home" />
      <NavIcon icon={Search} label="Search" id="search" />
      <div className="relative -top-6">
        <button 
          onClick={() => setActiveTab('add')}
          className="bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white p-4 rounded-full shadow-xl shadow-emerald-200 hover:shadow-emerald-300 transform transition hover:scale-105 active:scale-95"
        >
          <PlusCircle size={28} />
        </button>
      </div>
      <NavIcon icon={Clock} label="Bookings" id="bookings" />
      <NavIcon icon={User} label="Profile" id="profile" />
    </div>
  );
};

// --- MAIN APP ---
export default function TractorShareApp() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  
  // Data & UI States
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myListings, setMyListings] = useState([]); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [role, setRole] = useState('renter');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [forceProfileComplete, setForceProfileComplete] = useState(false);

  // 1. AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const dbProfile = await ensureUserProfile(currentUser);
        const mergedUser = { ...currentUser, ...dbProfile };
        setUser(mergedUser);
        if (dbProfile?.role) setRole(dbProfile.role);

        // CHECK COMPULSORY FIELDS
        if (!dbProfile.phone || !dbProfile.location) {
          setForceProfileComplete(true);
          setIsEditProfileOpen(true);
        }
      } else {
        setUser(null);
      }
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. DATA FETCHING
  useEffect(() => {
    if (!user) return;

    // A. Public Listings
    const listingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'listings');
    const unsubListings = onSnapshot(query(listingsRef), (snap) => {
      setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // B. Bookings
    const bookingsRef = collection(db, 'artifacts', appId, 'bookings');
    let q = role === 'owner' 
        ? query(bookingsRef, where('ownerId', '==', user.uid))
        : query(bookingsRef, where('requesterId', '==', user.uid));

    const unsubBookings = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // C. My Listings (Owner)
    if (role === 'owner') {
        const myListingsQuery = query(listingsRef, where('ownerId', '==', user.uid));
        const unsubMyListings = onSnapshot(myListingsQuery, (snap) => {
            setMyListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => { unsubListings(); unsubBookings(); unsubMyListings(); };
    }

    return () => { unsubListings(); unsubBookings(); };
  }, [user, role]);

  // --- LOGIC ---
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    signOut(auth);
  };

  const handleBooking = async (item, hours) => {
    if (!user) return;
    if (forceProfileComplete) return alert("Please complete your profile first.");
    
    const bookingData = {
        listingId: item.id,
        listingTitle: item.title,
        listingImage: item.image,
        pricePerHour: item.price,
        hours: hours,
        totalCost: item.price * hours,
        status: 'pending',
        date: new Date().toISOString(),
        ownerId: item.ownerId || 'system',
        requesterId: user.uid,
        requesterName: user.displayName,
        requesterPhone: user.phone // Pass phone so owner can call
    };

    await addDoc(collection(db, 'artifacts', appId, 'bookings'), bookingData);
    alert("Request sent! The owner will contact you at " + user.phone);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
      const bookingRef = doc(db, 'artifacts', appId, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: newStatus });
  };

  const handleAddListing = async (e) => {
      e.preventDefault();
      if (forceProfileComplete) return alert("Complete profile first.");
      
      const form = e.target;
      const data = {
          title: form.title.value,
          type: form.type.value,
          price: Number(form.price.value),
          location: form.location.value,
          image: "https://images.unsplash.com/photo-1592875820939-c47839887c58?auto=format&fit=crop&q=80&w=800",
          rating: 5.0,
          verified: true,
          ownerName: user.displayName,
          description: form.description.value,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          specs: { fuel: "Diesel" }
      };
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), data);
      form.reset();
      alert("Listing Published Successfully!");
      setActiveTab('home');
  };

  // --- VIEWS ---
  const renderHome = () => {
    if (role === 'owner') {
        // OWNER DASHBOARD
        const earnings = bookings.filter(b => b.status === 'confirmed').reduce((acc, curr) => acc + curr.totalCost, 0);
        return (
            <div className="pb-24 p-4">
                <div className="bg-gray-900 text-white rounded-2xl p-6 mb-6 shadow-xl">
                    <h2 className="text-lg font-medium text-gray-400">Total Earnings</h2>
                    <div className="text-4xl font-bold mt-2">₹{earnings}</div>
                    <div className="flex gap-2 mt-4">
                        <div className="bg-gray-800 px-3 py-1 rounded-lg text-xs text-green-400 flex items-center gap-1"><TrendingUp size={12}/> +12% this week</div>
                    </div>
                </div>

                <h3 className="font-bold text-gray-800 text-lg mb-4">Your Fleet</h3>
                {myListings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">You haven't listed any equipment.</p>
                        <button onClick={() => setActiveTab('add')} className="text-emerald-600 font-bold text-sm mt-2">Add First Tractor</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myListings.map(item => (
                            <div key={item.id} className="flex items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                <img src={item.image} className="w-12 h-12 rounded-lg object-cover"/>
                                <div className="ml-3 flex-1">
                                    <div className="font-bold text-sm">{item.title}</div>
                                    <div className="text-xs text-green-600 font-bold">Live</div>
                                </div>
                                <button className="text-gray-400"><Edit2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    // RENTER HOME
    return (
        <div className="pb-24">
          <div className="p-4">
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 mb-6 relative overflow-hidden">
               <div className="relative z-10">
                   <h2 className="text-2xl font-bold mb-2">Harvest Season?</h2>
                   <p className="text-emerald-100 text-sm mb-4 w-2/3">Find Rotavators, Harvesters & more nearby.</p>
                   <button onClick={() => setActiveTab('search')} className="bg-white text-emerald-800 px-4 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-transform">Book Now</button>
               </div>
               <Tractor className="absolute -bottom-4 -right-4 text-emerald-500 opacity-40 w-32 h-32 transform -rotate-12" />
            </div>

            <h3 className="font-bold text-gray-800 text-lg mb-4">Categories</h3>
            {/* CATEGORIES (Expanded for India) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Tractor', 'Rotavator', 'Harvester', 'Trolley', 'Drone', 'Thresher', 'Seeder'].map((type) => (
                <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterType === type ? 'bg-gray-900 text-white shadow-lg scale-105' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    {type}
                </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
                {listings.filter(i => filterType === 'All' || i.type === filterType).map(item => (
                    <ListingCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                ))}
            </div>
          </div>
        </div>
    );
  };

  const renderBookings = () => (
      <div className="pb-24 p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{role === 'owner' ? 'Incoming Requests' : 'My Bookings'}</h2>
          {bookings.length === 0 ? (
              <div className="text-center text-gray-500 mt-10"><Calendar size={48} className="mx-auto mb-4 text-gray-300" /><p>No records found.</p></div>
          ) : (
              <div className="space-y-4">
                  {bookings.map(booking => (
                      <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex gap-4 mb-3">
                              <img src={booking.listingImage} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <h3 className="font-bold text-gray-800 text-sm">{booking.listingTitle}</h3>
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{booking.status}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">{role === 'owner' ? `Requester: ${booking.requesterName}` : `Duration: ${booking.hours} hrs`}</div>
                                  {role === 'owner' && <div className="text-xs text-gray-500">Ph: {booking.requesterPhone}</div>}
                                  <div className="font-bold text-emerald-600 mt-1">₹{booking.totalCost}</div>
                              </div>
                          </div>
                          {role === 'owner' && booking.status === 'pending' && (
                              <div className="flex gap-2 mt-2 border-t pt-3">
                                  <button onClick={() => updateBookingStatus(booking.id, 'rejected')} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold flex justify-center gap-1"><XCircle size={14}/> Reject</button>
                                  <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs font-bold flex justify-center gap-1"><Check size={14}/> Accept</button>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderProfile = () => (
      <div className="pb-24 p-4">
          <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500" />
              ) : (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-2xl font-bold">{user?.displayName?.[0] || "U"}</div>
              )}
              <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{user?.displayName}</h2>
                  <p className="text-gray-500 text-xs">{user?.location}</p>
                  <p className="text-emerald-600 text-xs font-medium mt-1">{user?.phone}</p>
              </div>
              <button onClick={() => setIsEditProfileOpen(true)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-200"><Edit2 size={18} className="text-gray-600"/></button>
          </div>
          
          {user?.bio && (
             <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 italic">
                "{user.bio}"
             </div>
          )}

          <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-emerald-900">Switch Mode</span>
                  <div className="flex bg-white rounded-lg p-1 shadow-sm">
                      <button onClick={() => setRole('renter')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${role === 'renter' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500'}`}>Renter</button>
                      <button onClick={() => setRole('owner')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${role === 'owner' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500'}`}>Owner</button>
                  </div>
              </div>
              <p className="text-xs text-emerald-700">{role === 'renter' ? "Find equipment to rent." : "Manage your listings."}</p>
          </div>

          <div className="space-y-2">
              <button onClick={() => setIsSettingsOpen(true)} className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3"><Settings size={20} className="text-gray-500" /><span className="font-medium text-gray-700">Settings</span></div>
              </button>
              <button onClick={() => setShowLogoutConfirm(true)} className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 text-red-500 transition-colors">
                  <div className="flex items-center gap-3"><LogOut size={20} /><span className="font-medium">Log Out</span></div>
              </button>
          </div>
      </div>
  );

  // --- RENDER FLOW ---
  if (initializing) return <div className="min-h-screen bg-emerald-600 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div></div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-emerald-200">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'search' && <div className="pb-24 p-4"><h3 className="font-bold text-gray-800 text-lg mb-4">Search Equipment</h3>{/* Reusing filter logic here... */}<div className="grid grid-cols-1 gap-4 mt-4">{listings.map(item => <ListingCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />)}</div></div>}
        {activeTab === 'add' && (
             <div className="pb-24 p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6">List New Equipment</h2>
                <form onSubmit={handleAddListing} className="space-y-4">
                    <div><label className="block text-xs font-bold mb-1">Title</label><input name="title" required className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Sonalika Rotavator"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">Type</label>
                            <select name="type" className="w-full border p-3 rounded-lg bg-white">
                                <option>Tractor</option><option>Rotavator</option><option>Harvester</option><option>Trolley</option><option>Thresher</option><option>Drone</option>
                            </select>
                        </div>
                        <div><label className="block text-xs font-bold mb-1">Price/Hr (₹)</label><input name="price" type="number" required className="w-full border p-3 rounded-lg"/></div>
                    </div>
                    <div><label className="block text-xs font-bold mb-1">Location</label><input name="location" required className="w-full border p-3 rounded-lg"/></div>
                    <div><label className="block text-xs font-bold mb-1">Description</label><textarea name="description" className="w-full border p-3 rounded-lg"/></div>
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg">Publish Listing</button>
                </form>
            </div>
        )}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'profile' && renderProfile()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* --- MODALS --- */}

      {/* Booking Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-white p-4 animate-in slide-in-from-bottom-10">
             <button onClick={() => setSelectedItem(null)} className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><ChevronLeft/></button>
             <div className="mt-12">
                <ListingCard item={selectedItem} onClick={()=>{}} />
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="font-bold mb-2 text-gray-900">Description</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedItem.description}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                   <div className="bg-blue-50 p-3 rounded-lg text-center"><div className="text-xs text-blue-500 font-bold uppercase">Fuel</div><div className="font-bold">Diesel</div></div>
                   <div className="bg-orange-50 p-3 rounded-lg text-center"><div className="text-xs text-orange-500 font-bold uppercase">Condition</div><div className="font-bold">Excellent</div></div>
                </div>
                <button onClick={() => { handleBooking(selectedItem, 5); setSelectedItem(null); }} className="w-full bg-emerald-600 text-white p-4 mt-6 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
                    Request for 5 Hours (₹{selectedItem.price * 5})
                </button>
             </div>
        </div>
      )}

      {/* Edit Profile Modal (Compulsory Logic Included) */}
      {isEditProfileOpen && (
        <EditProfileModal 
            user={user} 
            db={db} 
            appId={appId} 
            onClose={() => setIsEditProfileOpen(false)} 
            onUpdate={(updatedUser) => {
                setUser({...user, ...updatedUser});
                setForceProfileComplete(false); // Unlock app
            }} 
            forceCompletion={forceProfileComplete}
        />
      )}
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal user={user} auth={auth} onClose={() => setIsSettingsOpen(false)} />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl scale-in-center">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><LogOut size={24}/></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Log Out?</h3>
                    <p className="text-sm text-gray-500 mb-6">Are you sure you want to sign out of TractorShare?</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-gray-100 font-bold text-gray-700 rounded-xl">Cancel</button>
                        <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 font-bold text-white rounded-xl shadow-lg shadow-red-200">Log Out</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <GeminiAssistant />
    </div>
  );
}