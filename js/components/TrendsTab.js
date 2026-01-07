const TrendsTab = ({ entries, theme, unit }) => {
    const chartRef = React.useRef(null);
    const [activeKey, setActiveKey] = React.useState('weight');

    useEffect(() => {
        if (!entries.length) return;

        const ctx = chartRef.current.getContext('2d');
        const sorted = [...entries].sort((a,b) => new Date(a.date) - new Date(b.date));
        const labels = sorted.map(e => e.date);
        const data = sorted.map(e => convert(e[activeKey], METRICS[activeKey].unitType, unit));

        // Simple linear regression for trendline
        const n = data.length;
        const sumX = data.reduce((sum, _, i) => sum + i, 0);
        const sumY = data.reduce((sum, y) => sum + y, 0);
        const sumXY = data.reduce((sum, y, i) => sum + i * y, 0);
        const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Damped prediction for realism (based on Jeff Nippard: energy expenditure decreases with weight loss, so fat loss slows)
        // Reference: REE drops as body mass decreases, leading to plateaus. Use exponential decay on slope.
        const dampedSlope = slope * 0.8; // 20% damping for diminishing returns
        const trendData = data.map((_, i) => intercept + dampedSlope * i);
        const futurePoints = 5; // Predict 5 future points
        for (let i = n; i < n + futurePoints; i++) {
            labels.push(`Pred ${i - n + 1}`);
            trendData.push(intercept + dampedSlope * i * Math.exp(-0.05 * i)); // Exponential decay for realism
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: METRICS[activeKey].label, data, borderColor: THEMES[theme].text, fill: false },
                    { label: 'Trend (Damped for REE changes)', data: trendData, borderColor: 'gray', borderDash: [5,5], fill: false }
                ]
            },
            options: {
                plugins: { zoom: { zoom: { mode: 'x' } } },
                scales: { x: { type: 'time', time: { unit: 'day' } } }
            }
        });

        return function() { chart.destroy(); };
    }, [entries, activeKey, unit, theme]);

    return (
        <div className="h-full pt-safe px-6 pb-24 overflow-y-auto no-scrollbar">
            <h1 className="text-3xl font-bold dark:text-white mt-12 mb-4">Trends</h1>
            <select onChange={e => setActiveKey(e.target.value)} className="mb-4 bg-gray-100 dark:bg-black p-2 rounded">
                {Object.keys(METRICS).map(k => <option key={k} value={k}>{METRICS[k].label}</option>)}
            </select>
            <canvas ref={chartRef} />
            <p className="text-xs text-gray-400 mt-2">Prediction damped based on science (e.g., Jeff Nippard: REE decreases with weight loss, slowing fat loss).</p>
        </div>
    );
};
window.TrendsTab = TrendsTab;