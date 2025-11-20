import GeminiAssistant from './components/ai/GeminiAssistant';
import LoginScreen from './components/LoginScreen';
import EditProfileModal from './components/EditProfileModal';
import SettingsModal from './components/SettingsModal';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Search, MapPin, Calendar, User, ShieldCheck, Star, 
  PlusCircle, Home, Clock, CheckCircle, ChevronLeft, DollarSign, 
  Settings, LogOut, Edit2, TrendingUp, XCircle, Check
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, onAuthStateChanged, signOut
} from 'firebase/auth';
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

// --- HELPER: Create/Fetch Profile in DB ---
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
      createdAt: serverTimestamp()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    return userSnap.data();
  }
};

// --- COMPONENTS ---

const BottomNav = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center z-50 shadow-lg pb-safe">
    <NavIcon icon={Home} label="Home" id="home" activeTab={activeTab} setActiveTab={setActiveTab} />
    <NavIcon icon={Search} label="Search" id="search" activeTab={activeTab} setActiveTab={setActiveTab} />
    <div className="relative -top-5">
      <button 
        onClick={() => setActiveTab('add')}
        className="bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:bg-emerald-700 transform transition hover:scale-105"
      >
        <PlusCircle size={28} />
      </button>
    </div>
    <NavIcon icon={Clock} label="Bookings" id="bookings" activeTab={activeTab} setActiveTab={setActiveTab} />
    <NavIcon icon={User} label="Profile" id="profile" activeTab={activeTab} setActiveTab={setActiveTab} />
  </div>
);

const NavIcon = ({ icon: Icon, label, id, activeTab, setActiveTab }) => (
  <button 
    onClick={() => setActiveTab(id)}
    className={`flex flex-col items-center w-16 ${activeTab === id ? 'text-emerald-600' : 'text-gray-400'}`}
  >
    <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);

const Header = ({ onOpenSettings }) => (
  <div className="bg-emerald-600 text-white p-4 sticky top-0 z-40 shadow-md">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-white/20 p-2 rounded-lg">
          <Tractor size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">TractorShare</h1>
          <p className="text-xs text-emerald-100">Rent. Farm. Grow.</p>
        </div>
      </div>
      <button onClick={onOpenSettings} className="bg-emerald-700 p-2 rounded-full hover:bg-emerald-800 transition-colors">
        <Settings size={20} />
      </button>
    </div>
  </div>
);

const ListingCard = ({ item, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all active:scale-[0.98] cursor-pointer">
    <div className="relative h-40 bg-gray-200">
      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-xs font-bold text-emerald-800 flex items-center gap-1 shadow-sm">
        <Star size={12} className="fill-yellow-400 text-yellow-400" />
        {item.rating}
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
      <div className="flex items-center text-gray-500 text-xs mb-2">
        <MapPin size={12} className="mr-1" /> {item.location}
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded font-medium">{item.type}</span>
        <span className="block font-bold text-gray-900">₹{item.price}<span className="text-gray-400 text-xs font-normal">/hr</span></span>
      </div>
    </div>
  </div>
);

const Filters = ({ activeFilter, setFilter }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    {['All', 'Tractor', 'Harvester', 'Drone', 'Implements'].map((type) => (
      <button key={type} onClick={() => setFilter(type)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === type ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200'}`}>
        {type}
      </button>
    ))}
  </div>
);

// --- MAIN APP ---
export default function TractorShareApp() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  
  // Data States
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myListings, setMyListings] = useState([]); 
  
  // UI States
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [role, setRole] = useState('renter'); // 'renter' or 'owner'
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch profile from DB to get Role/Phone
        const dbProfile = await ensureUserProfile(currentUser);
        setUser({ ...currentUser, ...dbProfile });
        if (dbProfile?.role) setRole(dbProfile.role);
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

    // A. Public Listings (For Search)
    const listingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'listings');
    const unsubListings = onSnapshot(query(listingsRef), (snap) => {
      setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // B. Bookings (Split logic for Owner vs Renter)
    // We use a shared collection so Owners can find requests
    const bookingsRef = collection(db, 'artifacts', appId, 'bookings');
    
    let q;
    if (role === 'owner') {
        // Owners see requests sent TO them
        q = query(bookingsRef, where('ownerId', '==', user.uid));
    } else {
        // Renters see requests created BY them
        q = query(bookingsRef, where('requesterId', '==', user.uid));
    }

    const unsubBookings = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // C. My Listings (For Owners)
    if (role === 'owner') {
        const myListingsQuery = query(listingsRef, where('ownerId', '==', user.uid));
        const unsubMyListings = onSnapshot(myListingsQuery, (snap) => {
            setMyListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => { unsubListings(); unsubBookings(); unsubMyListings(); };
    }

    return () => { unsubListings(); unsubBookings(); };
  }, [user, role]);

  // --- HANDLERS ---

  const handleBooking = async (item, hours) => {
    if (!user) return;
    
    // Save to shared bookings collection
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
        requesterName: user.displayName || 'Farmer'
    };

    await addDoc(collection(db, 'artifacts', appId, 'bookings'), bookingData);
    alert("Request sent to Owner!");
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
      const bookingRef = doc(db, 'artifacts', appId, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: newStatus });
  };

  const handleAddListing = async (e) => {
      e.preventDefault();
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
      alert("Listing Published!");
      setActiveTab('home');
  };

  const handleProfileUpdate = (updatedUser) => {
      // Update local state immediately
      setUser({ ...user, ...updatedUser });
  };

  // --- VIEWS ---

  const renderHome = () => {
    if (role === 'owner') {
        // --- OWNER DASHBOARD ---
        const earnings = bookings
            .filter(b => b.status === 'confirmed')
            .reduce((acc, curr) => acc + curr.totalCost, 0);

        return (
            <div className="pb-24 p-4">
                <div className="bg-gray-900 text-white rounded-2xl p-6 mb-6 shadow-xl">
                    <h2 className="text-lg font-medium text-gray-400">Total Earnings</h2>
                    <div className="text-4xl font-bold mt-2">₹{earnings}</div>
                    <div className="flex gap-2 mt-4">
                        <div className="bg-gray-800 px-3 py-1 rounded-lg text-xs text-green-400 flex items-center gap-1">
                            <TrendingUp size={12}/> +12% this week
                        </div>
                    </div>
                </div>

                <h3 className="font-bold text-gray-800 text-lg mb-4">Active Listings</h3>
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
                                    <div className="text-xs text-green-600 font-bold">Active</div>
                                </div>
                                <button className="text-gray-400"><Edit2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- RENTER HOME ---
    return (
        <div className="pb-24">
          <div className="p-4">
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
               <div className="relative z-10">
                   <h2 className="text-2xl font-bold mb-2">Harvest Season?</h2>
                   <p className="text-emerald-100 text-sm mb-4 w-2/3">Rent equipment instantly.</p>
                   <button onClick={() => setActiveTab('search')} className="bg-white text-emerald-800 px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Book Now</button>
               </div>
               <Tractor className="absolute -bottom-4 -right-4 text-emerald-500 opacity-40 w-32 h-32 transform -rotate-12" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-4">Categories</h3>
            <Filters activeFilter={filterType} setFilter={setFilterType} />
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
          <h2 className="text-xl font-bold text-gray-800 mb-6">
              {role === 'owner' ? 'Incoming Requests' : 'My Bookings'}
          </h2>
          {bookings.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No records found.</p>
              </div>
          ) : (
              <div className="space-y-4">
                  {bookings.map(booking => (
                      <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex gap-4 mb-3">
                              <img src={booking.listingImage} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <h3 className="font-bold text-gray-800 text-sm">{booking.listingTitle}</h3>
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                          booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                          {booking.status}
                                      </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {role === 'owner' ? `Requester: ${booking.requesterName}` : `Duration: ${booking.hours} hrs`}
                                  </div>
                                  <div className="font-bold text-emerald-600 mt-1">₹{booking.totalCost}</div>
                              </div>
                          </div>
                          
                          {/* OWNER ACTIONS */}
                          {role === 'owner' && booking.status === 'pending' && (
                              <div className="flex gap-2 mt-2 border-t pt-3">
                                  <button 
                                    onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1"
                                  >
                                      <XCircle size={14}/> Reject
                                  </button>
                                  <button 
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                    className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1"
                                  >
                                      <Check size={14}/> Accept
                                  </button>
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
          <div className="flex items-center gap-4 mb-6">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-emerald-500" />
              ) : (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-2xl font-bold">
                  {user?.displayName?.[0] || "U"}
                </div>
              )}
              <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{user?.displayName || "Farmer"}</h2>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <p className="text-emerald-600 text-xs font-medium mt-1">{user?.phone || "No phone added"}</p>
              </div>
              <button onClick={() => setIsEditProfileOpen(true)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Edit2 size={18} className="text-gray-600"/>
              </button>
          </div>

          {/* Role Toggle */}
          <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-emerald-900">Switch Mode</span>
                  <div className="flex bg-white rounded-lg p-1 shadow-sm">
                      <button onClick={() => setRole('renter')} className={`px-3 py-1 text-xs font-bold rounded ${role === 'renter' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Renter</button>
                      <button onClick={() => setRole('owner')} className={`px-3 py-1 text-xs font-bold rounded ${role === 'owner' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Owner</button>
                  </div>
              </div>
              <p className="text-xs text-emerald-700">
                  {role === 'renter' ? "Find equipment to rent." : "Manage your listings and earnings."}
              </p>
          </div>

          <div className="space-y-2">
              <button onClick={() => setIsSettingsOpen(true)} className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3"><Settings size={20} className="text-gray-500" /><span className="font-medium">Settings</span></div>
              </button>
              <button onClick={() => signOut(auth)} className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 text-red-500">
                  <div className="flex items-center gap-3"><LogOut size={20} /><span className="font-medium">Log Out</span></div>
              </button>
          </div>
      </div>
  );

  // --- RENDER FLOW ---

  if (initializing) return <div className="min-h-screen bg-emerald-600 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div></div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {activeTab === 'home' && renderHome()}
        {/* Reusing standard search logic */}
        {activeTab === 'search' && (
            <div className="pb-24 p-4">
                <h3 className="font-bold text-gray-800 text-lg mb-4">Search</h3>
                <Filters activeFilter={filterType} setFilter={setFilterType} />
                <div className="grid grid-cols-1 gap-4 mt-4">
                    {listings.filter(i => filterType === 'All' || i.type === filterType).map(item => (
                        <ListingCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                    ))}
                </div>
            </div>
        )}
        {activeTab === 'add' && (
            <div className="pb-24 p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6">List Equipment</h2>
                <form onSubmit={handleAddListing} className="space-y-4">
                    <div><label className="block text-xs font-bold mb-1">Title</label><input name="title" required className="w-full border p-3 rounded-lg" placeholder="e.g. Rotavator"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold mb-1">Type</label><select name="type" className="w-full border p-3 rounded-lg"><option>Tractor</option><option>Drone</option><option>Harvester</option></select></div>
                        <div><label className="block text-xs font-bold mb-1">Price/Hr</label><input name="price" type="number" required className="w-full border p-3 rounded-lg"/></div>
                    </div>
                    <div><label className="block text-xs font-bold mb-1">Location</label><input name="location" required className="w-full border p-3 rounded-lg"/></div>
                    <div><label className="block text-xs font-bold mb-1">Description</label><textarea name="description" className="w-full border p-3 rounded-lg"/></div>
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl">Publish</button>
                </form>
            </div>
        )}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'profile' && renderProfile()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Modals */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-white p-4 animate-in slide-in-from-bottom-10">
             <button onClick={() => setSelectedItem(null)} className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full"><ChevronLeft/></button>
             <div className="mt-12">
                <ListingCard item={selectedItem} onClick={()=>{}} />
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-bold mb-2">Description</h3>
                    <p className="text-sm text-gray-600">{selectedItem.description}</p>
                </div>
                <button onClick={() => { handleBooking(selectedItem, 5); setSelectedItem(null); }} className="w-full bg-emerald-600 text-white p-4 mt-6 rounded-xl font-bold shadow-lg">
                    Request for 5 Hours
                </button>
             </div>
        </div>
      )}

      {isEditProfileOpen && (
        <EditProfileModal 
            user={user} 
            db={db} 
            appId={appId} 
            onClose={() => setIsEditProfileOpen(false)} 
            onUpdate={handleProfileUpdate} 
        />
      )}
      
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      <GeminiAssistant />
    </div>
  );
}