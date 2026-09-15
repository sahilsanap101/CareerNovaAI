import { GatePlanner } from '@/features/gate/GatePlanner';
import { Calendar } from 'lucide-react';

export default function GatePlannerPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg">
                    <Calendar className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Study Planner
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Organize your week with scheduled personal study tasks and track your overall prep target.
                    </p>
                </div>
            </div>
            <GatePlanner />
        </div>
    );
}
