import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, AlertCircle, Loader2, Library, History } from 'lucide-react';
import { careerRecommendationApi, CareerRecommendationResponse } from '@/api/careerRecommendation.api';
import { CareerTopSection } from './components/CareerTopSection';
import { CareerRankingBoard } from './components/CareerRankingBoard';
import { CareerHistoryModal } from './components/CareerHistoryModal';

export function CareerRecommendationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CareerRecommendationResponse | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await careerRecommendationApi.getRecommendations();
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRestoreHistory = (snapshotData: CareerRecommendationResponse) => {
    setData(snapshotData);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Analyzing your profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Analysis Failed</h2>
          <p className="text-red-600/80 dark:text-red-400/80 mb-6">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isProfileIncomplete = data && data.profileCompleteness < 30;
  const isHistoricalView = (data as any)?.isHistorical;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Historical Banner */}
      {isHistoricalView && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-primary-700 dark:text-primary-300 font-medium">
            <History className="w-5 h-5" />
            Viewing historical recommendation snapshot from {new Date(data!.generatedAt).toLocaleDateString()}
          </div>
          <button 
            onClick={fetchRecommendations}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Return to Current
          </button>
        </div>
      )}

      {!isHistoricalView && (
        <div className="flex justify-end mb-[-1rem] relative z-10">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <History className="w-4 h-4" />
            View History
          </button>
        </div>
      )}

      <CareerTopSection
        generatedAt={data?.generatedAt}
        completeness={data?.profileCompleteness || 0}
        strategyMessage={data?.strategyMessage}
        onRefresh={fetchRecommendations}
        isRefreshing={loading}
      />

      {isProfileIncomplete && !isHistoricalView && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start sm:items-center gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1 sm:mt-0" />
          <div className="flex-1">
            <h3 className="text-amber-800 dark:text-amber-400 font-medium">Incomplete Profile Detected</h3>
            <p className="text-amber-700/80 dark:text-amber-400/80 text-sm mt-1">
              Your profile is only {data?.profileCompleteness}% complete. For better and more accurate recommendations, please complete your skills, projects, and academic sections.
            </p>
          </div>
          <Link
            to="/profile"
            className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Update Profile
          </Link>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        <CareerRankingBoard recommendations={data?.recommendations || []} />
      </div>

      {/* Explore Link */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center mt-12">
        <Library className="w-8 h-8 text-primary-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Want to see all options?</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          Browse the full official knowledge base of software and IT careers to see what skills are required for different paths.
        </p>
        <button
          onClick={() => navigate('/career-catalog')}
          className="inline-flex items-center justify-center px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
        >
          Explore Career Catalog
        </button>
      </div>

      <CareerHistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onRestore={handleRestoreHistory} 
      />
    </div>
  );
}
