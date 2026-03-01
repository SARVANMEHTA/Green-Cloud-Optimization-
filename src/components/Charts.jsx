import React, { useMemo } from 'react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell, ComposedChart,
    ReferenceLine, PieChart, Pie, Legend
} from 'recharts';

// Custom Tooltip for dark mode
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', padding: '10px', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontWeight: 600, marginBottom: '5px' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color, margin: 0, fontSize: '0.9rem' }}>
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// 1. Green Score Gauge (0-100 Radial Bar)
export const GreenScoreGauge = ({ score }) => {
    const data = [{ name: 'Score', value: score }];
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f43f5e';

    return (
        <div style={{ width: '100%', height: 200, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    cx="50%" cy="80%"
                    innerRadius="70%" outerRadius="100%"
                    barSize={15}
                    data={data}
                    startAngle={180} endAngle={0}
                >
                    <RadialBar minAngle={15} background={{ fill: 'var(--bg-tertiary)' }} clockWise dataKey="value" fill={color} cornerRadius={10} />
                </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '75%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Green Score</div>
            </div>
        </div>
    );
};

// 2. Build Duration vs Rolling Average Line Chart
export const BuildDurationChart = ({ data }) => {
    // Data needs to be formatted with actual duration and 7-day average
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickMargin={10} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={(val) => `${(val / 60).toFixed(0)}m`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="durationS" name="Duration (s)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="avg7d" name="7-Day Avg" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// 3. Resource Usage Area Chart (CPU + Memory)
export const ResourceUsageChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={12} hide />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="cpuPct" name="CPU Util." stroke="#10b981" fillOpacity={1} fill="url(#colorCpu)" />
                    <Area type="monotone" dataKey="memPct" name="Mem Util." stroke="#14b8a6" fillOpacity={1} fill="url(#colorMem)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// 4. Per-Stage Energy Bar Chart
export const StageBreakdownChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    <XAxis dataKey="stageName" stroke="var(--text-tertiary)" fontSize={12} tickMargin={10} angle={-45} textAnchor="end" />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={(val) => `${val}Wh`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="energyWh" name="Energy (Wh)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// 5. Cost vs Emission Dual-Axis Composed Chart
export const CostVsEmissionGraph = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="var(--text-tertiary)" fontSize={12} tickFormatter={(val) => `$${val.toFixed(2)}`} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--text-tertiary)" fontSize={12} tickFormatter={(val) => `${val}g`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="costUSD" name="Cost ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                    <Line yAxisId="right" type="monotone" dataKey="co2Grams" name="CO₂ (g)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

// 6. TrendChart 30-day Area
export const TrendChart = ({ data, meanValue }) => {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={(val) => `${val}g`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="co2Grams" name="Total CO₂" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCO2)" />
                    {meanValue && <ReferenceLine y={meanValue} label="Mean" stroke="#a78bfa" strokeDasharray="3 3" />}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
// 7. PieFactorsChart
export const PieFactorsChart = ({ data }) => {
    // Generate dummy breakdown based on requirements if no data
    const pieData = data || [
        { name: 'Build Time', value: 35, fill: '#3b82f6' },
        { name: 'CPU Util', value: 25, fill: '#10b981' },
        { name: 'Parallelism', value: 15, fill: '#8b5cf6' },
        { name: 'Redundancy', value: 12, fill: '#f43f5e' },
        { name: 'Region', value: 8, fill: '#f59e0b' },
        { name: 'Cache', value: 5, fill: '#14b8a6' },
    ];

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
