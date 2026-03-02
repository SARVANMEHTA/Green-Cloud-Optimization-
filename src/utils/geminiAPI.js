import { calculateBuildEnergy } from './formulas';

//const GEMINI_API_KEY = "AIzaSyBhhB_L28I3r5S6OKAJjdzVNB0qhvyFW9c";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function generateMLOptimizations(builds, projectInfo) {
    if (!builds || builds.length === 0) return [];

    // 1. Prepare data context for the prompt
    const recentBuilds = builds.slice(0, 5).map(b => ({
        id: b.id,
        durationMins: (b.durationS / 60).toFixed(1),
        cpuUtilizationPct: (b.cpuUtil * 100).toFixed(1),
        memoryGB: b.memGB,
        energyWh: b.energyWh.toFixed(2),
        co2g: b.co2Grams.toFixed(2),
        region: b.region,
        hasRedundantJobs: b.hasRedundancy
    }));

    const prompt = `
You are an expert Cloud CI/CD sustainability and performance engineer. 
Analyze the following recent CI/CD pipeline runs for project "${projectInfo?.name || 'Unknown'}" running on ${projectInfo?.platform || 'Unknown'}.

Recent Pipeline Runs Data (JSON):
${JSON.stringify(recentBuilds, null, 2)}

Provide exactly 3 specific, actionable optimization suggestions to reduce the carbon footprint, energy consumption, or build time of these pipelines. 
Look for things like:
- Low CPU utilization (idle runners) -> suggest smaller runners
- High CO2 in specific regions -> suggest region shifting
- Redundant jobs -> suggest caching or matrix optimization
- Long durations -> suggest parallelization

Return the result STRICTLY as a JSON array of objects with this exact structure:
[
  {
    "impact": "high" | "medium" | "low",
    "message": "A concise, actionable 1-2 sentence suggestion including estimated savings if possible."
  }
]
Do not include any markdown formatting (like \`\`\`json) in your response, just the raw JSON array.
`;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.2,
                }
            }),
        });

        if (!response.ok) {
            console.error("Gemini API error:", response.statusText);
            return getFallbackSuggestions(recentBuilds[0]);
        }

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (resultText) {
            // Clean up markdown if the model accidentally includes it
            const cleanedText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedText);
        }

        return getFallbackSuggestions(recentBuilds[0]);
    } catch (error) {
        console.error("Failed to fetch ML optimizations:", error);
        return getFallbackSuggestions(recentBuilds[0]);
    }
}

// Fallback rule-based suggestions if API fails
function getFallbackSuggestions(latestBuild) {
    if (!latestBuild) return [];
    const suggestions = [];

    if (latestBuild.cpuUtil < 0.2) {
        suggestions.push({ impact: 'high', message: `Runner idle (CPU: ${(latestBuild.cpuUtil * 100).toFixed(0)}%). Downsize instance to save energy.` });
    }
    if (latestBuild.hasRedundancy) {
        suggestions.push({ impact: 'high', message: `Duplicate matrix jobs detected. Filter redundant paths.` });
    }
    if (suggestions.length === 0) {
        suggestions.push({ impact: 'medium', message: `Optimize dependency caching to reduce build time.` });
    }

    return suggestions;
}
