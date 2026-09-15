import { ExternalLink, MapPin, Building2, Briefcase } from 'lucide-react';
import { successStories } from './data';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Strategy for fetching reliable Initial block when image is disabled globally protecting privacy.
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

export function SuccessStories() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 mb-12">
            {/* Header section reflecting premium career styling */}
            <div className="text-center space-y-4 max-w-3xl mx-auto mt-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 tracking-tight">
                    SUCCESS STORIES
                </h1>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
                    Real career journeys from the GHRCE community.
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed">
                    Explore how students and alumni from G.H. Raisoni College of Engineering, Nagpur have built careers across technology, consulting, analytics, engineering and further studies.
                </p>
            </div>

            {/* Grid displaying exactly 9 curated items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {successStories.map((story) => (
                    <Card
                        key={story.id}
                        className="flex flex-col h-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-in-out cursor-default"
                    >
                        <div className="p-6 flex-grow flex flex-col">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800/60">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-primary-700 dark:text-primary-300 font-extrabold text-xl flex-shrink-0 shadow-inner">
                                    {getInitials(story.name)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{story.name}</h3>
                                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1">{story.ghrceBackground}</p>
                                </div>
                            </div>

                            {/* Career Pathway Timeline */}
                            <div className="mb-6 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                                    {story.careerPath}
                                </p>
                            </div>

                            {/* Current Role Details */}
                            <div className="space-y-4 mt-auto mb-6">
                                {story.currentRole && (
                                    <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                        <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <span className="font-medium">{story.currentRole}</span>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span className="font-bold">{story.organization}</span>
                                </div>
                                {story.location && (
                                    <div className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <span>{story.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Caption & Valid External Resource Links */}
                            <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                                <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 italic leading-snug">
                                    "{story.caption}"
                                </p>
                                {story.linkedinUrl && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/40 dark:text-primary-400 flex-shrink-0 h-8 px-2"
                                        onClick={() => window.open(story.linkedinUrl, '_blank', 'noopener,noreferrer')}
                                    >
                                        <span className="text-xs mr-1.5 font-bold">LinkedIn</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Trust Marker */}
            <div className="mt-16 text-center pt-8 border-t border-slate-200 dark:border-slate-800/80">
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-2xl mx-auto">
                    Success stories are curated from publicly available professional and institutional information. Career roles and profiles may change over time.
                </p>
            </div>
        </div>
    );
}
