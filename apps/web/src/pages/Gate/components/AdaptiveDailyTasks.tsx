import React, { useState, useEffect } from 'react';

export function AdaptiveDailyTasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlan = () => {
        setLoading(true);
        fetch('/api/v1/gate/planner/daily', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(res => res.json())
            .then(json => {
                if (json.success) setTasks(json.data);
                setLoading(false);
            });
    };

    useEffect(() => { fetchPlan(); }, []);

    const handleAction = async (id: string, action: string, reason?: string) => {
        await fetch(`/api/v1/gate/planner/session/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, reason })
        });
        fetchPlan();
    };

    const regeneratePlanner = async () => {
        setTasks([]);
        setLoading(true);
        await fetch('/api/v1/gate/planner/regenerate', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        fetchPlan();
    };

    if (loading) return <div className="p-8 text-center bg-gray-50 rounded-lg animate-pulse">Calculating Algorithmic Priorities...</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900">Today's Adaptive Path</h2>
                    <p className="text-xs text-gray-500 font-bold mt-1">Generated natively based on your recent Mistake Patterns & Prerequisites</p>
                </div>
                <button onClick={regeneratePlanner} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100 transition-colors">
                    Regenerate Based On New Metrics
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="bg-green-50 text-green-800 p-4 rounded text-center text-sm font-bold">
                    Daily algorithmic load completed! Rest up.
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task: any) => (
                        <div key={task.id} className={`p-4 border rounded-lg ${task.status === 'COMPLETED' ? 'opacity-50 line-through bg-gray-50' : task.status === 'SKIPPED' ? 'opacity-50 border-red-300' : 'border-indigo-200'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs font-bold text-indigo-600 mb-1">{task.durationMins} minutes allocated</div>
                                    <h3 className="font-bold text-gray-800">{task.title}</h3>
                                </div>
                                {task.status === 'PLANNED' && (
                                    <div className="flex space-x-2 text-xs">
                                        <button onClick={() => handleAction(task.id, 'COMPLETED')} className="bg-green-500 text-white px-2 py-1 rounded font-bold">Complete</button>
                                        <button onClick={() => {
                                            const reason = prompt("Why are you skipping? (Used for heuristics override):");
                                            if (reason) handleAction(task.id, 'SKIPPED', reason);
                                        }} className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">Skip</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
