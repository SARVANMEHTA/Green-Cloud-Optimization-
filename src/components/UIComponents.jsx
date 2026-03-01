import React, { useState } from 'react';
import { Leaf, DollarSign, Activity, Zap, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { getGrade, getRiskLevel } from '../utils/formulas';

export const EnergyCard = ({ title, value, unit, icon, trend, trendValue, colorClass }) => {
    return (
        <div className="kpi-card">
            <div className={`kpi-icon ${colorClass} bg-opacity-20`}>
                {icon}
            </div>
            <div className="kpi-label">{title}</div>
            <div className="kpi-value">
                {value} <span style={{ fontSize: '0.5em', color: 'var(--text-muted)' }}>{unit}</span>
            </div>
            {trend && (
                <div className={`kpi-trend ${trend === 'up' ? 'up' : 'down'}`}>
                    {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {trendValue}% vs last week
                </div>
            )}
        </div>
    );
};

export const AlertBanner = ({ alerts, onDismiss }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <>
            {alerts.map((alert) => (
                <div key={alert.id} className={`alert-banner ${alert.severity}`}>
                    <AlertTriangle size={18} />
                    <span>{alert.message}</span>
                    <button className="alert-dismiss" onClick={() => onDismiss(alert.id)}>×</button>
                </div>
            ))}
        </>
    );
};

export const SuggestionCard = ({ impact, message }) => {
    return (
        <div className={`suggestion-card ${impact}`}>
            {impact === 'high' && <AlertTriangle size={16} className="text-rose-400" />}
            {impact === 'medium' && <Activity size={16} className="text-amber-400" />}
            {impact === 'low' && <Zap size={16} className="text-green-400" />}
            <div>{message}</div>
        </div>
    );
};
