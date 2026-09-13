import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Paper {
    id: string;
    paperCode: string;
    paperName: string;
    session: string | null;
}

export function GatePaperDetails() {
    const { year, paperCode } = useParams<{ year: string; paperCode: string }>();
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; isOfficialError: boolean } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetch(`/api/v1/gate/exams/${year}/papers`)
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(JSON.stringify({ message: errData.error || 'Failed to fetch', isOfficialError: errData.isOfficialError || false }));
                }
                return res.json();
            })
            .then((data) => {
                setPapers(data);
                setError(null);
                setLoading(false);
            })
            .catch((err) => {
                try {
                    setError(JSON.parse(err.message));
                } catch {
                    setError({ message: err.message, isOfficialError: false });
                }
                setLoading(false);
            });
    }, [year]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Paper Details...</div>;

    if (error) {
        if (error.isOfficialError) {
            return (
                <div className="max-w-3xl mx-auto mt-12 p-8 text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">Official Information Not Published</h2>
                    <p className="text-yellow-700 dark:text-yellow-300">{error.message}</p>
                    <button onClick={() => navigate('/gate')} className="mt-6 px-4 py-2 bg-yellow-600 text-white rounded">Return to Dashboard</button>
                </div>
            );
        }
        return <div className="max-w-3xl mx-auto mt-12 p-8 text-center text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={() => navigate('/gate')} className="mb-6 text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</button>

            <div className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GATE {year} Papers</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Select a paper to view syllabus and official resources.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {papers.map((p) => (
                    <div key={p.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{p.paperCode}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{p.paperName}</p>
                                {p.session && <p className="text-sm text-gray-500 mt-2">Session: {p.session}</p>}
                            </div>
                        </div>

                        {paperCode === p.paperCode ? (
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                                <p>Paper Specific logic goes here (Syllabus renderer).</p>
                                <p className="mt-2 text-xs italic">Only official sources are rendered.</p>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate(`/gate/${year}/${p.paperCode}`)}
                                className="mt-4 px-4 py-2 text-sm bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded w-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            >
                                View Paper Details
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
