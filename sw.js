<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Health Journal</title>
    
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/dexie@3/dist/dexie.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>

    <style>
        :root { --safe-top: env(safe-area-inset-top); --safe-bottom: env(safe-area-inset-bottom); }
        body { 
            background-color: #F2F2F7; 
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif; 
            overflow: hidden;
        }
        .dark body { background-color: #000000; }
        .safe-pt { padding-top: max(20px, var(--safe-top)); }
        .safe-pb { padding-bottom: max(20px, var(--safe-bottom)); }
        .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .dark .glass { background: rgba(28, 28, 30, 0.8); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        input[type="date"] { min-height: 2.5rem; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { motion, AnimatePresence } = window.Motion;
        const { useState, useEffect, useMemo } = React;

        const METRICS = [
            { key: 'weight', label: 'Weight', unit: 'lb', target: 180 },
            { key: 'bodyFat', label: 'Body Fat', unit: '%', target: 15 },
            { key: 'visceral', label: 'Visceral', unit: 'lvl', target: 8 },
            { key: 'muscle', label: 'Muscle', unit: '%', target: 40 },
            { key: 'water', label: 'Water', unit: '%', target: 60 },
            { key: 'bone', label: 'Bone', unit: 'lb', target: 8 },
            { key: 'bmr', label: 'BMR', unit: 'kcal', target: 2000 }
        ];

        const THEMES = {
            blue: { bg: 'bg-[#007AFF]', text: 'text-[#007AFF]' },
            green: { bg: 'bg-[#34C759]', text: 'text-[#34C759]' },
            monochrome: { bg: 'bg-[#1C1C1E]', text: 'text-[#1C1C1E]' }
        };

        const db = new Dexie('HealthJournal_V4');
        db.version(1).stores({ entries: 'date', settings: 'id', goals: 'key' });

        const App = () => {
            const [tab, setTab] = useState('today');
            const [prevTab, setPrevTab] = useState('today');
            const [showModal, setShowModal] = useState(false);
            const [entries, setEntries] = useState([]);
            const [settings, setSettings] = useState({ theme: 'blue', mode: 'light', unit: 'imperial' });
            const [activeGoals, setActiveGoals] = useState(['weight', 'bodyFat']);

            useEffect(() => {
                const init = async () => {
                    const s = await db.settings.get(1);
                    if (s) setSettings(s.data);
                    const g = await db.goals.toArray();
                    if (g.length) setActiveGoals(g.map(item => item.key));
                    loadData();
                };
                init();
            }, []);

            const loadData = async () => {
                const data = await db.entries.orderBy('date').reverse().toArray();
                setEntries(data);
                setTimeout(() => lucide.createIcons(), 100);
            };

            const switchTab = (id) => {
                setPrevTab(tab);
                setTab(id);
            };

            const tabOrder = ['today', 'history', 'goals', 'settings'];
            const direction = tabOrder.indexOf(tab) > tabOrder.indexOf(prevTab) ? 1 : -1;

            return (
                <div className={`${settings.mode === 'dark' ? 'dark' : ''} h-screen flex flex-col bg-[#F2F2F7] dark:bg-black text-black dark:text-white`}>
                    <main className="flex-1 relative safe-pt overflow-hidden">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={tab}
                                custom={direction}
                                initial={{ x: direction * 100 + '%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: direction * -100 + '%', opacity: 0 }}
                                transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                                className="absolute inset-0 w-full h-full p-6"
                            >
                                {tab === 'today' && <Dashboard lastEntry={entries[0]} activeGoals={activeGoals} theme={settings.theme} />}
                                {tab === 'history' && <History entries={entries} refresh={loadData} theme={settings.theme} />}
                                {tab === 'goals' && <Goals active={activeGoals} toggle={(key) => {
                                    const next = activeGoals.includes(key) ? activeGoals.filter(k => k !== key) : [...activeGoals, key];
                                    setActiveGoals(next);
                                    db.goals.clear().then(() => db.goals.bulkPut(next.map(key => ({key}))));
                                }} theme={settings.theme} />}
                                {tab === 'settings' && <Settings settings={settings} setSettings={(s) => {
                                    setSettings(s);
                                    db.settings.put({id: 1, data: s});
                                }} />}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    <nav className="glass border-t border-[#C6C6C8] dark:border-[#38383A] h-[88px] safe-pb flex justify-around items-center px-4 z-50">
                        <NavBtn id="today" icon="layout" label="Today" active={tab} set={switchTab} theme={settings.theme} />
                        <NavBtn id="history" icon="table" label="History" active={tab} set={switchTab} theme={settings.theme} />
                        <div className="w-16 flex justify-center">
                            {tab !== 'settings' && (
                                <button onClick={() => setShowModal(true)} className={`w-14 h-14 rounded-full ${THEMES[settings.theme].bg} text-white shadow-lg flex items-center justify-center -mt-10 border-[5px] border-[#F2F2F7] dark:border-black active:scale-90 transition-transform`}>
                                    <i data-lucide="plus" className="w-8 h-8"></i>
                                </button>
                            )}
                        </div>
                        <NavBtn id="goals" icon="target" label="Goals" active={tab} set={switchTab} theme={settings.theme} />
                        <NavBtn id="settings" icon="settings" label="Settings" active={tab} set={switchTab} theme={settings.theme} />
                    </nav>

                    <AnimatePresence>
                        {showModal && <EntryModal close={(r) => { setShowModal(false); if(r) loadData(); }} theme={settings.theme} />}
                    </AnimatePresence>
                </div>
            );
        };

        const NavBtn = ({ id, icon, label, active, set, theme }) => (
            <button onClick={() => set(id)} className={`flex flex-col items-center w-12 transition-colors ${active === id ? THEMES[theme].text : 'text-[#8E8E93]'}`}>
                <i data-lucide={icon} className="w-6 h-6"></i>
                <span className="text-[10px] font-medium mt-1">{label}</span>
            </button>
        );

        const Dashboard = ({ lastEntry, activeGoals, theme }) => (
            <div className="space-y-6">
                <header>
                    <h2 className="text-[#8E8E93] font-semibold text-sm uppercase tracking-tight">Today</h2>
                    <h1 className="text-3xl font-bold">Progress</h1>
                </header>
                <div className="grid gap-4 overflow-y-auto no-scrollbar pb-32">
                    {activeGoals.map(key => {
                        const m = METRICS.find(i => i.key === key);
                        const val = lastEntry?.[key] || 0;
                        const pct = Math.min(100, (val / m.target) * 100);
                        return (
                            <div key={key} className="bg-white dark:bg-[#1C1C1E] p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-end mb-3">
                                    <span className="font-bold text-gray-500">{m.label}</span>
                                    <span className="text-xl font-black">{val}<span className="text-xs ml-1 opacity-40">{m.unit}</span></span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div initial={{width: 0}} animate={{width: `${pct}%`}} className={`h-full ${THEMES[theme].bg}`} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );

        const History = ({ entries, refresh, theme }) => {
            const [editMode, setEditMode] = useState(false);
            const [sortLatest, setSortLatest] = useState(true);

            const sortedEntries = useMemo(() => {
                return [...entries].sort((a, b) => sortLatest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
            }, [entries, sortLatest]);

            return (
                <div className="flex flex-col h-full bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-2xl overflow-hidden">
                    <div className="p-4 flex justify-between items-center border-b dark:border-gray-800 bg-gray-50/50 dark:bg-black/50">
                        <button onClick={() => setSortLatest(!sortLatest)} className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-bold shadow-sm">
                            <i data-lucide={sortLatest ? "arrow-down-narrow-wide" : "arrow-up-narrow-wide"} className="w-4 h-4"></i>
                            {sortLatest ? "Latest" : "Oldest"}
                        </button>
                        <button onClick={() => setEditMode(!editMode)} className={`p-2 rounded-full ${editMode ? THEMES[theme].bg + ' text-white' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
                            <i data-lucide={editMode ? "check" : "edit-2"} className="w-5 h-5"></i>
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50 dark:bg-black z-10">
                                <tr>
                                    {editMode && <th className="p-3"></th>}
                                    <th className="p-3 text-left">Date</th>
                                    {METRICS.map(m => <th key={m.key} className="p-3 text-right">{m.label}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedEntries.map(e => (
                                    <tr key={e.date} className="border-b dark:border-gray-800">
                                        {editMode && (
                                            <td className="p-3">
                                                <button onClick={() => { if(confirm('Delete?')) db.entries.delete(e.date).then(refresh) }} className="text-red-500"><i data-lucide="trash-2" className="w-4 h-4"></i></button>
                                            </td>
                                        )}
                                        <td className="p-3 font-mono font-bold text-[#8E8E93]">{e.date.slice(5)}</td>
                                        {METRICS.map(m => (
                                            <td key={m.key} className="p-0 border-l dark:border-gray-800">
                                                <input 
                                                    type="number" 
                                                    inputmode="decimal"
                                                    step="0.01"
                                                    defaultValue={e[m.key]} 
                                                    onBlur={(evt) => db.entries.update(e.date, {[m.key]: parseFloat(evt.target.value) || 0}).then(refresh)}
                                                    className="w-full p-3 text-right bg-transparent outline-none focus:bg-blue-50/50" 
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        };

        const Goals = ({ active, toggle, theme }) => (
            <div className="space-y-4 h-full overflow-y-auto pb-32 no-scrollbar">
                <h1 className="text-3xl font-black">Goals</h1>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl divide-y dark:divide-gray-800 shadow-sm overflow-hidden">
                    {METRICS.map(m => (
                        <div key={m.key} onClick={() => toggle(m.key)} className="flex items-center p-5 active:bg-gray-50 transition-colors">
                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${active.includes(m.key) ? THEMES[theme].bg + ' border-transparent' : 'border-gray-300'}`}>
                                {active.includes(m.key) && <i data-lucide="check" className="w-4 h-4 text-white"></i>}
                            </div>
                            <span className={`text-lg ${active.includes(m.key) ? 'font-bold' : 'text-gray-400'}`}>{m.label}</span>
                            <span className="ml-auto opacity-30 font-mono text-sm">{m.target}{m.unit}</span>
                        </div>
                    ))}
                </div>
            </div>
        );

        const Settings = ({ settings, setSettings }) => (
            <div className="space-y-6">
                <h1 className="text-3xl font-black">Settings</h1>
                <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl space-y-6 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Accent Color</span>
                        <div className="flex gap-2">
                            {Object.keys(THEMES).map(t => (
                                <button key={t} onClick={() => setSettings({...settings, theme: t})} className={`w-8 h-8 rounded-full ${THEMES[t].bg} ${settings.theme === t ? 'ring-4 ring-gray-200' : ''}`} />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Mode</span>
                        <button onClick={() => setSettings({...settings, mode: settings.mode === 'light' ? 'dark' : 'light'})} className="px-4 py-2 bg-gray-100 dark:bg-black rounded-full text-xs font-black uppercase">
                            {settings.mode}
                        </button>
                    </div>
                </div>
            </div>
        );

        const EntryModal = ({ close, theme }) => {
            const [vals, setVals] = useState({ date: new Date().toISOString().split('T')[0] });
            useEffect(() => { lucide.createIcons(); }, []);

            return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end">
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{type:'spring', damping:25}} className="w-full bg-white dark:bg-[#1C1C1E] rounded-t-[2.5rem] p-8 pb-12 shadow-2xl overflow-y-auto max-h-[92vh]">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-center mb-6">New Log</h2>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-black p-4 rounded-2xl">
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Entry Date</label>
                                <input type="date" value={vals.date} onChange={e => setVals({...vals, date: e.target.value})} className="w-full bg-transparent font-bold text-lg outline-none" />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {METRICS.map(m => (
                                    <div key={m.key} className="flex items-center bg-gray-50 dark:bg-black p-4 rounded-2xl">
                                        <div className="flex-1">
                                            <span className="text-[10px] font-black uppercase text-gray-400 block">{m.label}</span>
                                            <input 
                                                type="number" 
                                                inputmode="decimal"
                                                step="0.01"
                                                placeholder="0.00" 
                                                onChange={e => setVals({...vals, [m.key]: parseFloat(e.target.value) || 0})} 
                                                className="bg-transparent text-xl font-black w-full outline-none mt-1" 
                                            />
                                        </div>
                                        <span className="text-xs font-bold opacity-30">{m.unit}</span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => { db.entries.put(vals).then(() => close(true)); }} className={`w-full py-5 rounded-[2rem] text-white font-black text-lg shadow-xl ${THEMES[theme].bg} mt-4 active:scale-95 transition-transform`}>
                                Log Entry
                            </button>
                            <button onClick={() => close(false)} className="w-full py-2 text-gray-400 font-bold text-sm">Dismiss</button>
                        </div>
                    </motion.div>
                </motion.div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
