const TodayTab = ({ goals, entries, theme, unit }) => {
    const sorted = React.useMemo(() => [...entries].sort((a,b) => new Date(a.date) - new Date(b.date)), [entries]);
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];
    const activeGoals = goals.filter(g => g.enabled);

    return (
        <div className="h-full pt-safe px-6 pb-24 overflow-y-auto no-scrollbar">
            <div className="mt-12 mb-8">
                <h2 className="text-gray-500 font-semibold uppercase tracking-wider text-xs mb-1">Dashboard</h2>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </h1>
            </div>

            <div className="space-y-4">
                {activeGoals.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                        <p className="text-gray-400">No active goals set.</p>
                    </div>
                ) : (
                    activeGoals.map(goal => {
                        const m = METRICS[goal.key];
                        const curVal = latest ? latest[goal.key] : 0;
                        const startVal = first ? first[goal.key] : 0;
                        const goalVal = parseFloat(goal.target);

                        const dispCur = convert(curVal, m.unitType, unit);
                        const dispStart = convert(startVal, m.unitType, unit);
                        
                        const delta = dispCur - dispStart;
                        const pct = (dispCur / goalVal) * 100; // Simplified progress logic

                        return (
                            <div key={goal.id} className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">{goal.label}</h3>
                                        <div className="text-3xl font-bold dark:text-white">
                                            {dispCur.toFixed(1)} <span className="text-sm text-gray-400">{getUnitLabel(m.unitType, unit)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">Target</div>
                                        <div className="font-semibold dark:text-gray-200">{goal.target} {getUnitLabel(m.unitType, unit)}</div>
                                    </div>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div style={{ width: `${Math.min(100, pct)}%` }} className={`h-full ${THEMES[theme].bg}`}></div>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    From start: {delta.toFixed(1)} {getUnitLabel(m.unitType, unit)}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};
window.TodayTab = TodayTab;