import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ExternalLink, BookOpen, AlertCircle } from 'lucide-react';
import { gateApi, type GateProfile } from './api';
import { GATE_RESOURCES, type GateResource } from './practiceResources';
import { Loader } from '@/components/ui/Loader';
import { clsx } from 'clsx';

export function GatePractice() {
    const [profile, setProfile] = useState<GateProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const categories = ['All', 'Official', 'Mock Tests', 'Practice'];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await gateApi.getProfile();
                setProfile(data);
            } catch (err) {
                // Safe to ignore if profile doesn't exist yet, we still show generic resources.
            } finally {
                setLoading(false);
            }
        };
        void fetchProfile();
    }, []);

    const filteredResources = GATE_RESOURCES.filter(res =>
        activeCategory === 'All' ? true : res.category === activeCategory
    );

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            {profile && profile.paper && (
                <Card className="p-4 bg-primary-50/50 dark:bg-primary-900/10 border-l-4 border-l-primary-500">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        <strong>Your selected paper:</strong> {profile.paper}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Note: Most external resources provide practice material mapped across various engineering branches. Verify your specific branch when landing on external sites.
                    </p>
                </Card>
            )}

            {/* Tabs */}
            <div className="flex justify-start gap-2 overflow-x-auto pb-2 border-b dark:border-slate-800">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative border-b-2",
                            activeCategory === cat
                                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((resource: GateResource) => (
                    <Card key={resource.id} className="p-5 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className={clsx(
                                    "text-xs font-semibold px-2 py-1 rounded inline-block",
                                    resource.sourceType === 'Official GATE'
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                )}>
                                    {resource.sourceType}
                                </span>
                                {resource.year && (
                                    <span className="text-xs font-bold text-slate-400">{resource.year}</span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                {resource.title}
                            </h3>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                {resource.description}
                            </p>
                        </div>

                        <div className="pt-4 mt-auto border-t dark:border-slate-800">
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input hover:bg-slate-50 dark:hover:bg-slate-800 h-10 px-4 py-2 text-slate-700 dark:text-slate-200"
                            >
                                Open Resource
                                <ExternalLink className="ml-2 w-4 h-4" />
                            </a>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t dark:border-slate-800 text-center">
                <div className="inline-flex items-start text-xs text-slate-500 max-w-2xl text-left bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-slate-400" />
                    <p>
                        <strong>Disclaimer:</strong> Official GATE information is dynamically maintained by the organizing institute (e.g., IITs). CareerNova provides direct links to these external resources for convenience, but is not responsible for their continued availability. CareerNova-hosted internal questions are not currently available; please rely on the trusted canonical sources listed above to continue preparation.
                    </p>
                </div>
            </div>
        </div>
    );
}
