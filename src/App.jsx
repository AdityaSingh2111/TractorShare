import GeminiAssistant from './components/ai/GeminiAssistant';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  Menu, 
  ShieldCheck, 
  Star, 
  Filter, 
  PlusCircle, 
  Home, 
  Clock, 
  CheckCircle,
  ChevronLeft,
  DollarSign,
  Settings,
  LogOut
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithCustomToken,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

// --- Firebase Configuration & Initialization ---
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const appId = typeof __app_id !== 'undefined' ? __app_id : '1:237464199962:web:82514e50fc849d5c8d02a3';

// --- Mock Data for Seeding ---
const SEED_DATA = [
  {
    title: "John Deere 5310 (55HP)",
    type: "Tractor",
    price: 1200,
    image: "https://images.unsplash.com/photo-1592875820939-c47839887c58?auto=format&fit=crop&q=80&w=800",
    location: "Punjab, Ludhiana",
    rating: 4.8,
    reviewCount: 24,
    verified: true,
    ownerName: "Gurpreet Singh",
    description: "Powerful 55HP tractor suitable for rotavator and heavy trolley work. Comes with a driver if needed.",
    specs: { power: "55 HP", fuel: "Diesel", drive: "2WD" }
  },
  {
    title: "DJI Agras T40 Drone",
    type: "Drone",
    price: 2500,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=800",
    location: "Haryana, Karnal",
    rating: 5.0,
    reviewCount: 8,
    verified: true,
    ownerName: "TechAgro Solutions",
    description: "High-capacity spraying drone. Covers 40 acres per day. Includes pilot.",
    specs: { capacity: "40L", flightTime: "15 min", type: "Sprayer" }
  },
  {
    title: "Kubota Harvester DC-68G",
    type: "Harvester",
    price: 4500,
    image: "https://images.unsplash.com/photo-1530267981375-f0de93fe1e91?auto=format&fit=crop&q=80&w=800",
    location: "MP, Indore",
    rating: 4.5,
    reviewCount: 12,
    verified: true,
    ownerName: "Rajesh Kumar",
    description: "Reliable paddy harvester. Well maintained. Available for next season.",
    specs: { width: "2m", engine: "Turbo", fuel: "Diesel" }
  },
  {
    title: "Massey Ferguson 241",
    type: "Tractor",
    price: 900,
    image: "https://images.unsplash.com/photo-1605218427306-983dd6890933?auto=format&fit=crop&q=80&w=800",
    location: "UP, Meerut",
    rating: 4.2,
    reviewCount: 15,
    verified: false,
    ownerName: "Amit Farmer",
    description: "Standard utility tractor for haulage and cultivation.",
    specs: { power: "42 HP", fuel: "Diesel", drive: "2WD" }
  }
];

// --- Components ---

// 1. Navigation Bar (Mobile Bottom Nav)
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

// 2. Header
const Header = () => (
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
      <div className="bg-emerald-700 p-2 rounded-full">
        <Settings size={20} />
      </div>
    </div>
  </div>
);

// 3. Listing Card
const ListingCard = ({ item, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
  >
    <div className="relative h-40 bg-gray-200">
      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-xs font-bold text-emerald-800 flex items-center gap-1 shadow-sm">
        <Star size={12} className="fill-yellow-400 text-yellow-400" />
        {item.rating}
      </div>
      {item.verified && (
        <div className="absolute bottom-2 left-2 bg-blue-600/90 text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1 shadow-sm">
          <ShieldCheck size={10} />
          VERIFIED OWNER
        </div>
      )}
    </div>
    <div className="p-3">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-gray-800 truncate pr-2">{item.title}</h3>
      </div>
      <div className="flex items-center text-gray-500 text-xs mb-2">
        <MapPin size={12} className="mr-1" />
        {item.location}
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded font-medium">
          {item.type}
        </span>
        <div className="text-right">
          <span className="block font-bold text-gray-900">₹{item.price}<span className="text-gray-400 text-xs font-normal">/hr</span></span>
        </div>
      </div>
    </div>
  </div>
);

// 4. Filters Component
const Filters = ({ activeFilter, setFilter }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    {['All', 'Tractor', 'Harvester', 'Drone', 'Implements'].map((type) => (
      <button
        key={type}
        onClick={() => setFilter(type)}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          activeFilter === type 
            ? 'bg-gray-900 text-white shadow-lg' 
            : 'bg-white text-gray-600 border border-gray-200'
        }`}
      >
        {type}
      </button>
    ))}
  </div>
);

// 5. Booking/Product Details Modal
const ProductDetails = ({ item, onClose, onBook, user }) => {
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    setLoading(true);
    await onBook(item, days);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-bottom-10 duration-200">
      <div className="relative">
        <img src={item.image} className="w-full h-64 object-cover" />
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
        >
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
      </div>

      <div className="p-5 pb-24">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin size={14} className="mr-1" /> {item.location}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">₹{item.price}</div>
            <div className="text-gray-400 text-xs">per hour</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {Object.entries(item.specs || {}).map(([key, val]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
              <div className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">{key}</div>
              <div className="font-semibold text-gray-800 text-sm">{val}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-gray-900 mb-3">Owner</h3>
          <div className="flex items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg mr-3">
              {item.ownerName?.[0] || "O"}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm flex items-center gap-1">
                {item.ownerName} 
                {item.verified && <ShieldCheck size={14} className="text-blue-500" />}
              </div>
              <div className="text-xs text-gray-500">Verified Member</div>
            </div>
            <button className="text-emerald-600 text-xs font-bold border border-emerald-200 px-3 py-1 rounded-full">
              Contact
            </button>
          </div>
        </div>

        {/* Booking Section */}
        <div className="mt-8 border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Rental Duration</h3>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-600 text-sm">Hours Required</span>
                <div className="flex items-center gap-4">
                    <button onClick={() => setDays(Math.max(1, days - 1))} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-emerald-600 font-bold">-</button>
                    <span className="font-bold w-4 text-center">{days}</span>
                    <button onClick={() => setDays(days + 1)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-emerald-600 font-bold">+</button>
                </div>
            </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe">
        <div className="flex items-center justify-between mb-4 px-2">
             <div>
                 <span className="text-gray-500 text-xs">Total Cost</span>
                 <div className="text-xl font-bold text-gray-900">₹{item.price * days}</div>
             </div>
             <button 
                onClick={handleBooking}
                disabled={loading}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
             >
                {loading ? 'Processing...' : <>Request Rental <CheckCircle size={18}/></>}
             </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function TractorShareApp() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('renter'); // 'renter' or 'owner'

  // Auth & Data Init
 // --- 0. AUTH INITIALIZATION (Restore this!) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        // This logs the user in anonymously so they can write to the database
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed. Check internet connection.");
      }
    };
    
    initAuth();

    // Listen for the login to complete
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);
useEffect(() => {
  // 1. If Auth is still initializing, wait. 
  // But if we have no user and auth is done, stop loading.
  if (!user) {
     // Optional: Set a timeout to kill loading if auth takes too long
     const timer = setTimeout(() => setLoading(false), 3000); 
     return () => clearTimeout(timer);
  }
  
  const listingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'listings');
  
  // 2. Fetch Listings with Error Handling
  const unsubListings = onSnapshot(query(listingsRef), 
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(items);
      setLoading(false); // <--- Success! Stop loading
    },
    (err) => {
      console.error("Listings Error:", err);
      setLoading(false); // <--- ERROR! Stop loading so user can see "Retry" or empty state
      alert("Connection Error: " + err.message);
    }
  );

  // 3. Fetch User Bookings
  const bookingsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'bookings');
  const unsubBookings = onSnapshot(query(bookingsRef),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(items);
    },
    (err) => console.error("Bookings Error:", err)
  );

  return () => {
      unsubListings();
      unsubBookings();
  };
}, [user]);

  // --- Logic Handlers ---

   const handleSeedData = async () => {
    // ADDED: Debugging alert
    if (!user) {
        alert("Wait! You are not logged in yet. Check your internet connection.");
        return;
    }
    
    const listingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'listings');
    
    try {
        for (const item of SEED_DATA) {
           await addDoc(listingsRef, {
               ...item,
               ownerId: user.uid,
               createdAt: serverTimestamp()
           });
        }
        alert("Success! Marketplace seeded with demo tractors.");
        // Force refresh the tab to show data immediately
        setActiveTab('home'); 
    } catch (err) {
        alert("Error seeding data: " + err.message);
    }
  };

  const handleBooking = async (item, hours) => {
      if (!user) return;
      
      const bookingData = {
          listingId: item.id,
          listingTitle: item.title,
          listingImage: item.image,
          pricePerHour: item.price,
          hours: hours,
          totalCost: item.price * hours,
          status: 'pending', // pending, confirmed, completed
          date: new Date().toISOString(),
          ownerId: item.ownerId || 'system'
      };

      // Save to User's private bookings
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'bookings'), bookingData);
      alert("Booking request sent to owner!");
  };

  const handleAdconstdListing = async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = {
          title: form.title.value,
          type: form.type.value,
          price: Number(form.price.value),
          location: form.location.value,
          image: "https://images.unsplash.com/photo-1515676664795-a73542c9016b?auto=format&fit=crop&q=80&w=800", // Placeholder
          rating: 5.0,
          verified: true,
          ownerName: "You",
          description: form.description.value,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          specs: { fuel: "Diesel", condition: "Good" }
      };

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), data);
      form.reset();
      setActiveTab('home');
  };

  // Filter Logic
  const filteredListings = useMemo(() => {
    if (filterType === 'All') return listings;
    return listings.filter(item => item.type === filterType);
  }, [listings, filterType]);

  // --- Views ---

  const renderHome = () => (
    <div className="pb-24">
      <div className="p-4">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
           <div className="relative z-10">
               <h2 className="text-2xl font-bold mb-2">Harvest Season Ready?</h2>
               <p className="text-emerald-100 text-sm mb-4 w-2/3">Get verified harvesters and tractors delivered to your farm today.</p>
               <button onClick={() => setActiveTab('search')} className="bg-white text-emerald-800 px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Find Equipment</button>
           </div>
           <Tractor className="absolute -bottom-4 -right-4 text-emerald-500 opacity-40 w-32 h-32 transform -rotate-12" />
        </div>

        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Categories</h3>
        </div>
        <Filters activeFilter={filterType} setFilter={setFilterType} />

        <div className="flex justify-between items-center mb-4 mt-6">
            <h3 className="font-bold text-gray-800 text-lg">Featured Near You</h3>
            <span className="text-emerald-600 text-sm font-medium">View All</span>
        </div>

        {loading ? (
             <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
        ) : listings.length === 0 ? (
             <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                 <p className="text-gray-500 mb-2">No equipment found.</p>
                 <button onClick={handleSeedData} className="text-emerald-600 font-bold underline">Load Demo Data</button>
             </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {filteredListings.map(item => (
                    <ListingCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                ))}
            </div>
        )}
      </div>
    </div>
  );

  const renderSearch = () => (
     <div className="pb-24 p-4">
        <div className="sticky top-0 bg-white z-10 pb-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search 'Rotavator' or '55HP'"
                    className="w-full bg-gray-100 pl-10 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700" 
                />
            </div>
            <div className="mt-4">
                <Filters activeFilter={filterType} setFilter={setFilterType} />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            {filteredListings.map(item => (
                <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                    <div className="h-32 bg-gray-200 relative">
                        <img src={item.image} className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white px-1.5 rounded text-[10px]">₹{item.price}/hr</div>
                    </div>
                    <div className="p-2">
                        <h4 className="font-bold text-sm text-gray-800 truncate">{item.title}</h4>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                             <MapPin size={10} className="mr-1" /> {item.location.split(',')[0]}
                        </div>
                    </div>
                </div>
            ))}
        </div>
     </div>
  );

  const renderAddListing = () => (
      <div className="pb-24 p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">List Your Equipment</h2>
          <form onSubmit={handleAddListing} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Title</label>
                  <input name="title" required placeholder="e.g. Mahindra 575 DI" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select name="type" className="w-full border border-gray-300 rounded-lg p-3 bg-white outline-none">
                          <option>Tractor</option>
                          <option>Harvester</option>
                          <option>Drone</option>
                          <option>Implements</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price / Hour (₹)</label>
                      <input name="price" type="number" required placeholder="1000" className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input name="location" required placeholder="Village, District" className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" rows="3" className="w-full border border-gray-300 rounded-lg p-3 outline-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4 hover:bg-emerald-700">
                  Publish Listing
              </button>
          </form>
      </div>
  );

  const renderBookings = () => (
      <div className="pb-24 p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">My Requests</h2>
          {bookings.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No active bookings.</p>
              </div>
          ) : (
              <div className="space-y-4">
                  {bookings.map(booking => (
                      <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                          <img src={booking.listingImage} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                          <div className="flex-1">
                              <div className="flex justify-between items-start">
                                  <h3 className="font-bold text-gray-800 text-sm">{booking.listingTitle}</h3>
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {booking.status}
                                  </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Duration: {booking.hours} hours</div>
                              <div className="flex justify-between items-center mt-3">
                                  <span className="font-bold text-emerald-600">₹{booking.totalCost}</span>
                                  <button className="text-xs bg-gray-100 px-3 py-1 rounded font-medium hover:bg-gray-200">Details</button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderProfile = () => (
      <div className="pb-24 p-4">
          <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-2xl font-bold">
                 {user ? "JD" : "?"}
              </div>
              <div>
                  <h2 className="text-xl font-bold text-gray-900">Aditya Singh</h2>
                  <p className="text-gray-500 text-sm">+91 98765 43210</p>
              </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-emerald-900">Current Mode</span>
                  <div className="flex bg-white rounded-lg p-1 shadow-sm">
                      <button 
                        onClick={() => setRole('renter')}
                        className={`px-3 py-1 text-xs font-bold rounded ${role === 'renter' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}
                      >
                          Farmer
                      </button>
                      <button 
                        onClick={() => setRole('owner')}
                        className={`px-3 py-1 text-xs font-bold rounded ${role === 'owner' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}
                      >
                          Owner
                      </button>
                  </div>
              </div>
              <p className="text-xs text-emerald-700">
                  {role === 'renter' ? "You are browsing for equipment to rent." : "You are managing your equipment listings."}
              </p>
          </div>

          <div className="space-y-2">
              <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-blue-500" />
                      <span className="font-medium text-gray-700">Verification Status</span>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">VERIFIED</span>
              </button>
              <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                      <DollarSign size={20} className="text-gray-400" />
                      <span className="font-medium text-gray-700">Payment Methods</span>
                  </div>
              </button>
               <button onClick={handleSeedData} className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                      <Settings size={20} className="text-gray-400" />
                      <span className="font-medium text-gray-700">Seed Demo Data (Admin)</span>
                  </div>
              </button>
              <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 text-red-500">
                  <div className="flex items-center gap-3">
                      <LogOut size={20} />
                      <span className="font-medium">Log Out</span>
                  </div>
              </button>
          </div>
      </div>
  );

  // Render Logic
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'search' && renderSearch()}
        {activeTab === 'add' && renderAddListing()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'profile' && renderProfile()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {selectedItem && (
          <ProductDetails 
            item={selectedItem} 
            user={user}
            onClose={() => setSelectedItem(null)} 
            onBook={handleBooking}
          />
      )}
      {<GeminiAssistant />}
    </div>
  );
}