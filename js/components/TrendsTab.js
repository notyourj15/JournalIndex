const { useState, useEffect, useRef } = React;

const TrendsTab = ({ entries = [], theme, unit }) => {
    const chartRef = useRef(null);
    const [activeKey, setActiveKey] = useState('weight');

    useEffect(() => {
        if (!entries.length || !chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');

        const sorted = [...entries].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        const labels = sorted.map(e => e.date);
        const data = sorted.map(e =>
            convert(
                e[activeKey] || 0,
                METRICS[activeKey].unitType,
                unit
            )
        );

        // Linear regression
        const n = data.length;
        const sumX = data.reduce((s, _, i) => s + i, 0);
        const sumY = data.reduce((s, y) => s + y, 0);
        const sumXY = data.reduce((s, y, i) => s + i * y, 0);
        const sumXX = data.reduce((s, _, i) => s + i * i, 0);

        const slope =
            n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
        const intercept = n ? (sumY - slope * sumX) / n : 0;

        // Damped trend
        const dampedSlope = slope * 0.85;
        const trendData = data.map((_, i) => intercept + dampedSlope * i);

        const futurePoints = 7;
        for (let i = n; i < n + futurePoints; i++) {
            labels.push(`Pred ${i - n + 1}`);
            trendData.push(
                intercept +
                    dampedSlope *
                        i *
                        Math.exp(-0.03 * (i - n))
            );
        }

        if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
        }

        chartRef.current.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: METRICS[activeKey].label,
                        data,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: 'Trend (Damped)',
                        data: trendData,
                        borderColor: 'rgb(156, 163, 175)',
                        borderDash: [8, 4],
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 12,
                            maxRotation: 0,
                            minRotation: 0
                        }
                    },
                    y: { beginAtZero: false }
                }
            }
        });

        return () => {
            if (chartRef.current?.chart) {
                chartRef.current.chart.destroy();
            }
        };
    }, [entries, activeKey, unit, theme]);

    return (
        <div className="h-full pt-safe px-6 pb-24 overflow-y-auto no-scrollbar">
            <h1 className="text-3xl font-bold dark:text-white mt-12 mb-4">
                Trends
            </h1>

            <select
                value={activeKey}
                onChange={e => setActiveKey(e.target.value)}
                className="mb-4 bg-gray-100 dark:bg-black p-2 rounded"
            >
                {Object.keys(METRICS).map(k => (
                    <option key={k} value={k}>
                        {METRICS[k].label}
                    </option>
                ))}
            </select>

            <canvas ref={chartRef} className="w-full h-96" />

            <p className="text-xs text-gray-400 mt-2">
                Prediction damped based on diminishing returns.
            </p>
        </div>
    );
};

window.TrendsTab = TrendsTab;
