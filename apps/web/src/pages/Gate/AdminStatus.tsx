// @ts-nocheck
import React, { useEffect, useState } from 'react';

interface SyncRecord {
    id: string;
    examId: string;
    entityType: string;
    lastSyncedAt: string;
    status: string;
    details: string;
    exam?: { year: number; organizingInstitute: string };
}

export function AdminSyncStatus() {
    const [logs, setLogs] = useState<SyncRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/gate/admin/sync-status', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleTriggerSync = async () => {
        const sourceUrl = prompt("Enter Official Source URL strictly for Sync verification:");
        if (!sourceUrl) return;

        const entityType = window.prompt("Enter Entity Type (e.g. SYLLABUS, RESOURCES):", "SYLLABUS")?.toUpperCase();
        if (!entityType) return;

        try {
            if (logs.length > 0 && logs[0].examId) {
                await fetch(`/api/v1/gate/admin/sync/${logs[0].examId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ entityType, sourceUrl })
                });
                fetchLogs();
            } else {
                alert("No exam contexts available to sync against.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin: Data Sync Status</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Time-aware monitoring of official GATE data streams with content hashing.</p>
                </div>
                <button
                    onClick={handleTriggerSync}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                    Force Manual Sync
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Synced</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading sync verifications...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No sync attempts recorded.</td></tr>
                        ) : logs.map((log) => {
                            let parsedDetails = null;
                            try { parsedDetails = JSON.parse(log.details); } catch (e) { }

                            return (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        GATE {log.exam?.year || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {log.entityType}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(log.lastSyncedAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {parsedDetails ? (
                                            <div className="flex flex-col text-xs space-y-1">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">{parsedDetails.message}</span>
                                                {parsedDetails.hash && <span className="font-mono bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded text-gray-500 truncate w-48" title={parsedDetails.hash}>hash: {parsedDetails.hash.substring(0, 10)}...</span>}
                                            </div>
                                        ) : (
                                            log.details
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
