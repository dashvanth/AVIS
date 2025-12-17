import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Database, BarChart2, Zap, TrendingUp, Settings, LogOut, Layout, Sparkles, Bot } from 'lucide-react';

const GlobalLayout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-avis-primary text-avis-text-primary font-sans flex flex-col">
            <div className="flex flex-1 overflow-hidden h-screen">
                {/* Persistent Sidebar */}
                <aside className="w-64 bg-avis-secondary border-r border-avis-border hidden md:flex flex-col flex-shrink-0 relative z-40">
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <NavLink to="/app" end className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-avis-accent-indigo/10 text-avis-accent-indigo border border-avis-accent-indigo/20' : 'text-avis-text-secondary hover:text-white hover:bg-avis-primary'}`}>
                            <Home className="w-5 h-5 mr-3" />
                            Home
                        </NavLink>
                        <NavLink to="/app/datasets" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-avis-accent-indigo/10 text-avis-accent-indigo border border-avis-accent-indigo/20' : 'text-avis-text-secondary hover:text-white hover:bg-avis-primary'}`}>
                            <Database className="w-5 h-5 mr-3" />
                            Dataset Page
                        </NavLink>
                        <NavLink to="/app/analytics" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-avis-accent-indigo/10 text-avis-accent-indigo border border-avis-accent-indigo/20' : 'text-avis-text-secondary hover:text-white hover:bg-avis-primary'}`}>
                            <BarChart2 className="w-5 h-5 mr-3" />
                            Analytics Page
                        </NavLink>
                        <NavLink to="/app/builder" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-avis-accent-indigo/10 text-avis-accent-indigo border border-avis-accent-indigo/20' : 'text-avis-text-secondary hover:text-white hover:bg-avis-primary'}`}>
                            <Layout className="w-5 h-5 mr-3" />
                            Dashboard Builder
                        </NavLink>
                        <NavLink to="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-avis-text-secondary hover:text-white hover:bg-avis-primary transition-all">
                            <Zap className="w-5 h-5 mr-3" />
                            Insights Page
                        </NavLink>
                        <NavLink to="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-avis-text-secondary hover:text-white hover:bg-avis-primary transition-all">
                            <TrendingUp className="w-5 h-5 mr-3" />
                            Forecasting Page
                        </NavLink>
                        <NavLink to="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-avis-text-secondary hover:text-white hover:bg-avis-primary transition-all">
                            <Sparkles className="w-5 h-5 mr-3" />
                            Recommendation System
                        </NavLink>
                        <NavLink to="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-avis-text-secondary hover:text-white hover:bg-avis-primary transition-all">
                            <Bot className="w-5 h-5 mr-3" />
                            AI Assistant Page
                        </NavLink>

                        <div className="pt-4 mt-2 border-t border-avis-border/50">
                            <NavLink to="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-avis-text-secondary hover:text-white hover:bg-avis-primary transition-all">
                                <Settings className="w-5 h-5 mr-3" />
                                Settings Page
                            </NavLink>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-avis-border bg-avis-secondary">
                        <button onClick={() => navigate('/')} className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                            <LogOut className="w-5 h-5 mr-3" />
                            Log Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-avis-primary relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default GlobalLayout;
