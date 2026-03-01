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
