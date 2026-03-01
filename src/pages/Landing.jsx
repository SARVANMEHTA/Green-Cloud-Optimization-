import React, { useState, useEffect } from 'react';
import { Leaf, Cpu, Zap, Activity, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className="landing-page">
            {/* Decorative Particles */}
            <div className="particle" style={{ top: '20%', left: '10%', '--dur': '8s', '--tx': '40px', '--ty': '-60px' }}></div>
            <div className="particle" style={{ top: '60%', left: '80%', '--dur': '6s', '--tx': '-30px', '--ty': '-40px' }}></div>
            <div className="particle" style={{ top: '30%', left: '60%', '--dur': '10s', '--tx': '20px', '--ty': '80px' }}></div>

            <div className="hero-section">
                <div className={`hero-badge ${mounted ? 'active' : ''}`}>
                    <Leaf size={14} /> NEW: Real-time Carbon Intensity Caching
                </div>

                <h1 className="hero-title">
                    Make Every Build<br />Count for the <span className="highlight">Planet</span>
                </h1>

                <p className="hero-subtitle">
                    Green Cloud Optimization tracks the invisible energy cost of your software pipelines.
                    Monitor CPU telemetry, calculate real CO₂ emissions, and optimize workflows
                    across GitHub Actions, GitLab CI, Jenkins, and CircleCI.
                </p>

                <div className="hero-actions">
                    <Link to="/dashboard" className="btn btn-primary btn-lg">
                        Launch Dashboard <ArrowRight size={18} />
                    </Link>
                    <Link to="/calculator" className="btn btn-secondary btn-lg">
                        Try Energy Calculator
                    </Link>
                </div>

                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="stat-value">20%</div>
                        <div className="stat-label">Global IT Power by 2025</div>
                    </div>
                    <div className="hero-stat">
                        <div className="stat-value">8%</div>
                        <div className="stat-label">Accuracy vs 30% via Telemetry</div>
                    </div>
                    <div className="hero-stat">
                        <div className="stat-value">$241B</div>
                        <div className="stat-label">Green Data Market by 2030</div>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <div className="section-header" style={{ textAlign: 'center' }}>
                    <h2>Core Capabilities</h2>
                    <p>Everything you need to optimize your CI/CD carbon footprint.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green-400)' }}>
                            <Activity size={24} />
                        </div>
                        <h3 className="feature-title">Real-time Telemetry</h3>
                        <p className="feature-desc">Agent-based monitoring captures actual CPU, memory, and pipeline runtimes, substituting TDP estimates with exact data when available on Oracle OCI.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue-400)' }}>
                            <Zap size={24} />
                        </div>
                        <h3 className="feature-title">Live Carbon Intensity</h3>
                        <p className="feature-desc">Grid emission factors are fetched live via Electricity Maps and cached at the Cloudflare edge for blazing fast, highly-accurate CO₂ calculations.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(167, 139, 250, 0.1)', color: 'var(--purple-400)' }}>
                            <Cpu size={24} />
                        </div>
                        <h3 className="feature-title">Workload Simulation</h3>
                        <p className="feature-desc">Test the impact of parallelization vs single-threading with our live workload simulator that directly visualizes peak vs idle energy scenarios.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'var(--amber-400)' }}>
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="feature-title">Redundancy Detection</h3>
                        <p className="feature-desc">Automatically identify duplicate jobs or test suites running with identical parameters that burn CPU cycles without adding value.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose-400)' }}>
                            <Award size={24} />
                        </div>
                        <h3 className="feature-title">ML Predictive Risk</h3>
                        <p className="feature-desc">A TensorFlow.js model predicts heavy CO₂ emission potential on PRs before the build even spins up the runner instance.</p>
                    </div>
                </div>
            </div>

            <footer className="footer">
                <p>Green Cloud Optimization — Designed and Developed by Byte Builders</p>
                <p style={{ marginTop: '10px' }}>Calculation Models: IEA 2025 • EPA eGRID 2024 • IPCC AR6 • Oracle PUE 1.15</p>
            </footer>
        </div>
    );
}
