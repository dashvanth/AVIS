import React from 'react';
import { Activity } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isLandingPage = location.pathname === '/';

    const scrollToSection = (id: string) => {
        if (isLandingPage) {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Need to navigate and wait (simple mock for now, ideally use a state or query param)
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <header className={`sticky top-0 z-50 backdrop-blur-md border-b border-avis-border transition-all duration-300 ${isLandingPage ? 'bg-avis-primary/80' : 'bg-white border-b-slate-200'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Logo */}
                    <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className={`p-2 rounded-xl shadow-lg transition-transform group-hover:scale-105 ${isLandingPage ? 'bg-gradient-to-br from-avis-accent-indigo to-avis-accent-cyan' : 'bg-indigo-600'}`}>
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className={`text-xl font-bold tracking-tight bg-clip-text text-transparent ${isLandingPage ? 'bg-gradient-to-r from-avis-text-primary to-avis-text-secondary' : 'bg-gradient-to-r from-indigo-700 to-purple-700'}`}>
                                A.V.I.S.
                            </h1>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-6">

                        {isLandingPage && (
                            <div className="hidden md:flex items-center space-x-6 mr-4">
                                <button
                                    onClick={() => scrollToSection('about')}
                                    className="text-sm font-medium text-avis-text-secondary hover:text-avis-accent-cyan transition-colors"
                                >
                                    About Platform
                                </button>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="text-sm font-medium text-avis-text-secondary hover:text-avis-accent-cyan transition-colors"
                                >
                                    Features
                                </button>
                                <button
                                    onClick={() => scrollToSection('workflow')}
                                    className="text-sm font-medium text-avis-text-secondary hover:text-avis-accent-cyan transition-colors"
                                >
                                    Workflow
                                </button>
                            </div>
                        )}

                        {isLandingPage ? (
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="text-sm font-medium text-avis-text-secondary hover:text-white transition-colors"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-5 py-2 bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan text-white text-sm font-bold rounded-full hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all transform hover:-translate-y-0.5"
                                >
                                    Sign Up
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-slate-500 font-medium hidden sm:block">John Doe</span>
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-white shadow-md cursor-pointer" title="User Profile"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
