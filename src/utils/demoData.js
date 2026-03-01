import { calculateBuildEnergy } from './formulas';

// Utility for creating realistic dates over last 30 days
const getPastDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(d.getHours() - Math.floor(Math.random() * 24));
    d.setMinutes(d.getMinutes() - Math.floor(Math.random() * 60));
    return d.toISOString();
};

export const DEMO_PROJECTS = [
    { id: '1', name: 'greenpulse-frontend', platform: 'github', defaultRegion: 'US-East' },
    { id: '2', name: 'api-gateway', platform: 'gitlab', defaultRegion: 'Ireland' },
    { id: '3', name: 'ml-training-job', platform: 'circleci', defaultRegion: 'US-West (Oregon)' },
    { id: '4', name: 'legacy-monolith', platform: 'jenkins', defaultRegion: 'India' },
];

export const generateDemoBuilds = () => {
    const builds = [];
    const platforms = ['github', 'gitlab', 'circleci', 'jenkins'];
    const regions = ['US-East', 'US-West (Oregon)', 'Ireland', 'India', 'Stockholm'];
    const branches = ['main', 'develop', 'feature/auth', 'hotfix/db', 'release/v2'];

    for (let i = 0; i < 50; i++) {
        const isHeavy = Math.random() > 0.8;
        const isIdle = Math.random() > 0.9;

        // Generate base metrics
        const tdpW = isHeavy ? 140 : 35;
        const cpuUtil = isIdle ? 0.05 : (isHeavy ? 0.85 : 0.45) + (Math.random() * 0.1);
        const durationS = isHeavy ? 1200 + Math.random() * 600 : 300 + Math.random() * 300;
        const memGB = isHeavy ? 16 : 4;
        const region = regions[Math.floor(Math.random() * regions.length)];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const hasRedundancy = Math.random() > 0.85;

        // Region carbon intensity (approximate)
        const ciMap = {
            'US-East': 374, 'US-West (Oregon)': 120, 'Ireland': 316,
            'India': 708, 'Stockholm': 13
        };
        const carbonIntensity = ciMap[region];

        // Compute exact energy via Formula Engine
        const energy = calculateBuildEnergy({
            tdpW, cpuUtil, durationS, memGB, pue: 1.2, carbonIntensity
        });

        const isFailed = Math.random() > 0.9;
        const status = isFailed ? 'failure' : 'success';

        builds.push({
            id: `build-${50 - i}`,
            projectId: Math.ceil(Math.random() * 4).toString(),
            platform,
            branch: branches[Math.floor(Math.random() * branches.length)],
            status,
            durationS,
            cpuUtil,
            memGB,
            region,
            carbonIntensity,
            energyKwh: energy.totalKwh,
            energyWh: energy.totalWh,
            co2Grams: energy.co2g,
            costUSD: energy.costUSD,
            recordedAt: getPastDate(Math.floor(i / 2)),
            hasRedundancy,
            redundantJobs: hasRedundancy ? Math.floor(Math.random() * 2) + 1 : 0,
        });
    }

    // Sort newest first
    return builds.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
};

export const DEMO_BUILDS = generateDemoBuilds();

export const DEMO_STAGE_BREAKDOWN = [
    { stageName: 'Checkout', durationS: 15, energyWh: 0.1, cpuPct: 15 },
    { stageName: 'Install Deps', durationS: 120, energyWh: 1.2, cpuPct: 65 },
    { stageName: 'Lint', durationS: 45, energyWh: 0.4, cpuPct: 40 },
    { stageName: 'Test', durationS: 320, energyWh: 3.5, cpuPct: 85 },
    { stageName: 'Build', durationS: 240, energyWh: 2.8, cpuPct: 90 },
    { stageName: 'Upload Art.', durationS: 30, energyWh: 0.2, cpuPct: 20 },
];

export const DEMO_ALERTS = [
    { id: 'a1', type: 'idle_resource', severity: 'warning', projectId: '2', message: 'Runner idle (CPU: 8%) for 15min. Wasted: 45 Wh. Consider smaller runner.', createdAt: new Date().toISOString() },
    { id: 'a2', type: 'high_emission', severity: 'critical', projectId: '4', message: 'Build emitted 650g CO₂ — above 500g threshold.', createdAt: getPastDate(1) },
];
