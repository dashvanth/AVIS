import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronRight, Cpu, Lock, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-avis-primary text-avis-text-primary selection:bg-avis-accent-indigo selection:text-white font-sans overflow-x-hidden">

            {/* 4. Hero Section */}
            <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-avis-accent-indigo opacity-10 blur-[120px] rounded-full -z-10 animate-blob"></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Content */}
                    <div className="space-y-8 text-center lg:text-left animate-fade-in-up">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-avis-accent-indigo/10 border border-avis-accent-indigo/20 text-avis-accent-indigo text-xs font-semibold tracking-wide uppercase mb-4">
                            <span className="w-2 h-2 rounded-full bg-avis-accent-indigo mr-2 animate-pulse"></span>
                            AI-Powered Analytics v2.0
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                            Turn Raw Data into <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan min-h-[1.2em] inline-block">
                                <TypewriterText
                                    words={["Clear Intelligence", "Actionable Insights", "Smart Decisions", "Future Growth"]}
                                    typingSpeed={100}
                                    deletingSpeed={50}
                                    pauseTime={2000}
                                />
                            </span>
                        </h1>
                        <p className="text-xl text-avis-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            A.V.I.S. is the enterprise-grade automated intelligence system that ingests raw datasets, identifies anomalies, and generates boardroom-ready visualizations in milliseconds.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                            <button
                                onClick={() => navigate('/app')}
                                className="w-full sm:w-auto px-8 py-4 bg-avis-accent-indigo hover:bg-indigo-500 text-white rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                Get Started
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Visual */}
                    <div className="relative animate-fade-in-up [animation-delay:200ms]">
                        <div className="relative z-10 bg-avis-glass backdrop-blur-xl border border-avis-border rounded-2xl p-6 shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700 ease-out">
                            {/* Abstract Dashboard UI Mockup */}
                            <div className="flex items-center justify-between mb-6 border-b border-avis-border pb-4">
                                <div className="space-y-2">
                                    <div className="h-3 w-32 bg-avis-border rounded animate-pulse"></div>
                                    <div className="h-2 w-20 bg-avis-border rounded animate-pulse opacity-50"></div>
                                </div>
                                <div className="h-8 w-8 bg-avis-accent-success/20 rounded-full flex items-center justify-center text-avis-accent-success">
                                    <Zap className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-32 w-full bg-gradient-to-r from-avis-accent-indigo/10 to-transparent rounded-lg border border-avis-border relative overflow-hidden">
                                    {/* Fake Chart Line */}
                                    <svg className="absolute bottom-0 left-0 w-full h-20 text-avis-accent-indigo" fill="none" viewBox="0 0 400 100" preserveAspectRatio="none">
                                        <path d="M0 80 C 50 80, 50 20, 100 20 C 150 20, 150 60, 200 60 C 250 60, 250 40, 300 40 C 350 40, 350 10, 400 50 L 400 100 L 0 100 Z" fill="currentColor" fillOpacity="0.2" />
                                        <path d="M0 80 C 50 80, 50 20, 100 20 C 150 20, 150 60, 200 60 C 250 60, 250 40, 300 40 C 350 40, 350 10, 400 50" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-20 bg-avis-secondary rounded-lg border border-avis-border p-3">
                                        <div className="h-2 w-16 bg-avis-border rounded mb-2"></div>
                                        <div className="h-6 w-12 bg-avis-accent-cyan/20 rounded text-avis-accent-cyan text-xs flex items-center justify-center font-mono">+12.5%</div>
                                    </div>
                                    <div className="h-20 bg-avis-secondary rounded-lg border border-avis-border p-3">
                                        <div className="h-2 w-16 bg-avis-border rounded mb-2"></div>
                                        <div className="h-6 w-24 bg-avis-accent-success/20 rounded text-avis-accent-success text-xs flex items-center justify-center font-mono">Recommended</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating Element */}
                        <div className="absolute -bottom-10 -left-10 bg-avis-secondary border border-avis-border p-4 rounded-xl shadow-xl z-20 animate-bounce [animation-duration:3s]">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-avis-accent-success flex items-center justify-center text-avis-primary font-bold">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">Anomaly Detected</div>
                                    <div className="text-avis-text-secondary text-xs">98% Confidence</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Platform Intro (Pre-signin context) */}
            < section id="about" className="py-16 bg-avis-secondary/30 border-y border-avis-border/50" >
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-mono text-avis-accent-cyan mb-4 uppercase tracking-widest">The Platform</p>
                    <h2 className="text-3xl font-bold text-white mb-8">What is A.V.I.S?</h2>
                    <p className="max-w-3xl mx-auto text-lg text-avis-text-secondary leading-relaxed">
                        AVIS is an autonomous data science companion. Instead of relying on manual Pandas scripts or Excel macros,
                        you simply provide the raw data. Our platform handles the cleaning, processing, statistical analysis, and
                        visualization generation automatically. It's like having a dedicated data scientist available 24/7.
                    </p>
                </div>
            </section >

            {/* 5. Advanced Features */}
            < section id="features" className="py-24 bg-avis-secondary relative overflow-hidden" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Enterprise Data Intelligence
                        </h2>
                        <p className="text-avis-text-secondary mt-4">Built for scale, speed, and accuracy.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Cpu className="w-8 h-8 text-avis-accent-indigo" />}
                            title="Automated Neural Processing"
                            features={['Deep Schema Detection', 'Null-Value Imputation', 'Outlier flagging']}
                        />
                        <FeatureCard
                            icon={<Share2 className="w-8 h-8 text-avis-accent-cyan" />}
                            title="Dynamic Visualization Engine"
                            features={['Auto-generated Dashboards', 'Interactive Plotly JS Charts', 'Drag-and-Drop Builder']}
                        />
                        <FeatureCard
                            icon={<Lock className="w-8 h-8 text-avis-accent-success" />}
                            title="Secure & Scalable"
                            features={['Client-side Encryption', 'Enterprise-grade Security', 'High-performance Pandas Backend']}
                        />
                    </div>
                </div>
            </section >

            {/* 6. How A.V.I.S Works (Enhanced) */}
            < section id="workflow" className="py-24 bg-avis-primary border-t border-avis-border" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-avis-text-primary">Workflow Architecture</h2>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start relative px-4">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-avis-border via-avis-accent-indigo/50 to-avis-border -z-0"></div>

                        {[
                            { step: '01', title: 'Ingestion', desc: 'Securely upload CSV/XLSX assets' },
                            { step: '02', title: 'Processing', desc: 'Auto-cleaning & Structuring' },
                            { step: '03', title: 'Analysis', desc: 'Statistical Modeling & EDA' },
                            { step: '04', title: 'Visualization', desc: 'Dashboard Generation' },
                            { step: '05', title: 'Deployment', desc: 'Export & Share Insights' }
                        ].map((item, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                className="relative z-10 flex flex-col items-center text-center w-full md:w-1/5 mb-8 md:mb-0 group cursor-default"
                            >
                                <div className="w-16 h-16 rounded-xl bg-avis-secondary border border-avis-border group-hover:border-avis-accent-indigo group-hover:bg-avis-accent-indigo group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center text-xl font-mono font-bold text-avis-text-secondary group-hover:text-white mb-4 rotate-45 group-hover:rotate-0 duration-500">
                                    <span className="-rotate-45 group-hover:rotate-0 transition-transform duration-500">{item.step}</span>
                                </div>
                                <h3 className="text-lg font-bold text-avis-text-primary mb-1 mt-2">{item.title}</h3>
                                <p className="text-sm text-avis-text-secondary max-w-[150px]">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* 7. Call To Action */}
            < section className="py-20 bg-gradient-to-b from-avis-secondary to-avis-primary border-y border-avis-border" >
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to transform your data?
                    </h2>
                    <p className="text-xl text-avis-text-secondary mb-8">
                        Join thousands of data-driven teams using AVIS to make better decisions faster.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-8 py-3 bg-white text-avis-primary font-bold text-lg rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-8 py-3 bg-avis-accent-indigo text-white font-bold text-lg rounded-full hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30"
                        >
                            Sign Up Now
                        </button>
                    </div>
                </div>
            </section >



            {/* 9. Footer (Simplified) */}
            < footer className="bg-avis-primary border-t border-avis-border pt-16 pb-8" >
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between gap-12 mb-12">
                    <div className="max-w-sm">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan mb-4">A.V.I.S.</h3>
                        <p className="text-avis-text-secondary text-sm leading-relaxed">
                            Analytical Visual Intelligence System. <br />
                            Empowering everyone to make data-driven decisions.
                        </p>
                    </div>
                    <div className="flex gap-12">
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
                            <ul className="space-y-2 text-sm text-avis-text-secondary">
                                <li><a href="#" className="hover:text-avis-accent-cyan transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-avis-accent-cyan transition-colors">Workflow</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Access</h4>
                            <ul className="space-y-2 text-sm text-avis-text-secondary">
                                <li><button onClick={() => navigate('/auth')} className="hover:text-avis-accent-cyan transition-colors">Sign In</button></li>
                                <li><button onClick={() => navigate('/auth')} className="hover:text-avis-accent-cyan transition-colors">Log In</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="text-center text-xs text-avis-text-secondary border-t border-avis-border pt-8">
                    &copy; {new Date().getFullYear()} AVIS Inc. All rights reserved.
                </div>
            </footer >
        </div >
    );
};

const FeatureCard = ({ icon, title, features }: { icon: React.ReactNode, title: string, features: string[] }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-avis-glass backdrop-blur-md border border-avis-border p-8 rounded-2xl hover:border-avis-accent-indigo/30 transition-all group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-avis-accent-indigo/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>

        <div className="mb-6 p-4 bg-avis-primary rounded-xl w-fit border border-avis-border group-hover:scale-110 transition-transform duration-300 relative z-10">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-avis-text-primary mb-4 relative z-10">{title}</h3>
        <ul className="space-y-3 relative z-10">
            {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-avis-text-secondary">
                    <span className="text-avis-accent-indigo mt-0.5"><ChevronRight className="w-3 h-3" /></span>
                    {feat}
                </li>
            ))}
        </ul>
    </motion.div>
);

export default LandingPage;
