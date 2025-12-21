import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { login, signup } from "../services/api"; // Ensure these are imported

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    remember: false,
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({ ...formData, password: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Actual Backend Login (Functionality 7)
        const response = await login(formData.email, formData.password);
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("userName", response.user.full_name);
      } else {
        // Actual Backend Signup (Functionality 7)
        await signup(formData.email, formData.password, formData.name);
        setIsLogin(true); // Switch to login after successful signup
        setError("Account created! Please sign in.");
        setIsLoading(false);
        return;
      }
      navigate("/app");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Authentication failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-avis-primary flex items-stretch overflow-hidden">
      {/* Left Side: Educational Messaging */}
      <div className="hidden lg:flex w-1/2 relative bg-avis-primary flex-col justify-between p-12 border-r border-avis-border/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-avis-accent-indigo opacity-10 blur-[150px] rounded-full -mt-20 -mr-20"></div>

        <div className="relative z-10">
          <div
            className="flex items-center space-x-3 mb-8 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-avis-accent-indigo to-avis-accent-cyan">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              A.V.I.S.
            </h1>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-avis-accent-cyan/10 border border-avis-accent-cyan/20 text-avis-accent-cyan text-[10px] font-bold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3 h-3" /> Secure Access Only
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-6 tracking-tighter">
            Your data journey <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan">
              starts here
            </span>
            .
          </h2>
          <p className="text-lg text-avis-text-secondary max-w-md opacity-80">
            Join A.V.I.S. to experience guided analysis where every step is
            explained and no logic is hidden.
          </p>
        </div>

        <div className="relative z-10 text-[10px] font-mono text-avis-text-secondary/40 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} AVIS PROJECT // SECURE AUTH ENGINE
        </div>
      </div>

      {/* Right Side: Simple Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black tracking-tighter text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-2 text-sm text-avis-text-secondary opacity-70">
              {isLogin
                ? "Sign in to access your secure dataset hub."
                : "Start your journey toward honest data analysis."}
            </p>
          </div>

          <div className="bg-avis-secondary/30 backdrop-blur-3xl border border-avis-border/50 rounded-[2rem] p-8 shadow-2xl">
            {/* Tabs */}
            <div className="flex mb-8 bg-avis-primary/50 rounded-2xl p-1.5 border border-avis-border/30">
              <button
                onClick={() => !isLogin && toggleMode()}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                  isLogin
                    ? "bg-avis-accent-indigo text-white shadow-lg"
                    : "text-avis-text-secondary hover:text-white"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => isLogin && toggleMode()}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                  !isLogin
                    ? "bg-avis-accent-indigo text-white shadow-lg"
                    : "text-avis-text-secondary hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-1"
                  >
                    <label className="text-[10px] font-bold text-avis-text-secondary uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-avis-text-secondary group-focus-within:text-avis-accent-indigo transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3.5 bg-avis-primary/50 border border-avis-border/50 rounded-2xl text-white placeholder-avis-text-secondary/30 focus:ring-2 focus:ring-avis-accent-indigo/50 focus:border-avis-accent-indigo transition-all outline-none text-sm"
                        placeholder="Enter your name"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-avis-text-secondary uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-avis-text-secondary group-focus-within:text-avis-accent-indigo transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-avis-primary/50 border border-avis-border/50 rounded-2xl text-white placeholder-avis-text-secondary/30 focus:ring-2 focus:ring-avis-accent-indigo/50 focus:border-avis-accent-indigo transition-all outline-none text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-avis-text-secondary uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-avis-text-secondary group-focus-within:text-avis-accent-indigo transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-11 py-3.5 bg-avis-primary/50 border border-avis-border/50 rounded-2xl text-white placeholder-avis-text-secondary/30 focus:ring-2 focus:ring-avis-accent-indigo/50 focus:border-avis-accent-indigo transition-all outline-none text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-avis-text-secondary hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200 leading-relaxed font-medium">
                    {error}
                  </p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-avis-accent-indigo hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
