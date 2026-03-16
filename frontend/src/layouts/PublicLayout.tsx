import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const PublicLayout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
            {/* Minimal Brand Header */}
            <header className="h-20 flex items-center justify-between px-8 bg-transparent z-50">
                <div 
                    className="flex items-center space-x-3 cursor-pointer group" 
                    onClick={() => navigate('/')}
                >
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-white">
                        A.V.I.S.
                    </h1>
                </div>

                <div className="flex items-center space-x-6">
                    <button 
                        onClick={() => navigate('/auth')}
                        className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => navigate('/auth')}
                        className="px-6 py-2.5 bg-white text-slate-950 text-sm font-black rounded-full hover:bg-slate-200 transition-all transform hover:-translate-y-0.5"
                    >
                        Get Started
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full">
                <Outlet />
            </main>

            {/* Simple Footer */}
            <footer className="py-8 text-center border-t border-white/5 bg-slate-950">
                <p className="text-xs text-slate-500 font-medium">
                    &copy; {new Date().getFullYear()} AVIS Intelligence. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default PublicLayout;
