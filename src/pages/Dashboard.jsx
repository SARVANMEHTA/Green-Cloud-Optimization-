import React, { useState, useEffect } from 'react';
import { Leaf, DollarSign, Activity, Zap, PlayCircle, GitBranch, Clock, BrainCircuit, CloudUpload } from 'lucide-react';
import { DEMO_BUILDS, DEMO_STAGE_BREAKDOWN, DEMO_ALERTS, DEMO_PROJECTS } from '../utils/demoData';
import { EnergyCard, AlertBanner, SuggestionCard } from '../components/UIComponents';
import { generateMLOptimizations } from '../utils/geminiAPI';
import {
    GreenScoreGauge, BuildDurationChart, ResourceUsageChart,
    StageBreakdownChart, PieFactorsChart
} from '../components/Charts';
import { calcGreenScore, getGrade } from '../utils/formulas';
import { useAuth } from '../context/AuthContext';
import { getUserPipelines, seedDemoData } from '../utils/dbOperations';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [projectId, setProjectId] = useState('1');
    const [builds, setBuilds] = useState([]);
    const [allBuilds, setAllBuilds] = useState([]);
    const [alerts, setAlerts] = useState(DEMO_ALERTS);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [expandedAnalysis, setExpandedAnalysis] = useState(null);
    const [dataSource, setDataSource] = useState('loading');
    const [isSeeding, setIsSeeding] = useState(false);

    // Load data from Firestore, fallback to demo data
    useEffect(() => {
        async function loadData() {
            if (!currentUser) return;
            try {
                const cloudData = await getUserPipelines(currentUser.uid);
                if (cloudData && cloudData.length > 0) {
                    setAllBuilds(cloudData);
                    setDataSource('cloud');
                } else {
                    setAllBuilds(DEMO_BUILDS);
                    setDataSource('local');
                }
            } catch (err) {
                console.warn('Firestore read failed, using local data:', err);
                setAllBuilds(DEMO_BUILDS);
                setDataSource('local');
            }
        }
        loadData();
    }, [currentUser]);

    // Filter builds by selected project
    useEffect(() => {
        const projBuilds = allBuilds.filter(b => b.projectId === projectId);
        setBuilds(projBuilds);
    }, [projectId, allBuilds]);

    const handleSeedToCloud = async () => {
        if (!currentUser) return;
        setIsSeeding(true);
        try {
            await seedDemoData(currentUser.uid);
            const cloudData = await getUserPipelines(currentUser.uid);
            if (cloudData) {
                setAllBuilds(cloudData);
                setDataSource('cloud');
            }
        } catch (err) {
            console.error('Seeding failed:', err);
        }
        setIsSeeding(false);
    };

    const handleDismissAlert = (id) => {
        setAlerts(alerts.filter(a => a.id !== id));
    };

    const handleAnalyzeWithAI = async () => {
        setIsAnalyzing(true);
        const selectedProject = DEMO_PROJECTS.find(p => p.id === projectId);
        const suggestions = await generateMLOptimizations(builds, selectedProject);
        setAiSuggestions(suggestions);
        setIsAnalyzing(false);
    };

    const handleAnalyzePipeline = async (build) => {
        setExpandedAnalysis({ id: build.id, isAnalyzing: true, insights: [] });
        const selectedProject = DEMO_PROJECTS.find(p => p.id === build.projectId);
        const suggestions = await generateMLOptimizations([build], selectedProject);
        setExpandedAnalysis({ id: build.id, isAnalyzing: false, insights: suggestions });
    };

    // Calculate aggregations
    const totalEnergyWh = builds.reduce((sum, b) => sum + b.energyWh, 0);
    const totalCO2g = builds.reduce((sum, b) => sum + b.co2Grams, 0);
    const totalCost = builds.reduce((sum, b) => sum + b.costUSD, 0);

    // Green Score (simulated vs benchmark)
    const co2Actual = totalCO2g;
    const co2Benchmark = builds.length * 200; // 200g per build target
    const redundantJobsPct = builds.filter(b => b.hasRedundancy).length / (builds.length || 1);
    const score = builds.length ? calcGreenScore(co2Actual, co2Benchmark, 0.05, redundantJobsPct) : 100;

    // Format for charts
    const durationData = builds.slice(0, 30).reverse().map(b => ({
        date: new Date(b.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        durationS: b.durationS,
        avg7d: b.durationS * 0.9 // mockup avg
    }));

    const resourceData = builds.slice(0, 50).reverse().map((b, i) => ({
        time: i,
        cpuPct: +(b.cpuUtil * 100).toFixed(1),
        memPct: +((b.memGB / 16) * 100).toFixed(1)
    }));

    const selectedProject = DEMO_PROJECTS.find(p => p.id === projectId);

    return (
        <div className="page-container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>CI/CD Emissions Dashboard</h1>
                    <p>Real-time telemetry and carbon tracking for your pipelines.</p>
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge ${dataSource === 'cloud' ? 'badge-green' : 'badge-amber'}`}>
                            {dataSource === 'cloud' ? '☁️ Cloud Firestore' : '💾 Local Demo Data'}
                        </span>
                        {dataSource === 'local' && (
                            <button
                                className="btn btn-sm"
                                style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--green-400)', fontSize: '0.75rem' }}
                                onClick={handleSeedToCloud}
                                disabled={isSeeding}
                            >
                                <CloudUpload size={14} /> {isSeeding ? 'Syncing...' : 'Sync to Cloud'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="dropdown-container">
                    <select
                        className="dropdown-trigger"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        style={{ appearance: 'auto' }}
                    >
                        {DEMO_PROJECTS.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.platform})</option>
                        ))}
                    </select>
                </div>
            </div>

            <AlertBanner alerts={alerts.filter(a => a.projectId === projectId)} onDismiss={handleDismissAlert} />

            <div className="kpi-grid">
                <EnergyCard
                    title="Total Energy"
                    value={(totalEnergyWh / 1000).toFixed(2)}
                    unit="kWh"
                    icon={<Zap />}
                    trend="down"
                    trendValue="12"
                    colorClass="text-amber-400"
                />
                <EnergyCard
                    title="Carbon Footprint"
                    value={totalCO2g.toFixed(0)}
                    unit="g CO₂eq"
                    icon={<Leaf />}
                    trend="down"
                    trendValue="8"
                    colorClass="text-green-400"
                />
                <EnergyCard
                    title="Estimated Cost"
                    value={`$${totalCost.toFixed(2)}`}
                    unit=""
                    icon={<DollarSign />}
                    trend="down"
                    trendValue="15"
                    colorClass="text-blue-400"
                />
                <div className="kpi-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                    <GreenScoreGauge score={score} />
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: 'var(--space-xl)', borderColor: 'var(--border-glow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
                        <BrainCircuit size={20} className="text-purple-400" />
                        Gemini AI Project Insights
                    </h2>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleAnalyzeWithAI}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? 'Analyzing Pipelines...' : 'Generate AI Insights ✨'}
                    </button>
                </div>

                {aiSuggestions.length === 0 && !isAnalyzing && (
                    <div style={{ color: 'var(--text-tertiary)' }}>
                        Click the button above to analyze recent telemetry across this project and uncover structural optimization opportunities.
                    </div>
                )}

                {isAnalyzing && (
                    <div className="skeleton" style={{ height: '60px', width: '100%', borderRadius: 'var(--radius-md)' }}></div>
                )}

                {!isAnalyzing && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                        {aiSuggestions.map((suggestion, idx) => (
                            <SuggestionCard key={idx} impact={suggestion.impact} message={suggestion.message} />
                        ))}
                    </div>
                )}
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <div className="chart-title"><Activity size={18} className="chart-icon" /> Resource Utilization Trace</div>
                    <div className="chart-subtitle">CPU & Memory footprint over last 50 builds</div>
                    <ResourceUsageChart data={resourceData} />
                </div>

                <div className="chart-card">
                    <div className="chart-title"><Clock size={18} className="chart-icon" /> Build Duration Trends</div>
                    <div className="chart-subtitle">Execution time vs 7-day rolling average</div>
                    <BuildDurationChart data={durationData} />
                </div>

                <div className="chart-card">
                    <div className="chart-title"><Zap size={18} className="chart-icon" /> Energy by Stage (Last Run)</div>
                    <div className="chart-subtitle">Where is the power being consumed?</div>
                    <StageBreakdownChart data={DEMO_STAGE_BREAKDOWN} />
                </div>
            </div>

            <div className="section-header" style={{ marginTop: 'var(--space-2xl)' }}>
                <h2>Recent Pipeline Executions</h2>
            </div>

            <div className="pipeline-list">
                {builds.slice(0, 10).map(build => (
                    <div key={build.id}>
                        <div className="pipeline-item">
                            <div className={`pipeline-status ${build.status}`}></div>
                            <div className="pipeline-name">
                                <div>{build.id}</div>
                                <div className="pipeline-meta" style={{ display: 'flex', gap: '15px', marginTop: '4px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><GitBranch size={12} /> {build.branch}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {Math.round(build.durationS / 60)}m {Math.round(build.durationS % 60)}s</span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600, color: 'var(--green-400)' }}>{build.co2Grams.toFixed(1)}g CO₂</div>
                                <div className="pipeline-meta">{build.energyWh.toFixed(2)} Wh • {build.region}</div>
                            </div>

                            {build.hasRedundancy && (
                                <div className="badge badge-rose" style={{ marginLeft: '10px' }}>Redundant</div>
                            )}

                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ marginLeft: '15px' }}
                                onClick={() => handleAnalyzePipeline(build)}
                                disabled={expandedAnalysis?.id === build.id && expandedAnalysis.isAnalyzing}
                            >
                                <BrainCircuit size={14} /> Analyze
                            </button>
                        </div>

                        {expandedAnalysis?.id === build.id && (
                            <div className="glass-card" style={{ marginTop: '10px', marginBottom: '20px', padding: '15px', background: 'var(--bg-card)' }}>
                                <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    AI Run Diagnostics for {build.id}
                                </div>
                                {expandedAnalysis.isAnalyzing ? (
                                    <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: 'var(--radius-sm)' }}></div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {expandedAnalysis.insights.map((s, idx) => (
                                            <SuggestionCard key={idx} impact={s.impact} message={s.message} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div >
    );
}
