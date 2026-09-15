import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { authApi } from '@/api/auth.api'; // Just using custom fetch wrapper

export function FeedbackSurvey({ recommendationId, onSubmitted }: { recommendationId: string, onSubmitted?: () => void }) {
    const [relevanceScore, setRelevanceScore] = useState<number>(0);
    const [roadmapClarityScore, setRoadmapClarityScore] = useState<number>(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const handleSubmit = async () => {
        if (relevanceScore === 0 || roadmapClarityScore === 0) {
            toast.error('Please provide ratings for both relevance and clarity before submitting.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Direct raw fetch for simplicity, usually would follow Axios/React-Query pattern in a real codebase
            const token = localStorage.getItem('accessToken') || '';
            const response = await fetch('/api/recommendations/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recommendationId,
                    relevanceScore,
                    roadmapClarityScore,
                    freeTextComment: comment
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit');
            }

            toast.success('Validation metrics submitted successfully!');
            if (onSubmitted) onSubmitted();
        } catch (e) {
            toast.error('Error submitting feedback metric mapping.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (currentVal: number, setVal: (v: number) => void) => (
        <div className="flex gap-1.5 items-center">
            {[1, 2, 3, 4, 5].map(v => (
                <button
                    key={v}
                    onClick={() => setVal(v)}
                    className={`h-7 w-7 rounded-sm flex items-center justify-center font-bold font-mono transition-colors border ${currentVal >= v
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                >
                    {v}
                </button>
            ))}
        </div>
    );

    return (
        <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 mt-6 shadow-inner space-y-4">
            <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Empirical Validation</h4>
                <p className="text-xs text-slate-500 mb-3">Does this recommendation practically align with your actual abilities and goals?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Relevance Score</span>
                    {renderStars(relevanceScore, setRelevanceScore)}
                </div>
                <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Clarity & Accuracy</span>
                    {renderStars(roadmapClarityScore, setRoadmapClarityScore)}
                </div>
            </div>

            <div>
                <textarea
                    placeholder="Optional: Why was this inaccurate or misaligned?..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                />
            </div>

            <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Submit Ground Truth Rating
            </Button>
        </div>
    );
}
