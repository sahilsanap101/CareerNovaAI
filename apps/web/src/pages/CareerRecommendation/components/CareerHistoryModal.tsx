import { useState, useEffect } from 'react';
import { careerRecommendationApi, HistoryTimelineItem, RecommendationSnapshot, CareerRecommendationResponse } from '@/api/careerRecommendation.api';
import { X, History, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CareerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (snapshot: CareerRecommendationResponse) => void;
}

export function CareerHistoryModal({ isOpen, onClose, onRestore }: CareerHistoryModalProps) {
  const [history, setHistory] = useState<HistoryTimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await careerRecommendationApi.getHistory();
      setHistory(data);
    } catch (err: any) {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setLoadingId(id);
      const snapshot: RecommendationSnapshot = await careerRecommendationApi.getSnapshot(id);
      
      // Map it to the standard response shape the page expects
      const responseShape: CareerRecommendationResponse = {
        recommendations: snapshot.recommendations,
        generatedAt: snapshot.createdAt,
        profileCompleteness: 100, // Historical completeness is not strictly saved, default to 100 or mock
        isHistorical: true, // Custom flag we can use in the UI
      } as any;
      
      onRestore(responseShape);
      onClose();
    } catch (err: any) {
      setError('Failed to load that snapshot.');
    } finally {
      setLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
            <History className="w-5 h-5 text-primary-500" />
            Recommendation History
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[70vh]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p>No history available yet.</p>
              <p className="text-sm">We'll save a snapshot whenever your profile or top recommendations change.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary-500/50 transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 text-xs font-bold rounded-md">Latest</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Top Match: <span className="font-medium text-slate-700 dark:text-slate-300">{item.topCareerName} ({item.topCareerScore}/100)</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRestore(item.id)}
                    disabled={loadingId !== null}
                    className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors px-3 py-1.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20"
                  >
                    {loadingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        View <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
