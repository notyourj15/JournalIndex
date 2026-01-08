const TrendsTab = ({ entries, unit, theme }) => {
    const [activeKey, setActiveKey] = React.useState('weight');
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (!canvasRef.current || entries.length < 2) return;

        const ctx = canvasRef.current.getContext('2d');
        if (chartRef.current) chartRef.current.destroy();

        const metric = METRICS[activeKey];

        // ---- SORT DATA ----
        const sorted = [...entries].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        const labels = sorted.map(e => e.date);
        const values = sorted.map(e =>
            convert(e[activeKey] || 0, metric.unitType, unit)
        );

        // ---- LINEAR REGRESSION ----
        const n = values.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        values.forEach((y, x) => {
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        });

        const slope =
            n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
        const intercept = (sumY - slope * sumX) / n;

        // ---- BUILD DATASETS ----
        const fullLabels = [...labels];
        const historyData = [...values];
        const predictionData = Array(values.length).fill(null);

        const FUTURE = 7;

        for (let i = 1; i <= FUTURE; i++) {
            const idx = n - 1 + i;
            const predicted = intercept + slope * idx;

            predictionData.push(predicted);

            const d = new Date(fullLabels[fullLabels.length - 1]);
            d.setDate(d.getDate() + 1);
            fullLabels.push(d.toISOString().split('T')[0]);
        }

        const accent =
            document.documentElement.classList.contains('dark')
                ? '#FFFFFF'
                : '#000000';

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: fullLabels,
                datasets: [
                    {
                        data: historyData,
                        borderColor: accent,
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 2
                    },
                    {
                        data: predictionData,
                        borderColor: accent,
                        borderDash: [6, 6],
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: items => {
                                const i = items[0].dataIndex;
                                return fullLabels[i];
                            },
                            label: ctx => {
                                const i = ctx.dataIndex;
                                const v = ctx.parsed.y;
                                if (v == null) return null;

                                const isPrediction = i >= values.length;
                                const unitLabel = getUnitLabel(metric.unitType, unit);

                                return `${isPrediction ? 'Prediction: ' : ''}${v.toFixed(1)} ${unitLabel}`;
                            }
                        }
                    },
                    zoom: {
                        zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'x'
                        },
                        pan: {
                            enabled: true,
                            mode: 'x'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { display: false }
                    },
                    y: {
                        border: { display: false },
                        grid: {
                            color: 'rgba(200,200,200,0.1)'
                        }
                    }
                }
            }
        });

        return () => chartRef.current?.destroy();
    }, [entries, activeKey, unit, theme]);

    return (
        <div className="h-full pt-safe px-4 pb-24 flex flex-col bg-white dark:bg-black">
            <div className="py-6">
                <h1 className="text-3xl font-bold dark:text-white px-2">
                    Trends
                </h1>
            </div>

            {/* METRIC SCROLL BAR */}
            <div className="flex overflow-x-auto no-scrollbar space-x-3 pb-4 px-2">
                {Object.entries(METRICS).map(([key, m]) => (
                    <button
                        key={key}
                        onClick={() => setActiveKey(key)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition
                            ${
                                activeKey === key
                                    ? `${THEMES[theme].accent} shadow`
                                    : 'bg-gray-50 dark:bg-[#1C1C1E] text-gray-500'
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* CHART */}
            <div className="flex-1 min-h-0 bg-gray-50 dark:bg-[#1C1C1E] rounded-3xl p-4 shadow-inner">
                <canvas ref={canvasRef} />
            </div>

            <div className="text-center text-xs text-gray-400 mt-4">
                Scroll / pinch to zoom • Dashed line = prediction
            </div>
        </div>
    );
};
