import GeminiAssistant from './components/ai/GeminiAssistant';
import LoginScreen from './components/LoginScreen';
import EditProfileModal from './components/EditProfileModal';
import SettingsModal from './components/SettingsModal';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, Search, MapPin, Calendar, User, ShieldCheck, Star, 
  PlusCircle, Home, Clock, CheckCircle, ChevronLeft, DollarSign, 
  Settings, LogOut, Edit2, TrendingUp, XCircle, Check, AlertTriangle, Menu
} from 'lucide-react';

// Firebase Imports (Keep your existing imports)
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

// --- HELPER: Ensure User Profile ---
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

const Header = ({ onOpenSettings, activeTab, setActiveTab, user }) => (
  <div className="bg-emerald-600 text-white sticky top-0 z-40 shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo Section */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Tractor size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TractorShare</h1>
            <p className="text-xs text-emerald-100 opacity-90 hidden sm:block">Rent. Farm. Grow.</p>
          </div>
        </div>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <div className="hidden md:flex items-center space-x-8">
          {['home', 'search', 'bookings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition-colors hover:text-emerald-100 capitalize ${
                activeTab === tab ? 'text-white font-bold border-b-2 border-white pb-1' : 'text-emerald-100'
              }`}
            >
              {tab}
            </button>
          ))}
          <button 
            onClick={() => setActiveTab('add')}
            className="bg-white text-emerald-600 px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-emerald-50 transition-transform active:scale-95 flex items-center gap-2"
          >
            <PlusCircle size={16} /> List Item
          </button>
        </div>

        {/* User & Settings */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('profile')}
            className="hidden md:flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors"
          >
             {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white" />
              ) : (
                <div className="w-8 h-8 bg-emerald-800 rounded-full flex items-center justify-center font-bold">{user?.displayName?.[0]}</div>
              )}
             <span className="text-sm font-medium">{user?.displayName?.split(' ')[0]}</span>
          </button>
          <button onClick={onOpenSettings} className="bg-emerald-700/50 p-2 rounded-full hover:bg-emerald-700 transition-all active:scale-95">
            <Settings size={20} />
          </button>
        </div>
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

  // md:hidden makes this disappear on desktop screens
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe">
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

const ListingCard = ({ item, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group flex flex-col h-full">
    <div className="relative h-48 bg-gray-200 overflow-hidden">
      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-emerald-800 flex items-center gap-1 shadow-sm">
        <Star size={12} className="fill-yellow-400 text-yellow-400" /> {item.rating}
      </div>
    </div>
    <div className="p-4 flex flex-col flex-1">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-gray-900 text-lg truncate">{item.title}</h3>
      </div>
      <div className="flex items-center text-gray-500 text-sm mb-3 mt-1">
        <MapPin size={14} className="mr-1 text-emerald-500" /> {item.location}
      </div>
      <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-50">
        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold uppercase px-2 py-1 rounded tracking-wider">{item.type}</span>
        <div className="text-right">
             <span className="block font-bold text-gray-900 text-lg">₹{item.price}<span className="text-gray-400 text-xs font-normal">/hr</span></span>
        </div>
      </div>
    </div>
  </div>
);

const Filters = ({ activeFilter, setFilter }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
    {['All', 'Tractor', 'Rotavator', 'Harvester', 'Trolley', 'Drone', 'Thresher', 'Seeder'].map((type) => (
      <button 
        key={type} 
        onClick={() => setFilter(type)} 
        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === type 
            ? 'bg-gray-900 text-white shadow-lg scale-105' 
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        }`}
      >
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
        setUser({ ...currentUser, ...dbProfile });
        if (dbProfile?.role) setRole(dbProfile.role);

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

    const listingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'listings');
    const unsubListings = onSnapshot(query(listingsRef), (snap) => {
      setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const bookingsRef = collection(db, 'artifacts', appId, 'bookings');
    let q = role === 'owner' 
        ? query(bookingsRef, where('ownerId', '==', user.uid))
        : query(bookingsRef, where('requesterId', '==', user.uid));

    const unsubBookings = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

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
        requesterPhone: user.phone 
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
        const earnings = bookings.filter(b => b.status === 'confirmed').reduce((acc, curr) => acc + curr.totalCost, 0);
        return (
            <div className="pb-24 p-4 max-w-5xl mx-auto">
                <div className="bg-gray-900 text-white rounded-2xl p-8 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <h2 className="text-lg font-medium text-gray-400">Total Earnings</h2>
                        <div className="text-5xl font-bold mt-2">₹{earnings}</div>
                        <div className="flex gap-2 mt-4">
                            <div className="bg-gray-800 px-3 py-1 rounded-lg text-xs text-green-400 flex items-center gap-1"><TrendingUp size={12}/> +12% this week</div>
                        </div>
                    </div>
                    <button onClick={() => setActiveTab('add')} className="mt-6 md:mt-0 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-500 transition-all">
                        + Add New Tractor
                    </button>
                </div>

                <h3 className="font-bold text-gray-800 text-xl mb-6">Your Fleet</h3>
                {myListings.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                        <Tractor size={48} className="mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-500 font-medium">You haven't listed any equipment yet.</p>
                        <button onClick={() => setActiveTab('add')} className="text-emerald-600 font-bold mt-2 hover:underline">List your first equipment</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myListings.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <img src={item.image} className="w-16 h-16 rounded-lg object-cover"/>
                                    <div>
                                        <div className="font-bold text-gray-900">{item.title}</div>
                                        <div className="text-sm text-green-600 font-bold flex items-center gap-1"><Check size={12}/> Active Listing</div>
                                        <div className="text-xs text-gray-500 mt-1">₹{item.price}/hr</div>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-100">Edit</button>
                                    <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100">Remove</button>
                                </div>
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
          {/* Hero Section - Full Width on Desktop */}
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white py-12 md:py-20 px-4">
             <div className="max-w-7xl mx-auto relative">
                 <div className="relative z-10 max-w-2xl">
                     <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Harvest Season Ready?</h2>
                     <p className="text-emerald-100 text-lg mb-8">Find and rent verified tractors, harvesters, and drones near your village instantly.</p>
                     <div className="flex flex-col sm:flex-row gap-4">
                         <button onClick={() => setActiveTab('search')} className="bg-white text-emerald-900 px-8 py-4 rounded-xl text-base font-bold shadow-lg hover:bg-emerald-50 transition-transform active:scale-95">Browse Equipment</button>
                         <button onClick={() => setRole('owner')} className="bg-emerald-800/50 backdrop-blur text-white px-8 py-4 rounded-xl text-base font-bold border border-emerald-600 hover:bg-emerald-800 transition-colors">I want to List</button>
                     </div>
                 </div>
                 <Tractor className="absolute -bottom-12 -right-12 text-emerald-500 opacity-20 w-64 h-64 md:w-96 md:h-96 transform -rotate-12 pointer-events-none" />
             </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-xl">Browse Categories</h3>
                <span className="text-emerald-600 text-sm font-medium cursor-pointer hover:underline">View all</span>
            </div>
            
            <Filters activeFilter={filterType} setFilter={setFilterType} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {listings.filter(i => filterType === 'All' || i.type === filterType).map(item => (
                    <ListingCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                ))}
            </div>
          </div>
        </div>
    );
  };

  const renderBookings = () => (
      <div className="pb-24 p-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{role === 'owner' ? 'Incoming Requests' : 'My Bookings'}</h2>
          {bookings.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No bookings found.</p>
                  <button onClick={() => setActiveTab('search')} className="text-emerald-600 font-bold mt-2">Make a booking</button>
              </div>
          ) : (
              <div className="space-y-4">
                  {bookings.map(booking => (
                      <div key={booking.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-5 transition-all hover:shadow-md">
                          <img src={booking.listingImage} className="w-full sm:w-32 h-32 object-cover rounded-lg bg-gray-100" />
                          <div className="flex-1 flex flex-col justify-between">
                              <div>
                                  <div className="flex justify-between items-start">
                                      <h3 className="font-bold text-gray-900 text-lg">{booking.listingTitle}</h3>
                                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                          booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                          {booking.status}
                                      </span>
                                  </div>
                                  <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                      <Clock size={14}/> {role === 'owner' ? `Requested by: ${booking.requesterName}` : `Duration: ${booking.hours} Hours`}
                                  </div>
                                  {role === 'owner' && <div className="text-sm text-gray-500 flex items-center gap-2 mt-1"><User size={14}/> Phone: {booking.requesterPhone}</div>}
                              </div>
                              
                              <div className="flex justify-between items-end mt-4">
                                  <div className="font-bold text-emerald-600 text-xl">₹{booking.totalCost}</div>
                                  {role === 'owner' && booking.status === 'pending' && (
                                      <div className="flex gap-3">
                                          <button onClick={() => updateBookingStatus(booking.id, 'rejected')} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">Reject</button>
                                          <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">Accept Request</button>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderProfile = () => (
      <div className="pb-24 p-4 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-5">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-50" />
                  ) : (
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-3xl font-bold">{user?.displayName?.[0] || "U"}</div>
                  )}
                  <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{user?.displayName}</h2>
                      <p className="text-gray-500">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">{user?.phone || "No Phone"}</span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">{user?.location || "No Location"}</span>
                      </div>
                  </div>
                  <button onClick={() => setIsEditProfileOpen(true)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                      <Edit2 size={20} className="text-gray-600"/>
                  </button>
              </div>
              
              {user?.bio && (
                 <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 italic border border-gray-100">
                    "{user.bio}"
                 </div>
              )}
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 mb-6 border border-emerald-100">
              <div className="flex justify-between items-center mb-4">
                  <div>
                      <h3 className="font-bold text-emerald-900">Switch Profile Mode</h3>
                      <p className="text-xs text-emerald-600 mt-1">
                          {role === 'renter' ? "Currently browsing equipment to rent." : "Currently managing your listings."}
                      </p>
                  </div>
                  <div className="flex bg-white rounded-lg p-1 shadow-sm border border-emerald-100">
                      <button onClick={() => setRole('renter')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${role === 'renter' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Renter</button>
                      <button onClick={() => setRole('owner')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${role === 'owner' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Owner</button>
                  </div>
              </div>
          </div>

          <div className="space-y-3">
              <button onClick={() => setIsSettingsOpen(true)} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3"><Settings size={20} className="text-gray-400" /><span className="font-medium text-gray-700">Settings & Preferences</span></div>
                  <ChevronLeft size={16} className="text-gray-300 rotate-180"/>
              </button>
              <button onClick={() => setShowLogoutConfirm(true)} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-red-50 group transition-all">
                  <div className="flex items-center gap-3"><LogOut size={20} className="text-red-400 group-hover:text-red-600" /><span className="font-medium text-gray-700 group-hover:text-red-700">Log Out</span></div>
              </button>
          </div>
      </div>
  );

  // --- RENDER FLOW ---
  if (initializing) return <div className="min-h-screen bg-emerald-600 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div></div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-emerald-200 pb-0 md:pb-0">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      <main className="min-h-[calc(100vh-4rem)]">
        {activeTab === 'home' && renderHome()}
        {/* Reusing home logic for search tab on desktop, but keeping mobile separate if needed */}
        {activeTab === 'search' && renderHome()} 
        
        {activeTab === 'add' && (
             <div className="pb-24 p-4 max-w-2xl mx-auto mt-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">List New Equipment</h2>
                    <form onSubmit={handleAddListing} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Equipment Title</label>
                            <input name="title" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="e.g. Sonalika Rotavator"/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select name="type" className="w-full border border-gray-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                                    <option>Tractor</option><option>Rotavator</option><option>Harvester</option><option>Trolley</option><option>Thresher</option><option>Drone</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price per Hour (₹)</label>
                                <input name="price" type="number" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                            <input name="location" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Village, District"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description & Condition</label>
                            <textarea name="description" rows={4} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Describe the power, age, and condition..."/>
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-transform active:scale-95">Publish Listing</button>
                    </form>
                </div>
            </div>
        )}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'profile' && renderProfile()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* --- MODALS --- */}

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
             <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
                 <button onClick={() => setSelectedItem(null)} className="absolute top-4 left-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors z-10"><ChevronLeft size={24} className="text-gray-800"/></button>
                 <div className="h-64 bg-gray-200 relative">
                    <img src={selectedItem.image} className="w-full h-full object-cover" />
                 </div>
                 
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">₹{selectedItem.price}</div>
                            <span className="text-xs text-gray-500">per hour</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 mb-6">
                        <MapPin size={16} className="text-emerald-500"/> {selectedItem.location}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                        <h3 className="font-bold mb-2 text-gray-900 text-sm uppercase tracking-wider">Description</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedItem.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Fuel Type</div>
                            <div className="font-bold text-gray-800">Diesel</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-100">
                            <div className="text-xs text-orange-600 font-bold uppercase mb-1">Owner</div>
                            <div className="font-bold text-gray-800">{selectedItem.ownerName}</div>
                        </div>
                    </div>

                    <button 
                        onClick={() => { handleBooking(selectedItem, 5); setSelectedItem(null); }} 
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                        Request for 5 Hours (₹{selectedItem.price * 5})
                    </button>
                 </div>
             </div>
        </div>
      )}

      {isEditProfileOpen && (
        <EditProfileModal 
            user={user} 
            db={db} 
            appId={appId} 
            onClose={() => setIsEditProfileOpen(false)} 
            onUpdate={(updatedUser) => {
                setUser({...user, ...updatedUser});
                setForceProfileComplete(false);
            }} 
            forceCompletion={forceProfileComplete}
        />
      )}
      
      {isSettingsOpen && (
        <SettingsModal user={user} auth={auth} onClose={() => setIsSettingsOpen(false)} />
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl scale-in-center">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><LogOut size={28}/></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Log Out?</h3>
                    <p className="text-sm text-gray-500 mb-6">Are you sure you want to sign out?</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-gray-100 font-bold text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                        <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 font-bold text-white rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 transition-colors">Log Out</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <GeminiAssistant />
    </div>
  );
}