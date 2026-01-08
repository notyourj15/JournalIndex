const GoalsTab = ({ goals, toggleGoal, updateGoalTarget, theme, unit }) => {
    const [editingId, setEditingId] = React.useState(null);
    const [tempValue, setTempValue] = React.useState('');

    const handleTargetClick = (goal, e) => {
        e.stopPropagation();
        setEditingId(goal.id);
        setTempValue(goal.target?.toString() || '0');
    };

    const handleTargetBlur = (goalId) => {
        const numValue = parseFloat(tempValue) || 0;
        updateGoalTarget(goalId, numValue);
        setEditingId(null);
    };

    const handleTargetChange = (e) => {
        setTempValue(e.target.value);
    };

    const handleKeyDown = (e, goalId) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <div className="h-full pt-safe pb-24 overflow-y-auto no-scrollbar bg-[#F2F2F7] dark:bg-black">
            <h1 className="text-3xl font-bold dark:text-white p-6">Goals</h1>
            <div className="space-y-4 px-6">
                {goals.map(g => (
                    <button 
                        key={g.id} 
                        onClick={() => toggleGoal(g.id)} 
                        className="flex justify-between items-center w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-xl shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full ${g.enabled ? THEMES[theme].bg : 'bg-gray-200'}`}></div>
                            <span className={`text-lg ${g.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                {g.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {editingId === g.id ? (
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    pattern="[0-9]*"
                                    value={tempValue}
                                    onChange={handleTargetChange}
                                    onBlur={() => handleTargetBlur(g.id)}
                                    onKeyDown={(e) => handleKeyDown(e, g.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-20 text-right bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white px-2 py-1 rounded-lg border-2 border-blue-500 focus:outline-none"
                                    autoFocus
                                />
                            ) : (
                                <span 
                                    onClick={(e) => handleTargetClick(g, e)}
                                    className="text-gray-900 dark:text-white font-semibold cursor-text px-2 py-1 hover:bg-gray-100 dark:hover:bg-[#2C2C2E] rounded-lg transition-colors"
                                >
                                    {g.target || 0}
                                </span>
                            )}
                            <span className="text-gray-400">
                                {getUnitLabel(METRICS[g.key].unitType, unit)}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

window.GoalsTab = GoalsTab;
