import React, { useState } from 'react';
import { Download, FileBarChart, PieChart as PieChartIcon, DollarSign, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { DEMO_BUILDS } from '../utils/demoData';
import { TrendChart, CostVsEmissionGraph } from '../components/Charts';

export default function Reports() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        setIsExporting(true);
        const element = document.getElementById('report-content');
        if (!element) return setIsExporting(false);

        try {
            // Need a slight delay to ensure UI is ready, Recharts animations might interfere
            await new Promise(r => setTimeout(r, 500));

            const dataUrl = await toPng(element, {
                quality: 1.0,
                backgroundColor: '#0a0f1a',
                pixelRatio: 2
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            // create image to get dimensions
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => { img.onload = resolve; });

            const pdfHeight = (img.height * pdfWidth) / img.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('GreenCloud_Emissions_Report.pdf');
        } catch (error) {
            console.error("PDF Export failed", error);
            alert("Failed to export PDF. Check console for details: " + error.message);
        }
        setIsExporting(false);
    };

    // Format data for 30-day trend chart
    const trendData = [...DEMO_BUILDS].reverse().map((b) => {
        const d = new Date(b.recordedAt);
        return {
            date: `${d.getMonth() + 1}/${d.getDate()}`,
            co2Grams: b.co2Grams,
            costUSD: b.costUSD
        };
    });

    const meanCO2 = trendData.reduce((s, d) => s + d.co2Grams, 0) / (trendData.length || 1);

    // Redundancy summary
    const redundantBuilds = DEMO_BUILDS.filter(b => b.hasRedundancy);
    const wastedCO2g = redundantBuilds.reduce((s, b) => s + b.co2Grams * 0.2, 0);

    return (
        <div className="page-container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Emissions Reporting</h1>
                    <p>Exportable metrics, compliance data, and historical cost analysis.</p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                >
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isExporting ? 'Generating PDF...' : 'Export PDF Report'}
                </button>
            </div>

            <div id="report-content" style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)' }}>

                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-label">Total Monthly CO₂</div>
                        <div className="kpi-value text-green-400">
                            {(trendData.reduce((s, d) => s + d.co2Grams, 0) / 1000).toFixed(2)} kg
                        </div>
                        <div className="kpi-trend down">12% below baseline</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Redundancy Waste</div>
                        <div className="kpi-value text-rose-400">
                            {wastedCO2g.toFixed(0)} g
                        </div>
                        <div className="kpi-trend up">{redundantBuilds.length} duplicate jobs found</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Average per Run</div>
                        <div className="kpi-value text-blue-400">
                            {meanCO2.toFixed(1)} g
                        </div>
                        <div className="kpi-trend down">Optimized target: 150g</div>
                    </div>
                </div>

                <div className="chart-grid">
                    <div className="chart-card full-width">
                        <div className="chart-title">
                            <FileBarChart size={18} className="chart-icon" /> 30-Day Carbon Trend
                        </div>
                        <div className="chart-subtitle">Daily aggregated emissions across all pipelines</div>
                        <TrendChart data={trendData} meanValue={meanCO2} />
                    </div>

                    <div className="chart-card full-width">
                        <div className="chart-title">
                            <DollarSign size={18} className="chart-icon" /> Financial vs Environmental Cost
                        </div>
                        <div className="chart-subtitle">Correlation between compute spend and emitted carbon</div>
                        <CostVsEmissionGraph data={trendData} />
                    </div>
                </div>

                <div className="glass-card" style={{ marginTop: 'var(--space-2xl)', background: 'var(--bg-secondary)' }}>
                    <h3>Compliance & Certifications</h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '10px' }}>
                        Report data calculated using Intergovernmental Panel on Climate Change (IPCC) AR6 Global Warming Potential methodologies and actualized grid intensity from Electricity Maps. Scope 3 telemetry relies on provider PUE factors.
                    </p>
                </div>
            </div>
        </div>
    );
}
