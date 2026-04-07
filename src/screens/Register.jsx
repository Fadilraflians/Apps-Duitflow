import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const apiBase = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`);
      const response = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        // Redirect to login page to enforce manual login after registration
        navigate('/login');
      } else {
        setError(data.error || 'Failed to register');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <header className="w-full top-0 sticky bg-[#f5f7f9] flex justify-between items-center px-6 py-4 z-50">
        <div className="text-2xl font-bold text-[#006a2d] tracking-tight font-headline">
          DuitFlow
        </div>
        <Link to="/login" className="text-primary font-bold text-sm hover:opacity-80 transition-opacity font-label uppercase tracking-widest">
          Log In
        </Link>
      </header>
      
      <main className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center px-6 py-12 md:py-24 gap-12 lg:gap-24">
        {/* Left Column: Editorial Branding */}
        <div className="w-full md:w-1/2 flex flex-col space-y-8">
          <div className="space-y-4">
            <span className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-label inline-block">
              Elevate Your Wealth
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-on-surface leading-[1.1] font-headline">
              Start Your Journey with <span className="text-primary">DuitFlow</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md font-body">
              Experience a narrative approach to finance. Your wealth isn't just data—it's the story of your future growth.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
              <div className="bg-surface-container-lowest w-12 h-12 rounded-md flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">insights</span>
              </div>
              <p className="text-sm font-bold font-headline leading-tight">Predictive Growth Mapping</p>
            </div>
            <div className="bg-primary-container rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="bg-on-primary-fixed/10 w-12 h-12 rounded-md flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-fixed">track_changes</span>
              </div>
              <p className="text-sm font-bold font-headline text-on-primary-fixed leading-tight z-10">Editorial Clarity</p>
            </div>
          </div>
        </div>
        
        {/* Right Column: Registration Card */}
        <div className="w-full md:w-5/12 lg:w-1/3">
          <div className="bg-surface-container-lowest rounded-xl p-8 lg:p-10 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <form onSubmit={handleRegister} className="space-y-6">
              {error && <div className="p-3 bg-error-container text-on-error-container rounded-md text-sm font-bold">{error}</div>}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline font-label ml-2">Full Name</label>
                <input 
                  className="w-full px-6 py-4 bg-surface-container rounded-md border-none focus:ring-4 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant font-body" 
                  placeholder="Enter your full name" 
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline font-label ml-2">Email Address</label>
                <input 
                  className="w-full px-6 py-4 bg-surface-container rounded-md border-none focus:ring-4 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant font-body" 
                  placeholder="hello@duitflow.com" 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline font-label ml-2">Password</label>
                <input 
                  className="w-full px-6 py-4 bg-surface-container rounded-md border-none focus:ring-4 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant font-body" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              
              <button className="w-full py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-full font-bold text-lg hover:scale-[0.98] transition-transform active:scale-95 flex items-center justify-center gap-2" type="submit">
                Create Account
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              
              <div className="pt-4 text-center">
                <p className="text-on-surface-variant text-sm font-body">
                  Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
