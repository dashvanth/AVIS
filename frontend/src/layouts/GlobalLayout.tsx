import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  X,
  Zap,
  UploadCloud
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const GlobalLayout: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState("Guest User");
  const [userInitials, setUserInitials] = useState("GU");

  // Add scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load User Info
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUsername(storedName);
      // Generate initials
      const parts = storedName.split(" ");
      if (parts.length >= 2) {
        setUserInitials((parts[0][0] + parts[1][0]).toUpperCase());
      } else {
        setUserInitials(storedName.substring(0, 2).toUpperCase());
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/0 ${scrolled
          ? "bg-slate-950/80 backdrop-blur-xl border-white/5 py-3 shadow-lg shadow-black/20"
          : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">A.V.I.S.</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">COMMAND HUB</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
            <NavLink
              to="/app"
              end
              className={({ isActive }) => `px-5 py-2 rounded-full text-sm font-medium transition-all ${isActive
                ? "bg-white text-slate-900 shadow-lg shadow-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              Project Gallery
            </NavLink>
            <NavLink
              to="/app/datasets"
              className={({ isActive }) => `px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isActive
                ? "bg-white text-slate-900 shadow-lg shadow-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <UploadCloud className="w-4 h-4" />
              Upload Dataset
            </NavLink>
          </nav>

          {/* Action Area */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-bold text-white">{username}</div>
                <div className="text-[10px] text-emerald-400 font-medium">System Online</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-400">{userInitials}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-slate-950 pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-4">
              <NavLink to="/app" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-white py-3 border-b border-white/5">Project Gallery</NavLink>
              <NavLink to="/app/datasets" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-white py-3 border-b border-white/5">Upload Dataset</NavLink>
              <button onClick={handleLogout} className="text-xl font-bold text-red-400 py-3 border-b border-white/5 text-left">Log Out</button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12 w-full relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default GlobalLayout;
