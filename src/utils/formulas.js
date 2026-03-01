/**
 * GreenPulse CI/CD — Formula Engine
 * All energy, emissions, and scoring calculations
 * Sources: IEA 2025 · EPA eGRID 2024 · IPCC AR6 · JEDEC DDR4
 */

// TDP lookup table (Watts)
export const TDP_MAP = {
    'ubuntu-latest': 35,
    'macos-latest': 15,
    '8-core': 140,
    'oci-a1': 10,   // per OCPU
    'self-hosted': 35,
    'default': 35,
};

// PUE by provider
export const PUE_MAP = {
    'gcp': 1.10,
    'oracle': 1.15,
    'cloudflare': 1.12,
    'azure': 1.20,
    'aws': 1.20,
    'self-hosted': 1.50,
    'github': 1.20,
    'gitlab': 1.20,
    'jenkins': 1.50,
    'circleci': 1.20,
    'default': 1.20,
};

// Static carbon intensity fallbacks (gCO₂/kWh) — IEA 2025
export const CARBON_INTENSITY_MAP = {
    'US-East': 374,
    'US-West (Oregon)': 120,
    'Ireland': 316,
    'India': 708,
    'Stockholm': 13,
    'Brazil': 74,
    'Germany': 350,
    'UK': 233,
    'France': 56,
    'Japan': 471,
    'Australia': 580,
    'Canada': 120,
    'US-CAL-CISO': 210,
    'US-MIDA-PJM': 374,
    'default': 374,
};

// F1 — CPU Energy (Estimation)
// E_CPU (Wh) = TDP (W) × Utilization (0–1) × Duration (hrs)
export function calcCpuEnergy(tdpW, utilization, durationHrs) {
    return tdpW * utilization * durationHrs;
}

// F2 — Memory Energy
// E_MEM (Wh) = 0.375 W/GB × Memory (GB) × Duration (hrs)
export function calcMemEnergy(memGB, durationHrs) {
    return 0.375 * memGB * durationHrs;
}

// F3 — Total Build Energy with PUE
// E_total (Wh) = (E_CPU + E_MEM) × PUE
export function calcTotalEnergy(cpuWh, memWh, pue) {
    return (cpuWh + memWh) * pue;
}

// F4 — CO₂ Emissions
// CO₂ (g) = (E_total / 1000) × Carbon Intensity (gCO₂/kWh)
export function calcCO2(totalWh, carbonIntensity) {
    return (totalWh / 1000) * carbonIntensity;
}

// F5 — OCI Measured Energy (High Accuracy)
// E_CPU (Wh) = TDP_per_OCPU × OCPU_count × (measured_cpu% / 100) × duration_hrs
export function calcOciEnergy(tdpPerOcpu, ocpuCount, measuredCpuPct, durationHrs) {
    return tdpPerOcpu * ocpuCount * (measuredCpuPct / 100) * durationHrs;
}

// F6 — Green Score (0–100)
export function calcGreenScore(co2Actual, co2Benchmark, idleTimePct = 0, redundantJobPct = 0) {
    const emissionPenalty = Math.min(60, (co2Actual / co2Benchmark) * 60);
    const idlePenalty = Math.min(20, idleTimePct * 0.2);
    const redundancyPenalty = Math.min(20, redundantJobPct * 0.2);
    return Math.max(0, Math.min(100, Math.round(100 - emissionPenalty - idlePenalty - redundancyPenalty)));
}

// Green Score Grade
export function getGrade(score) {
    if (score >= 80) return { grade: 'A', color: '#10b981' };
    if (score >= 60) return { grade: 'B', color: '#34d399' };
    if (score >= 40) return { grade: 'C', color: '#fbbf24' };
    return { grade: 'D', color: '#f43f5e' };
}

// F7 — Before/After Energy Savings
export function calcSavings(eBeforeKwh, eAfterKwh, carbonIntensity) {
    const savingsKwh = eBeforeKwh - eAfterKwh;
    const reductionPct = eBeforeKwh > 0 ? (savingsKwh / eBeforeKwh) * 100 : 0;
    const co2SavedG = savingsKwh * carbonIntensity;
    return { savingsKwh, reductionPct, co2SavedG };
}

// F8 — Redundancy Waste Factor
export function calcRedundancyWasteFactor(redundantJobs, totalJobs) {
    return totalJobs > 0 ? (redundantJobs / totalJobs) * 100 : 0;
}

// F9 — Cost Estimate
// cost_USD = (E_total / 1000) × $0.12/kWh (EIA 2024 US commercial rate)
export function calcCost(totalWh) {
    return (totalWh / 1000) * 0.12;
}

// F10 — ML Risk Score
export function calcMLRiskScore(cpuUtil, durationMin, redundantJobs, carbonIntensity, parallelizationPct) {
    const score =
        0.30 * (cpuUtil > 0.9 ? 1 : cpuUtil) * 100 +
        0.25 * Math.min(1, durationMin / 30) * 100 +
        0.20 * Math.min(1, redundantJobs / 3) * 100 +
        0.15 * Math.min(1, carbonIntensity / 500) * 100 +
        0.10 * Math.max(0, 1 - parallelizationPct / 100) * 100;
    return Math.round(score);
}

export function getRiskLevel(riskScore) {
    if (riskScore > 60) return { level: 'Critical', color: '#f43f5e' };
    if (riskScore > 30) return { level: 'Medium', color: '#fbbf24' };
    return { level: 'Low', color: '#10b981' };
}

// Full pipeline energy calculation
export function calculateBuildEnergy({
    tdpW = 35,
    cpuUtil = 0.5,
    durationS = 300,
    memGB = 4,
    pue = 1.20,
    carbonIntensity = 374,
}) {
    const durationHrs = durationS / 3600;
    const cpuWh = calcCpuEnergy(tdpW, cpuUtil, durationHrs);
    const memWh = calcMemEnergy(memGB, durationHrs);
    const totalWh = calcTotalEnergy(cpuWh, memWh, pue);
    const totalKwh = totalWh / 1000;
    const co2g = calcCO2(totalWh, carbonIntensity);
    const costUSD = calcCost(totalWh);

    return {
        cpuWh: +cpuWh.toFixed(4),
        memWh: +memWh.toFixed(4),
        totalWh: +totalWh.toFixed(4),
        totalKwh: +totalKwh.toFixed(6),
        co2g: +co2g.toFixed(2),
        costUSD: +costUSD.toFixed(6),
    };
}

export function getRedundancySummary(builds) {
  return {
    wastedKwh: builds.reduce((s, b) => s + (b.redundantEnergyWh || 0) / 1000, 0),
    wastedCO2g: builds.reduce((s, b) => s + (b.redundantCO2Grams || 0), 0),
    wastedBuilds: builds.filter(b => b.hasRedundancy).length,
    pctBuilds: builds.length > 0
      ? (builds.filter(b => b.hasRedundancy).length / builds.length) * 100
      : 0,
  };
}
