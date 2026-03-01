/**
 * Redundancy Detector — Identifies duplicate/wasted CI jobs
 */

export function detectRedundantJobs(jobs) {
    const seen = new Map();
    return jobs.filter(job => {
        const key = `${job.name}::${job.stage}`;
        if (seen.has(key)) return true;
        seen.set(key, job);
        return false;
    });
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
