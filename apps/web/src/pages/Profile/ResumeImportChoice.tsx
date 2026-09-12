import { FileText, Edit3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface ResumeImportChoiceProps {
    onChoice: (choice: 'import' | 'manual') => void;
}

export function ResumeImportChoice({ onChoice }: ResumeImportChoiceProps) {
    return (
        <div className="flex justify-center items-center py-12">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Complete Your Profile</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Choose how you\\'d like to get started:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => onChoice('import')} className="cursor-pointer group h-full">
                        <Card className="border-2 transition-all group-hover:border-primary-500 group-hover:shadow-md dark:group-hover:border-primary-500 h-full">
                            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                                <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/40 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Upload Resume</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Automatically fill your profile information by extracting data from your PDF or DOCX resume.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div onClick={() => onChoice('manual')} className="cursor-pointer group h-full">
                        <Card className="border-2 transition-all group-hover:border-slate-400 group-hover:shadow-md dark:group-hover:border-slate-500 h-full">
                            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Edit3 className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Fill Manually</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Enter your information yourself from scratch using our step-by-step wizard.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
