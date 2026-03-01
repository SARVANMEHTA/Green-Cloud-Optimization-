import React, { useState, useEffect } from 'react';
import { Calculator, Zap, Leaf, DollarSign, Activity } from 'lucide-react';
import { calculateBuildEnergy, getGrade, CARBON_INTENSITY_MAP } from '../utils/formulas';
import { EnergyCard } from '../components/UIComponents';

export default function CalculatorApp() {
    const [params, setParams] = useState({
        tdpW: 35,
        cpuUtil: 50, // 0-100%
        durationMins: 15,
        memGB: 4,
        pue: 1.20,
        region: 'US-East',
        buildsPerMonth: 100
    });

    const [results, setResults] = useState(null);

    useEffect(() => {
        // Recalculate on every change
        const carbonIntensity = CARBON_INTENSITY_MAP[params.region];
        const cpuUtilDecimal = params.cpuUtil / 100;
        const durationS = params.durationMins * 60;

        const res = calculateBuildEnergy({
            tdpW: params.tdpW,
            cpuUtil: cpuUtilDecimal,
            durationS,
            memGB: params.memGB,
            pue: params.pue,
            carbonIntensity
        });

        setResults({ ...res, carbonIntensity });
    }, [params]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: isNaN(Number(value)) ? value : Number(value) });
    };

    if (!results) return null;

    const scoreGrade = getGrade(Math.max(0, 100 - (results.co2g / 5))); // Mockup calc for demo
    const monthlyEnergyKwh = (results.totalKwh * params.buildsPerMonth);
    const monthlyCo2Kg = ((results.co2g * params.buildsPerMonth) / 1000);
    const monthlyCost = (results.costUSD * params.buildsPerMonth);

    return (
        <div className="page-container">
            <div className="section-header">
                <h1>Pipeline Energy Calculator</h1>
                <p>Interactive tool to model the exact electrical and carbon impact of your isolated CI/CD jobs.</p>
            </div>

            <div className="calculator-layout">
                {/* INPUT TRAY */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} className="text-blue-400" /> Build Parameters
                    </h3>

                    <div className="calc-inputs">
                        {/* CPU TDP */}
                        <div className="form-group">
                            <label className="form-label">CPU TDP (Watts)</label>
                            <select name="tdpW" value={params.tdpW} onChange={handleChange} className="form-select">
                                <option value={10}>10W (Oracle A1 OCPU)</option>
                                <option value={15}>15W (Apple Silicon M1/M2)</option>
                                <option value={35}>35W (Standard ubuntu-latest)</option>
                                <option value={65}>65W (High Perf Runner)</option>
                                <option value={140}>140W (8-Core Server)</option>
                            </select>
                        </div>

                        {/* Region (Carbon Intensity) */}
                        <div className="form-group">
                            <label className="form-label">Data Center Region</label>
                            <select name="region" value={params.region} onChange={handleChange} className="form-select">
                                {Object.keys(CARBON_INTENSITY_MAP).filter(k => k !== 'default').map(r => (
                                    <option key={r} value={r}>{r} ({CARBON_INTENSITY_MAP[r]} gCO₂/kWh)</option>
                                ))}
                            </select>
                        </div>

                        {/* Utilization Slider */}
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Avg. CPU Utilization</span>
                                <span className="text-green-400">{params.cpuUtil}%</span>
                            </label>
                            <input
                                type="range" name="cpuUtil" min="1" max="100"
                                value={params.cpuUtil} onChange={handleChange}
                                className="form-range" style={{ marginTop: '10px' }}
                            />
                        </div>

                        {/* Duration Slider */}
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Build Duration (Minutes)</span>
                                <span className="text-blue-400">{params.durationMins} min</span>
                            </label>
                            <input
                                type="range" name="durationMins" min="1" max="120"
                                value={params.durationMins} onChange={handleChange}
                                className="form-range" style={{ marginTop: '10px' }}
                            />
                        </div>

                        {/* Memory */}
                        <div className="form-group">
                            <label className="form-label">Memory (GB)</label>
                            <input type="number" name="memGB" value={params.memGB} onChange={handleChange} className="form-input" min="1" max="64" />
                        </div>

                        {/* PUE */}
                        <div className="form-group">
                            <label className="form-label">Facility PUE</label>
                            <input type="number" name="pue" value={params.pue} onChange={handleChange} className="form-input" step="0.01" min="1.0" max="2.5" />
                        </div>

                        {/* Scale */}
                        <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid var(--border-primary)' }}>
                            <label className="form-label">Monthly Trigger Frequency (Builds)</label>
                            <input type="number" name="buildsPerMonth" value={params.buildsPerMonth} onChange={handleChange} className="form-input" />
                        </div>
                    </div>
                </div>

                {/* OUTPUT TRAY */}
                <div className="calc-results">
                    <div className="calc-result-card" style={{ borderLeft: '4px solid var(--amber-400)' }}>
                        <div className="calc-result-label">Energy per Build</div>
                        <div className="calc-result-value" style={{ color: 'var(--amber-400)' }}>
                            {results.totalWh.toFixed(2)}<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}> Wh</span>
                        </div>
                        <div className="calc-result-sub" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            <span>CPU: {results.cpuWh.toFixed(2)} Wh</span>
                            <span>Mem: {results.memWh.toFixed(2)} Wh</span>
                        </div>
                    </div>

                    <div className="calc-result-card" style={{ borderLeft: '4px solid var(--green-400)' }}>
                        <div className="calc-result-label">Carbon Impact per Build</div>
                        <div className="calc-result-value" style={{ color: 'var(--green-400)' }}>
                            {results.co2g.toFixed(2)}<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}> gCO₂eq</span>
                        </div>
                        <div className="calc-result-sub">
                            Grid Intensity: {results.carbonIntensity} gCO₂/kWh ({params.region})
                        </div>
                    </div>

                    <div className="glass-card" style={{ background: 'var(--bg-secondary)', marginTop: 'auto' }}>
                        <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                            Monthly Fleet Projection
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{monthlyEnergyKwh.toFixed(1)} kWh</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mthly Energy</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green-400)' }}>{monthlyCo2Kg.toFixed(1)} kg</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mthly Carbon</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--blue-400)' }}>${monthlyCost.toFixed(2)}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Cost</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
