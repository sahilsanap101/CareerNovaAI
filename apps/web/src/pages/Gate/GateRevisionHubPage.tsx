import { Suspense } from 'react';
import { GateRevisionHub } from '@/features/gate/GateRevisionHub';

export default function GateRevisionHubPage() {
    return (
        <div className="container mx-auto py-8 mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
            <Suspense fallback={
                <div className="flex h-[200px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            }>
                <GateRevisionHub />
            </Suspense>
        </div>
    );
}
