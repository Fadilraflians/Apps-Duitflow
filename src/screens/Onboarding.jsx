import React from 'react';
import { Link } from 'react-router-dom';

export default function Onboarding() {
  return (
    <main className="w-full max-w-[1440px] px-6 md:px-12 flex flex-col min-h-screen">
      <header className="py-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-container rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
          <span className="text-2xl font-extrabold text-primary tracking-tight font-headline">DuitFlow</span>
        </div>
        <Link className="text-sm font-bold text-primary hover:opacity-80 transition-opacity font-label uppercase tracking-widest" to="/login">Log In</Link>
      </header>

      <section className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-12 items-center py-12">
        <div className="order-2 md:order-1 md:col-span-6 lg:col-span-5 flex flex-col space-y-8">
          <div className="space-y-4">
            <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-label inline-block">
              Smart Finance
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-on-surface leading-[1.1] tracking-tight">
              DuitFlow: <br/>
              <span className="text-primary italic">Spend Smarter.</span>
            </h1>
            <p className="text-lg text-on-surface-variant font-body leading-relaxed max-w-md">
              Track your daily expenses, understand your monthly spending, and hit your savings goals with ease.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-br from-primary to-primary-dim text-primary-container rounded-full font-bold text-lg editorial-shadow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              Get Started
              <span className="material-symbols-outlined text-2xl">arrow_forward</span>
            </Link>
            <button className="font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
              View Demo
              <span className="material-symbols-outlined text-lg">play_circle</span>
            </button>
          </div>
          <div className="pt-8 grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-6 rounded-xl space-y-2">
              <div className="flex -space-x-2">
                <img alt="User" className="w-8 h-8 rounded-full border-2 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLknvc50Gtlt8lVKhEgUMrW9zbWMNTPWaUEZO_bcrU9vSPVpUgC_xRS0Pvk0JJhg2G_GuH0LvRPhC1eZKCcxF-Yplr3ebDhRaADtIgvn3ak23qIJNqKG3-kwifgenIVMRGwJg73mQmOFKMXj9MEeo0egzzBFYTZNK7sRyUesJWY5JCFiSc1Fo8OSe9jjKd53HyqcjHm_y7EQMlwbOIZ1Z8nfAzONwMOFYvjPIPVCA4AGqQgjWDlZS1Xq3rHmqQm2P0wgBe1NC77ZGc" />
                <img alt="User" className="w-8 h-8 rounded-full border-2 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdWsvMQsy8cZnZEtKa2OPupcf-i62nAn2oYSROjWC5CBA-JgYrjTL1ArcEGSb2xovQn7xKm6AIga2QssN_gTWhsDHOZMFuaXlpZ_PL23mFay5tUCEl42Ah8synaXvF8Db3OO62sxA5LyjVaTelyasBskEIJroyl1d4nLmI-d5O8i-mii1IzwM8owyWNb0VQVrmsrybK8VUJu4fm_H9kNN7bz_qlWPoovZwo7X3ceT6TCzMzIWR0hRJbW8V9zzJuw35vMPCo8q1vEOV" />
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center text-[10px] font-bold">+10k</div>
              </div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Active Savers</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl space-y-1">
              <p className="text-2xl font-bold text-primary font-headline">$2.4M</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Total Tracked</p>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2 md:col-span-6 lg:col-span-7 relative w-full h-full min-h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/30 to-tertiary-container/20 rounded-[3rem] -rotate-3 blur-3xl"></div>
          <div className="relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center">
            <div className="absolute top-10 right-10 z-20 bg-surface-container-lowest p-6 rounded-xl editorial-shadow w-48 hidden lg:block transform rotate-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-md bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-16 bg-surface-container rounded-full mb-1"></div>
                  <div className="h-2 w-10 bg-surface-container-high rounded-full"></div>
                </div>
              </div>
              <p className="text-xl font-bold text-on-surface">$124.50</p>
            </div>
            
            <div className="relative z-10 w-full max-w-[500px] bg-white rounded-xl overflow-hidden editorial-shadow p-4">
              <img className="w-full h-full object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh3DA4MQ9oqSyP9hFx6r7FizRXiswnPD0tcLLTgTOeJZagqWXxxYt_NJ2mrO63a6dRC3vlBvXZQWyyumAzYLLdKS6q2PmIrNB4ez69tcQ2zC5HXfjBMPOnTohuc6yyQfyE_3JBRnTQhkOX8VKDB8gZsN1QSDizIwnMb5ddq77k95W6ZmDa9Bf4LE6dkyMeO9qLLf1af3qfvyXiuRS4SyleeKRyNyE-rcEJqY2OZ9mLT0NhIlQHkfhC5Si5p5AevrmmXizayfB8OaLZ" alt="Illustration" />
              <div className="absolute bottom-10 left-10 bg-surface/90 backdrop-blur-md p-4 rounded-xl editorial-shadow border border-white/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">Savings Velocity</p>
                    <p className="text-lg font-bold text-primary">+12.5% this month</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-4 z-20 bg-tertiary text-on-tertiary p-6 rounded-xl editorial-shadow hidden md:flex items-center gap-4 -rotate-2">
              <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
              </div>
              <div>
                <p className="text-sm font-bold">New Goal Hit!</p>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-label">Europe Trip 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 mt-auto border-t border-surface-container-high/50 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-8 opacity-40 grayscale contrast-125">
          <span className="text-xl font-black tracking-tighter">FINTECH+</span>
          <span className="text-xl font-black tracking-tighter">GLOBAL BANK</span>
          <span className="text-xl font-black tracking-tighter">TRUST_CO</span>
        </div>
        <p className="text-xs text-on-surface-variant font-label font-bold uppercase tracking-widest">
          Secure 256-bit encryption for your data.
        </p>
      </footer>
    </main>
  );
}
