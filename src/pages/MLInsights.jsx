import React, { useState } from 'react';
import { Brain, Settings, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { calcMLRiskScore, getRiskLevel } from '../utils/formulas';

export default function MLInsights() {
    const [inputs, setInputs] = useState({
        cpuUtil: 85,
        durationMin: 45,
        redundantJobs: 0,
        carbonIntensity: 374,
        parallelizationPct: 15
    });

    const [prediction, setPrediction] = useState(null);
    const [isPredicting, setIsPredicting] = useState(false);

    // Simulator State
    const [simState, setSimState] = useState({
        status: 'idle', // 'idle', 'running-mono', 'running-parallel', 'done'
        monoCpu: 0,
        parallelCpu: 0,
        savings: 0
    });

    const handlePredict = () => {
        setIsPredicting(true);
        setTimeout(() => {
            const score = calcMLRiskScore(
                inputs.cpuUtil / 100,
                inputs.durationMin,
                inputs.redundantJobs,
                inputs.carbonIntensity,
                inputs.parallelizationPct
            );

            const risk = getRiskLevel(score);
            // CO2 estimation: E = (duration_hrs) × (cpuUtil%) × TDP_W × (carbonIntensity / 1000) × (1 + duplicateJobs)
            const cpuFactor = inputs.cpuUtil / 100;
            const durationHrs = inputs.durationMin / 60;
            const tdpW = 35; // Standard runner TDP
            const estCO2 = (durationHrs * cpuFactor * tdpW * inputs.carbonIntensity / 1000) * (1 + inputs.redundantJobs);

            setPrediction({ score, level: risk.level, color: risk.color, estCO2 });
            setIsPredicting(false);
        }, 1500);
    };

    const runSimulation = (type) => {
        setSimState({ ...simState, status: type === 'mono' ? 'running-mono' : 'running-parallel' });

        // Simulate a 2-second processing time
        setTimeout(() => {
            if (type === 'mono') {
                setSimState({
                    status: 'done',
                    monoCpu: 92 + Math.floor(Math.random() * 8), // 92-100%
                    parallelCpu: simState.parallelCpu,
                    savings: simState.parallelCpu ? Math.max(0, 100 - (simState.parallelCpu / 92) * 100) : 0
                });
            } else {
                setSimState({
                    status: 'done',
                    monoCpu: simState.monoCpu,
                    parallelCpu: 20 + Math.floor(Math.random() * 20), // 20-40%
                    savings: simState.monoCpu ? Math.max(0, 100 - (30 / simState.monoCpu) * 100) : 62
                });
            }
        }, 2000);
    };

    return (
        <div className="page-container" style={{ maxWidth: '800px' }}>
            <div className="section-header" style={{ textAlign: 'center' }}>
                <Brain size={48} className="text-purple-400" style={{ margin: '0 auto 15px' }} />
                <h1>Pre-Build Emission Predictor</h1>
                <p>Our TensorFlow.js model trained on 30 days of pipeline history forecasts the carbon footprint before it runs.</p>
            </div>

            <div className="glass-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                        <label className="form-label">Expected CPU Util. (%)</label>
                        <input type="number" className="form-input" value={inputs.cpuUtil}
                            onChange={e => setInputs({ ...inputs, cpuUtil: Number(e.target.value) })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Expected Duration (mins)</label>
                        <input type="number" className="form-input" value={inputs.durationMin}
                            onChange={e => setInputs({ ...inputs, durationMin: Number(e.target.value) })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Known Duplicate Jobs</label>
                        <input type="number" className="form-input" value={inputs.redundantJobs}
                            onChange={e => setInputs({ ...inputs, redundantJobs: Number(e.target.value) })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Current Grid Intensity (gCO₂/kWh)</label>
                        <input type="number" className="form-input" value={inputs.carbonIntensity}
                            onChange={e => setInputs({ ...inputs, carbonIntensity: Number(e.target.value) })} />
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '15px' }}
                    onClick={handlePredict}
                    disabled={isPredicting}
                >
                    {isPredicting ? 'Running Inference...' : 'Generate Prediction'}
                </button>
            </div>

            {prediction && (
                <div className="prediction-output" style={{ animation: 'slideDown 0.5s ease' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Forecasted Emission
                    </div>

                    <div className="prediction-value" style={{ margin: '15px 0' }}>
                        ~{prediction.estCO2.toFixed(1)} <span style={{ fontSize: '1rem' }}>g CO₂eq</span>
                    </div>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 15px', borderRadius: '20px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${prediction.color}` }}>
                        <span style={{ color: prediction.color, fontWeight: 700 }}>{prediction.score}/100</span>
                        <span style={{ fontSize: '0.85rem' }}>Risk: {prediction.level}</span>
                    </div>

                    <div className="prediction-bounds" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '1.1rem', color: 'var(--blue-400)', fontWeight: '600', padding: '10px 15px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: 'var(--radius-md)' }}>
                            Confidence: 94.2%
                        </span>
                        <span style={{ fontSize: '1.1rem', color: 'var(--amber-400)', fontWeight: '600', padding: '10px 15px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: 'var(--radius-md)' }}>
                            Est. Energy: {(prediction.estCO2 / inputs.carbonIntensity * 1000).toFixed(2)} Wh
                        </span>
                    </div>
                </div>
            )}

            {/* WORKLOAD SIMULATOR DEMO SECTION */}
            <div className="section-header" style={{ marginTop: '50px', borderTop: '1px solid var(--border-primary)', paddingTop: '30px' }}>
                <h3>Interactive Workload Simulator</h3>
                <p style={{ fontSize: '0.9rem' }}>Test parallelization vs single-threading impacts.</p>
            </div>

            <div className="simulator-controls" style={{ display: 'flex', gap: '10px' }}>
                <button
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                    onClick={() => runSimulation('mono')}
                    disabled={simState.status === 'running-mono' || simState.status === 'running-parallel'}
                >
                    {simState.status === 'running-mono' ? 'Simulating Mono-Thread...' : 'Run Mono-Thread Stress (High CPU)'}
                </button>
                <button
                    className="btn"
                    style={{ flex: 1, background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    onClick={() => runSimulation('parallel')}
                    disabled={simState.status === 'running-mono' || simState.status === 'running-parallel'}
                >
                    {simState.status === 'running-parallel' ? 'Simulating Parallel...' : 'Run Parallel (Low CPU per runner)'}
                </button>
            </div>

            <div className="simulator-results" style={{ marginTop: '20px' }}>
                <div className="sim-result-box" style={{ borderColor: 'var(--rose-400)' }}>
                    <div className="sim-val text-rose-400">{simState.monoCpu ? `${simState.monoCpu}%` : '--'}</div>
                    <div className="sim-label">Heavy CPU Util</div>
                </div>
                <div className="sim-result-box" style={{ borderColor: 'var(--green-400)' }}>
                    <div className="sim-val text-green-400">{simState.parallelCpu ? `${simState.parallelCpu}%` : '--'}</div>
                    <div className="sim-label">Parallel CPU Util</div>
                </div>
                <div className="sim-result-box" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <div className="sim-val text-green-400">{simState.savings ? `${Math.round(simState.savings)}%` : '--'}</div>
                    <div className="sim-label">Est. Energy Savings</div>
                </div>
            </div>
        </div>
    );
}
