const SettingsTab = ({ settings, setSettings, theme }) => {
    const update = (k, v) => {
        const s = { ...settings, [k]: v };
        setSettings(s);
        db.settings.put({ key: 'config', val: s });
    };

    // Light mode background adjustment
    useEffect(() => {
        if (!document.documentElement.classList.contains('dark')) {
            document.body.style.backgroundColor = THEMES[settings.theme].lightBg; // Very dark shade for bg
        }
    }, [settings.theme]);

    return (
        <div className="h-full pt-safe px-6 pb-24 bg-[#F2F2F7] dark:bg-black overflow-y-auto">
            <h1 className="text-3xl font-bold dark:text-white mt-12 mb-8">Settings</h1>
            <div className="space-y-6">
                <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Mode</h3>
                    <div className="flex bg-gray-100 dark:bg-black p-1 rounded-xl">
                        {['light', 'auto', 'dark'].map(m => (
                            <button key={m} onClick={() => update('mode', m)} 
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${settings.mode === m ? 'bg-white dark:bg-gray-800 shadow text-black dark:text-white' : 'text-gray-400'}`}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Unit System</h3>
                    <div className="flex bg-gray-100 dark:bg-black p-1 rounded-xl">
                        {['imperial', 'metric'].map(u => (
                            <button key={u} onClick={() => update('unit', u)} 
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${settings.unit === u ? 'bg-white dark:bg-gray-800 shadow text-black dark:text-white' : 'text-gray-400'}`}>
                                {u}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Theme</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.values(THEMES).map(t => (
                            <button key={t.id} onClick={() => update('theme', t.id)} className="flex flex-col items-center gap-2 p-2">
                                <div className={`w-8 h-8 rounded-full ${t.darkShade} ring-2 ring-offset-2 dark:ring-offset-gray-900 ${settings.theme === t.id ? 'ring-gray-400' : 'ring-transparent'}`} />
                                <span className="text-[10px] text-gray-500 font-medium">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
window.SettingsTab = SettingsTab;