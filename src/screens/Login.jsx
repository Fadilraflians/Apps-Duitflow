import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const getApiUrl = () => `http://${window.location.hostname}:5000/api/login`;
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        login(data);
        navigate('/home');
      } else {
        setError(data.error || 'Failed to login');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-container/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-tertiary-container/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Back to Home Navigation */}
      <div className="absolute top-6 left-6 z-50">
        <Link to="/" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label text-xs font-bold uppercase tracking-widest">Back</span>
        </Link>
      </div>

      <main className="w-full max-w-md px-6 z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-container mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-container/20 transform rotate-12">
            <span className="material-symbols-outlined text-primary text-3xl transform -rotate-12">account_balance_wallet</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Welcome Back</h1>
          <p className="text-on-surface-variant font-body text-sm">Sign in to continue your financial narrative.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-surface-container-highest/30 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="p-3 bg-error-container text-on-error-container rounded-md text-sm font-bold text-center">{error}</div>}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-outline font-label ml-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant material-symbols-outlined text-[20px]">mail</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant font-body text-sm" 
                  placeholder="hello@duitflow.com" 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline font-label">Password</label>
                <a className="text-[10px] font-bold text-primary hover:underline" href="#">Forgot?</a>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant material-symbols-outlined text-[20px]">lock</span>
                <input 
                  className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant font-body text-sm" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button className="w-full py-4 mt-4 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-dim transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group" type="submit">
              Sign In
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">login</span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm font-body">
              Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
