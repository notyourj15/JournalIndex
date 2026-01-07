const GoalsTab = ({ goals, toggleGoal, theme, unit }) => {
    return (
        <div className="h-full pt-safe pb-24 overflow-y-auto no-scrollbar bg-[#F2F2F7] dark:bg-black">
            <h1 className="text-3xl font-bold dark:text-white p-6">Goals</h1>
            <div className="space-y-4 px-6">
                {goals.map(g => (
                    <button key={g.id} onClick={() => toggleGoal(g.id)} className="flex justify-between items-center w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full ${g.enabled ? THEMES[theme].bg : 'bg-gray-200'} `}></div>
                            <span className={`text-lg ${g.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{g.label}</span>
                        </div>
                        <span className="text-gray-400">{getUnitLabel(METRICS[g.key].unitType, unit)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
window.GoalsTab = GoalsTab;