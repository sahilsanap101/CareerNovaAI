import { User, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface ResumeImportChoiceProps {
    onChoice: (choice: 'manual' | 'assessment') => void;
}

export function ResumeImportChoice({ onChoice }: ResumeImportChoiceProps) {
    return (
        <div className="flex justify-center items-center py-12">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Complete Your Profile</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Choose how you'd like to get started:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => onChoice('manual')} className="cursor-pointer group h-full">
                        <Card className="border-2 transition-all group-hover:border-primary-500 group-hover:shadow-md dark:group-hover:border-primary-500 h-full">
                            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                                <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/40 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Profile Information</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Complete your academic, technical, project, and career information.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div onClick={() => onChoice('assessment')} className="cursor-pointer group h-full">
                        <Card className="border-2 transition-all group-hover:border-purple-500 group-hover:shadow-md dark:group-hover:border-purple-500 h-full">
                            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                                <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Career Assessment</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Answer a short set of questions to help personalize your career recommendations.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
