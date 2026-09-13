import React, { useState, useEffect } from 'react';

export function GateResourceExplorer() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResources = () => {
        setLoading(true);
        fetch('/api/v1/gate/resources?paperId=cs-24', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(res => res.json())
            .then(json => {
                if (json.success) setResources(json.data);
                setLoading(false);
            });
    };

    useEffect(() => { fetchResources(); }, []);

    const handleAction = async (id: string, actionType: string) => {
        await fetch(`/api/v1/gate/resources/${id}/action`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionType })
        });
        fetchResources();
    };

    const handleOpen = (url: string, id: string) => {
        handleAction(id, 'OPENED');
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Scanning Global Knowledge Bases...</div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-black mb-2 text-gray-900">Learning Resource Engine</h1>
            <p className="text-gray-500 mb-8 font-medium">Dynamically ranked based on your mistakes, topology gaps, and Official precedences.</p>

            {resources.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded font-bold">No verified resources located.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((res: any) => (
                        <div key={res.id} className={`p-5 rounded-xl border shadow-sm ${res.isOfficial ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'}`}>

                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-xs font-black px-2 py-1 rounded tracking-wide ${res.isOfficial ? 'bg-purple-200 text-purple-900' : 'bg-gray-100 text-gray-700'}`}>
                                    {res.isOfficial ? '★ OFFICIAL GATE' : 'COMMUNITY'}
                                </span>
                                <span className="text-xs text-gray-500 font-bold">{res.resourceType}</span>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">{res.title}</h3>
                            <p className="text-sm text-gray-500 font-medium mb-4">{res.provider}</p>

                            <div className="flex space-x-2 border-t pt-4">
                                <button onClick={() => handleOpen(res.url, res.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded shadow-sm text-sm transition">
                                    Launch Resource
                                </button>
                                <button onClick={() => handleAction(res.id, 'BOOKMARK')} title="Save for later"
                                    className={`px-3 py-2 rounded border font-bold text-sm ${res.actions?.some((a: any) => a.actionType === 'BOOKMARK') ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                    🔖
                                </button>
                            </div>

                            <div className="mt-3 flex space-x-2">
                                <button onClick={() => handleAction(res.id, 'USEFUL')}
                                    className={`flex-1 text-xs font-bold py-1 rounded border ${res.actions?.some((a: any) => a.actionType === 'USEFUL') ? 'bg-green-100 text-green-700 border-green-300' : 'text-gray-500 hover:bg-gray-50 border-transparent'}`}>👍 Helpful</button>
                                <button onClick={() => handleAction(res.id, 'NOT_USEFUL')}
                                    className={`flex-1 text-xs font-bold py-1 rounded border ${res.actions?.some((a: any) => a.actionType === 'NOT_USEFUL') ? 'bg-red-100 text-red-700 border-red-300' : 'text-gray-500 hover:bg-gray-50 border-transparent'}`}>👎 Poor</button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
