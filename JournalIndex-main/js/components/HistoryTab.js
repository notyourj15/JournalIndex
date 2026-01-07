const HistoryTab = ({ entries, deleteEntry, theme, unit }) => {
    const sorted = React.useMemo(() => [...entries].sort((a,b) => new Date(b.date) - new Date(a.date)), [entries]);

    return (
        <div className="h-full pt-safe pb-24 overflow-x-auto no-scrollbar bg-[#F2F2F7] dark:bg-black">
            <h1 className="text-3xl font-bold dark:text-white p-6">History</h1>
            <div className="overflow-auto">
                <table className="w-max min-w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                            <th className="sticky-corner p-3 border-b">Date</th>
                            {Object.keys(METRICS).map(k => <th key={k} className="sticky-head p-3 border-b">{METRICS[k].label}</th>)}
                            <th className="sticky-head p-3 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(e => (
                            <tr key={e.date} className="bg-white dark:bg-[#1C1C1E] border-b">
                                <td className="sticky-col p-3">{e.date}</td>
                                {Object.keys(METRICS).map(k => (
                                    <td key={k} className="p-3 text-right">
                                        {formatVal(e[k], METRICS[k].unitType, unit)} {getUnitLabel(METRICS[k].unitType, unit)}
                                    </td>
                                ))}
                                <td className="p-3">
                                    <button onClick={() => deleteEntry(e.date)} className="text-red-500">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
window.HistoryTab = HistoryTab;