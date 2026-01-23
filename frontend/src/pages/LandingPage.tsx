import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Layout,
  FileSpreadsheet,
  Binary,
  Microscope,
  MousePointer2,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { TypewriterText } from "../components/TypewriterText";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Lightweight Cursor Glow (Hardware-Friendly)
  useEffect(() => {
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      frameId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-avis-primary text-avis-text-primary selection:bg-avis-accent-indigo selection:text-white font-sans overflow-x-hidden relative">
      {/* Optimized Background Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-30 opacity-20 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
        }}
      />

      {/* Hero Section - Tight spacing (pt-10) */}
      <section className="relative pt-10 pb-24 lg:pt-16 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-avis-accent-indigo opacity-5 blur-[120px] rounded-full -z-10 animate-blob"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Simple Educational Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-avis-accent-indigo/10 border border-avis-accent-indigo/20 text-avis-accent-indigo text-[10px] font-bold tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-avis-accent-indigo mr-2 animate-pulse"></span>
              A.V.I.S. Smart Discovery v2.0
            </div>
            <h1 className="text-5xl lg:text-8xl font-black leading-[0.9] tracking-tighter">
              Making Data <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan min-h-[1.2em] inline-block">
                <TypewriterText
                  words={[
                    "Easy to Understand",
                    "Clear for Everyone",
                    "Totally Honest",
                    "Beginner Friendly",
                  ]}
                  typingSpeed={80}
                  deletingSpeed={40}
                  pauseTime={2500}
                />
              </span>
            </h1>
            <p className="text-lg text-avis-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-80">
              Stop fighting with complicated spreadsheets. A.V.I.S. explains
              your data simply, shows you exactly what was cleaned, and builds
              your charts automatically.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto px-10 py-4 bg-avis-accent-indigo hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <MousePointer2 className="w-5 h-5" />
                Start Now - It's Free
              </button>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="relative">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 bg-avis-glass backdrop-blur-3xl border border-avis-border/40 rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8 border-b border-avis-border/20 pb-6">
                <div className="space-y-2">
                  <div className="h-2 w-24 bg-avis-border rounded-full opacity-50"></div>
                  <div className="text-[9px] font-mono text-avis-accent-cyan uppercase tracking-widest">
                    Transparency_Engine_Live
                  </div>
                </div>
                <div className="h-10 w-10 bg-avis-accent-success/10 rounded-2xl flex items-center justify-center text-avis-accent-success">
                  <Microscope className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-4 font-mono text-[10px] leading-relaxed">
                <div className="p-4 bg-black/30 rounded-2xl border border-avis-border/30 text-avis-text-secondary">
                  <p className="text-avis-accent-indigo mb-1">
                    [AUDIT] Removed 5 empty rows
                  </p>
                  <p className="text-avis-accent-success">
                    [AUDIT] Fixed 12 missing values
                  </p>
                  <p className="text-avis-accent-cyan">
                    [AUDIT] Verified 8 data columns
                  </p>
                </div>
                <div className="h-24 w-full bg-avis-primary/50 rounded-2xl border border-avis-border/20 relative overflow-hidden">
                  <svg
                    className="absolute bottom-0 left-0 w-full h-16 text-avis-accent-cyan/30"
                    fill="none"
                    viewBox="0 0 400 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 80 Q 100 20, 200 80 T 400 80 L 400 100 L 0 100 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Honest Logic Badge */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-avis-secondary/90 backdrop-blur-md border border-avis-border/50 p-5 rounded-2xl shadow-2xl z-20"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-avis-accent-cyan/20 flex items-center justify-center text-avis-accent-cyan">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm leading-none">
                    Honest Logic
                  </div>
                  <div className="text-avis-text-secondary text-[10px] mt-1 uppercase tracking-tighter">
                    No Secrets Inside
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section
        id="about"
        className="py-20 bg-avis-secondary/20 border-y border-avis-border/30"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold text-avis-accent-cyan mb-4 uppercase tracking-[0.3em]">
            The Vision
          </p>
          <h2 className="text-3xl font-black text-white mb-6">
            Built for Learning
          </h2>
          <p className="max-w-2xl mx-auto text-avis-text-secondary leading-relaxed opacity-80">
            A.V.I.S. is a personal project designed to make data science
            accessible. Instead of hidden algorithms, we provide a guided
            experience that teaches you "What, Why, and How" at every stage.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-avis-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<FileSpreadsheet className="w-7 h-7" />}
              title="Upload Anything"
              features={[
                "Excel & CSV Ready",
                "JSON & XML Support",
                "Instant Data Summary",
              ]}
              color="indigo"
            />
            <FeatureCard
              icon={<Binary className="w-7 h-7" />}
              title="Honest Analysis"
              features={[
                "See Every Change",
                "Step-by-Step Cleaning",
                "Transparent Audit Trail",
              ]}
              color="cyan"
            />
            <FeatureCard
              icon={<Layout className="w-7 h-7" />}
              title="Guided Insights"
              features={[
                "Auto-Dashboards",
                "No Hidden Logic",
                "Simple Explanations",
              ]}
              color="success"
            />
          </div>
        </div>
      </section>

      {/* RESTORED Workflow Architecture */}
      <section
        id="workflow"
        className="py-24 bg-avis-primary border-t border-avis-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-avis-text-primary">
              How A.V.I.S. Works
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start relative px-4">
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-avis-border via-avis-accent-indigo/50 to-avis-border -z-0"></div>

            {[
              {
                step: "01",
                title: "Upload",
                desc: "Secure Multi-Format Storage",
              },
              { step: "02", title: "Audit", desc: "See Every Single Change" },
              { step: "03", title: "Check", desc: "Smart System Processing" },
              { step: "04", title: "View", desc: "See Your Data Visually" },
              { step: "05", title: "Learn", desc: "Understand Your Insights" },
            ].map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                className="relative z-10 flex flex-col items-center text-center w-full md:w-1/5 mb-8 md:mb-0 group cursor-default"
              >
                <div className="w-16 h-16 rounded-xl bg-avis-secondary border border-avis-border group-hover:border-avis-accent-indigo group-hover:bg-avis-accent-indigo transition-all flex items-center justify-center text-xl font-mono font-bold text-avis-text-secondary group-hover:text-white mb-4 rotate-45 group-hover:rotate-0 duration-500">
                  <span className="-rotate-45 group-hover:rotate-0 transition-transform duration-500">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-avis-text-primary mb-1 mt-2">
                  {item.title}
                </h3>
                <p className="text-sm text-avis-text-secondary max-w-[150px]">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Professional Footer */}
      <footer className="bg-avis-primary border-t border-avis-border/30 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-sm">
              <h3 className="text-3xl font-black tracking-tighter text-white mb-4">
                A.V.I.S.
              </h3>
              <p className="text-avis-text-secondary text-sm leading-relaxed opacity-70">
                The Analytical Visual Intelligence System. <br />
                Dedicated to making complex data analysis honest, visual, and
                easy for everyone to learn.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16 text-sm text-avis-text-secondary font-semibold">
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-avis-accent-indigo">
                  Workspace
                </p>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => navigate("/auth")}
                      className="hover:text-white transition-colors"
                    >
                      Log In
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/auth")}
                      className="hover:text-white transition-colors"
                    >
                      Sign Up
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/app/datasets")}
                      className="hover:text-white transition-colors"
                    >
                      Dataset Hub
                    </button>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-avis-accent-cyan">
                  Project Info
                </p>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#about"
                      className="hover:text-white transition-colors"
                    >
                      How it works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#features"
                      className="hover:text-white transition-colors"
                    >
                      Key Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#workflow"
                      className="hover:text-white transition-colors"
                    >
                      Workflow
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-avis-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-mono text-avis-text-secondary/40 uppercase tracking-widest">
              © {new Date().getFullYear()} AVIS PROJECT // SOLE DEVELOPER
              EDITION
            </p>
            <div className="flex gap-4 opacity-20">
              <div className="w-1.5 h-1.5 rounded-full bg-avis-accent-indigo"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-avis-accent-cyan"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-avis-accent-success"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  features,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  features: string[];
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-avis-glass backdrop-blur-md border border-avis-border/40 p-10 rounded-[2.5rem] hover:border-avis-accent-indigo/40 transition-all group"
  >
    <div
      className={`mb-6 p-4 bg-avis-primary rounded-2xl w-fit border border-avis-border/50 group-hover:scale-110 transition-transform duration-500 text-avis-accent-${color}`}
    >
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
    <ul className="space-y-3">
      {features.map((feat, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-sm text-avis-text-secondary opacity-80"
        >
          <span className="text-avis-accent-indigo mt-0.5">
            <ChevronRight className="w-3 h-3" />
          </span>
          {feat}
        </li>
      ))}
    </ul>
  </motion.div>
);

export default LandingPage;
