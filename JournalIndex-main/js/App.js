const App = () => {
    const [tab, setTab] = React.useState('today');
    const [prevTab, setPrevTab] = React.useState('today');
    const [modal, setModal] = React.useState(false);
    const [entries, setEntries] = React.useState([]);
    
    // Persistent Settings (added mode)
    const [settings, setSettings] = React.useState({ theme: 'monochrome', unit: 'imperial', mode: 'auto' });
    const [goals, setGoals] = React.useState(() => Object.keys(METRICS).map((k, i) => ({ id: i, key: k, label: METRICS[k].label, target: 0, enabled: k === 'weight' })));

    const contentRef = React.useRef(null);

    // Initialization Effect
    React.useEffect(() => {
        const init = async () => {
            const s = await db.settings.get('config');
            if (s) setSettings(s.val);
            const g = await db.goals.toArray();
            if (g.length) setGoals(g);
            refresh();
        };
        init();
    }, []);

    // Icons & Mode Sync
    React.useEffect(() => {
        if (window.lucide) lucide.createIcons();
        
        const applyMode = () => {
            const isDark = settings.mode === 'dark' || (settings.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
        applyMode();
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', applyMode);
        return () => mediaQuery.removeEventListener('change', applyMode);
    }, [settings.mode]);

    const refresh = async () => setEntries(await db.entries.toArray());
    const toggleGoal = async (id) => {
        const g = goals.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x);
        setGoals(g);
        await db.goals.bulkPut(g);
    };

    const switchTab = (t) => { setPrevTab(tab); setTab(t); };

    // Swipe gestures with Hammer.js (like TikTok)
    React.useEffect(() => {
        const hammer = new Hammer(contentRef.current);
        hammer.on('swipeleft', () => {
            const tabs = ['today', 'trends', 'goals', 'history', 'settings'];
            const currentIndex = tabs.indexOf(tab);
            if (currentIndex < tabs.length - 1) switchTab(tabs[currentIndex + 1]);
        });
        hammer.on('swiperight', () => {
            const tabs = ['today', 'trends', 'goals', 'history', 'settings'];
            const currentIndex = tabs.indexOf(tab);
            if (currentIndex > 0) switchTab(tabs[currentIndex - 1]);
        });
        return () => hammer.destroy();
    }, [tab]);

    // Direction for animation (kept simple)
    const direction = ['today', 'trends', 'goals', 'history', 'settings'].indexOf(tab) > ['today', 'trends', 'goals', 'history', 'settings'].indexOf(prevTab) ? 1 : -1;

    return (
        <window.ErrorBoundary>
            <div className={`h-dvh w-screen overflow-hidden flex flex-col ${THEMES[settings.theme].text.replace('text-', 'selection:bg-')}`} ref={contentRef}>
                {/* Main Content Area with Transitions */}
                <div className="flex-1 relative bg-[#F2F2F7] dark:bg-black">
                    <MotionLib.AnimatePresence custom={direction} initial={false}>
                        <MotionLib.motion.div key={tab} custom={direction} 
                            initial={{ x: direction > 0 ? '100%' : '-100%' }} animate={{ x: 0 }} exit={{ x: direction > 0 ? '-20%' : '20%' }} 
                            transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
                            className="absolute inset-0 bg-[#F2F2F7] dark:bg-black shadow-2xl">
                            {tab === 'today' && <window.TodayTab goals={goals} entries={entries} theme={settings.theme} unit={settings.unit} />}
                            {tab === 'trends' && <window.TrendsTab entries={entries} theme={settings.theme} unit={settings.unit} />}
                            {tab === 'goals' && <window.GoalsTab goals={goals} toggleGoal={toggleGoal} theme={settings.theme} unit={settings.unit} />}
                            {tab === 'history' && <window.HistoryTab entries={entries} deleteEntry={async (d) => { await db.entries.delete(d); refresh(); }} theme={settings.theme} unit={settings.unit} />}
                            {tab === 'settings' && <window.SettingsTab settings={settings} setSettings={setSettings} theme={settings.theme} />}
                        </MotionLib.motion.div>
                    </MotionLib.AnimatePresence>
                </div>

                {/* Bottom Navigation with center FAB */}
                <div className="fixed bottom-0 left-0 right-0 glass z-40 pb-safe pt-2 h-[88px] flex justify-around items-start border-t border-gray-200 dark:border-gray-800">
                    <button onClick={() => switchTab('today')} className={`flex flex-col items-center w-16 pt-2 ${tab === 'today' ? THEMES[settings.theme].icon : 'text-gray-400'}`}>
                        <i data-lucide="layout-dashboard" className="w-6 h-6 mb-1"></i>
                        <span className="text-[10px] font-medium">Today</span>
                    </button>
                    <button onClick={() => switchTab('trends')} className={`flex flex-col items-center w-16 pt-2 ${tab === 'trends' ? THEMES[settings.theme].icon : 'text-gray-400'}`}>
                        <i data-lucide="activity" className="w-6 h-6 mb-1"></i>
                        <span className="text-[10px] font-medium">Trends</span>
                    </button>
                    <button onClick={() => setModal(true)} className={`flex flex-col items-center w-16 pt-2 ${THEMES[settings.theme].icon}`}>
                        <i data-lucide="plus" className="w-6 h-6 mb-1"></i>
                        <span className="text-[10px] font-medium">Add</span>
                    </button>
                    <button onClick={() => switchTab('goals')} className={`flex flex-col items-center w-16 pt-2 ${tab === 'goals' ? THEMES[settings.theme].icon : 'text-gray-400'}`}>
                        <i data-lucide="target" className="w-6 h-6 mb-1"></i>
                        <span className="text-[10px] font-medium">Goals</span>
                    </button>
                    <button onClick={() => switchTab('history')} className={`flex flex-col items-center w-16 pt-2 ${tab === 'history' ? THEMES[settings.theme].icon : 'text-gray-400'}`}>
                        <i data-lucide="table-2" className="w-6 h-6 mb-1"></i>
                        <span className="text-[10px] font-medium">History</span>
                    </button>
                    <button onClick={() => switchTab('settings')} className={`flex flex-col items-center w-16 pt-2 ${tab === 'settings' ? THEMES[settings.theme].icon : 'text-gray-400'}`}>
                        <i data-lucide="settings-2" className="w-6 h-6 mb-1"></i>
                        <span className="text-[10px] font-medium">Settings</span>
                    </button>
                </div>

                {/* Modals */}
                <MotionLib.AnimatePresence>
                    {modal && (
                        <>
                            <MotionLib.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setModal(false)} />
                            <window.EntryModal close={(r) => { setModal(false); if(r) refresh(); }} theme={settings.theme} unit={settings.unit} latest={entries[entries.length-1]} />
                        </>
                    )}
                </MotionLib.AnimatePresence>
            </div>
        </window.ErrorBoundary>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);