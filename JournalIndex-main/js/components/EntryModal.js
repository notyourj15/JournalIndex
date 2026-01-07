const EntryModal = ({ close, theme, unit, latest }) => {
    const [data, setData] = React.useState({ date: new Date().toISOString().split('T')[0] });
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Prefill with latest at 50% opacity
    React.useEffect(() => {
        if (latest) {
            const init = {};
            Object.keys(METRICS).forEach(k => {
                if (METRICS[k].input) init[k] = latest[k] || '';
            });
            setData(d => ({ ...d, ...init }));
        }
    }, [latest]);

    // Auto-calculate hints for calculated fields (placeholder)
    React.useEffect(() => {
        if (data.weight && data.bodyFat) {
            const w = fromInput(data.weight, 'mass', unit);
            const bf = parseFloat(data.bodyFat);
            const fatMass = w * (bf / 100);
            const leanMass = w - fatMass;
            // Set placeholders or hints (since not input, perhaps show read-only)
            // For now, log or add to data for display
        }
    }, [data, unit]);

    const handleChange = (key, val) => setData(d => ({ ...d, [key]: val }));

    const save = async () => {
        const entry = { date: data.date };
        
        Object.keys(METRICS).forEach(k => {
            if (METRICS[k].input && data[k]) {
                entry[k] = fromInput(data[k], METRICS[k].unitType, unit);
            }
        });
        
        const w = entry.weight;
        const bf = entry.bodyFat;
        if (w && bf) {
            entry.fatMass = w * (bf / 100);
            entry.leanMass = w - entry.fatMass;
        }
        
        await db.entries.put(entry);
        setShowSuccess(true);
        setTimeout(() => close(true), 2000);
    };

    return (
        <MotionLib.motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25 }}
            className="fixed inset-x-0 bottom-0 top-12 z-50 bg-white dark:bg-[#1C1C1E] rounded-t-[32px] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => close(false)} className="text-gray-400 font-medium">Cancel</button>
                <h2 className="text-lg font-bold dark:text-white">New Entry</h2>
                <button onClick={save} className={`${THEMES[theme].icon} font-bold`}>Save</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
                <div className="flex justify-center mb-6">
                    <input type="date" value={data.date} onChange={e => handleChange('date', e.target.value)} 
                        className="bg-gray-100 dark:bg-black px-4 py-2 rounded-xl dark:text-white outline-none" />
                </div>
                {Object.entries(METRICS).filter(([_, m]) => m.input).map(([key, m]) => (
                    <div key={key} className="bg-gray-50 dark:bg-black p-4 rounded-2xl flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-500 uppercase">{m.label}</label>
                        <div className="flex items-baseline gap-2">
                            <input type="number" inputMode="decimal"
                                value={data[key] || ''}
                                onChange={e => handleChange(key, e.target.value)}
                                placeholder={latest ? formatVal(latest[key], m.unitType, unit) : '-'} // Hint from latest
                                className="bg-transparent text-right text-2xl font-light outline-none dark:text-white w-32 opacity-50" // 50% opacity prefill
                            />
                            <span className="text-xs text-gray-400 font-bold w-6">{getUnitLabel(m.unitType, unit)}</span>
                        </div>
                    </div>
                ))}
            </div>
            <MotionLib.AnimatePresence>
                {showSuccess && (
                    <MotionLib.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center z-60 bg-green-500/50">
                        <i data-lucide="check-circle" className="w-20 h-20 text-white"></i>
                    </MotionLib.motion.div>
                )}
            </MotionLib.AnimatePresence>
        </MotionLib.motion.div>
    );
};
window.EntryModal = EntryModal;