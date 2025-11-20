import React, { useState } from 'react';
import { Tractor } from 'lucide-react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login Error:", err);
      setError("Login Failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Abstract Shapes for visual appeal */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500 rounded-full opacity-30 blur-3xl"></div>

      {/* Centered Card */}
      <div className="z-10 flex flex-col items-center w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 animate-bounce-slow">
          <Tractor size={64} className="text-emerald-600" />
        </div>
        
        <h1 className="text-4xl font-bold mb-3 text-center tracking-tight">TractorShare</h1>
        <p className="text-emerald-50 text-center mb-10 text-lg font-medium leading-relaxed">
          The #1 Marketplace for Farmers.<br/>Rent. Farm. Grow.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
          >
             {/* Google Icon */}
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
             {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {error && <p className="text-red-200 text-sm text-center bg-red-500/20 p-3 rounded-lg border border-red-500/30">{error}</p>}
          
          <p className="text-xs text-emerald-200 text-center mt-8 opacity-80">
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}