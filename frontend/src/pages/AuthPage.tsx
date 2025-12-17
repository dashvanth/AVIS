import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        remember: false
    });

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setFormData({ ...formData, password: '' }); // Clear password for safety
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Basic Validation
        if (!formData.email || !formData.password) {
            setError("Please fill in all required fields.");
            setIsLoading(false);
            return;
        }
        if (!isLogin && !formData.name) {
            setError("Please enter your name.");
            setIsLoading(false);
            return;
        }

        // Simulate API call delay for UX
        setTimeout(() => {
            // Mock Success
            const mockToken = "mock_access_token_bypass";
            const mockUser = formData.name || "User";

            // Store mock token
            if (formData.remember) {
                localStorage.setItem('token', mockToken);
                localStorage.setItem('userName', mockUser);
            } else {
                sessionStorage.setItem('token', mockToken);
                sessionStorage.setItem('userName', mockUser);
            }

            // Redirect to Dashboard
            navigate('/app');
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-avis-primary flex items-stretch overflow-hidden">
            {/* Left Side: Visuals */}
            <div className="hidden lg:flex w-1/2 relative bg-avis-primary flex-col justify-between p-12 border-r border-avis-border/30">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-avis-accent-indigo opacity-20 blur-[150px] rounded-full -mt-20 -mr-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-avis-accent-cyan opacity-10 blur-[120px] rounded-full -mb-20 -ml-20 animate-blob animation-delay-4000"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="p-2 rounded-xl bg-gradient-to-br from-avis-accent-indigo to-avis-accent-cyan shadow-lg">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            A.V.I.S.
                        </h1>
                    </div>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold text-white leading-tight mb-6">
                        Unlock the power of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan">Automated Intelligence</span>.
                    </h2>
                    <p className="text-lg text-avis-text-secondary max-w-md">
                        Join thousands of data-driven professionals who are transforming raw data into actionable insights in seconds.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-avis-text-secondary/60">
                    &copy; {new Date().getFullYear()} AVIS Inc. Enterprise Grade Security.
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-avis-text-primary">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="mt-2 text-sm text-avis-text-secondary">
                            {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start your journey with AVIS today.'}
                        </p>
                    </div>

                    <div className="bg-avis-glass backdrop-blur-md border border-avis-border rounded-2xl p-8 shadow-2xl">
                        {/* Tabs */}
                        <div className="flex mb-8 bg-avis-secondary rounded-lg p-1 border border-avis-border/50">
                            <button
                                onClick={!isLogin ? toggleMode : undefined}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-avis-primary text-white shadow-sm' : 'text-avis-text-secondary hover:text-white'}`}
                            >
                                Log In
                            </button>
                            <button
                                onClick={isLogin ? toggleMode : undefined}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-avis-primary text-white shadow-sm' : 'text-avis-text-secondary hover:text-white'}`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1 overflow-hidden"
                                    >
                                        <label className="text-xs font-semibold text-avis-text-secondary uppercase">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-avis-text-secondary group-focus-within:text-avis-accent-indigo transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-2.5 bg-avis-primary border border-avis-border rounded-lg text-avis-text-primary placeholder-avis-text-secondary/50 focus:ring-2 focus:ring-avis-accent-indigo focus:border-transparent transition-all outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-avis-text-secondary uppercase">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-avis-text-secondary group-focus-within:text-avis-accent-indigo transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-avis-primary border border-avis-border rounded-lg text-avis-text-primary placeholder-avis-text-secondary/50 focus:ring-2 focus:ring-avis-accent-indigo focus:border-transparent transition-all outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-avis-text-secondary uppercase">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-avis-text-secondary group-focus-within:text-avis-accent-indigo transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-10 py-2.5 bg-avis-primary border border-avis-border rounded-lg text-avis-text-primary placeholder-avis-text-secondary/50 focus:ring-2 focus:ring-avis-accent-indigo focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-avis-text-secondary hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-avis-border bg-avis-primary text-avis-accent-indigo focus:ring-offset-0 focus:ring-1 focus:ring-avis-accent-indigo transition-all cursor-pointer"
                                    />
                                    <span className="text-sm text-avis-text-secondary group-hover:text-white transition-colors">Remember me</span>
                                </label>
                                {isLogin && (
                                    <a href="#" className="text-sm font-medium text-avis-accent-indigo hover:text-indigo-400 transition-colors">
                                        Forgot password?
                                    </a>
                                )}
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
                                >
                                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-200">{error}</p>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-avis-accent-indigo to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-avis-text-secondary">
                        By continuing, you agree to our <a href="#" className="text-avis-accent-indigo hover:underline">Terms of Service</a> and <a href="#" className="text-avis-accent-indigo hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
