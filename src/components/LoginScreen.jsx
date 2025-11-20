import React, { useState } from 'react';
import { Tractor, ArrowRight } from 'lucide-react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function LoginScreen({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      // For mobile web/PWA, signInWithPopup is easiest. 
      // For native Capacitor build, this opens a browser window.
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged in App.jsx will catch the success
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Decorative Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-500 rounded-full opacity-50 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-teal-500 rounded-full opacity-50 blur-3xl"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-sm">
        <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8 animate-in zoom-in duration-500">
          <Tractor size={64} className="text-emerald-600" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-center">TractorShare</h1>
        <p className="text-emerald-100 text-center mb-12 text-lg">
          Rent Equipment. Farm Better.<br/>Grow Together.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-800 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
             {/* Google Icon SVG */}
             <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
             </svg>
             {loading ? "Connecting..." : "Continue with Google"}
          </button>

          {error && <p className="text-red-200 text-sm text-center bg-red-500/20 p-2 rounded">{error}</p>}
          
          <p className="text-xs text-emerald-200 text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}