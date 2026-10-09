import { useState } from 'react';
import { CareerRecommendation } from '@/api/careerRecommendation.api';
import { CareerCard } from './CareerCard';
import { CareerDetailModal } from './CareerDetailModal';
import { Trophy, LayoutGrid, X } from 'lucide-react';
import { CareerComparisonView } from './CareerComparisonView';

interface CareerRankingBoardProps {
  recommendations: CareerRecommendation[];
}

export function CareerRankingBoard({ recommendations }: CareerRankingBoardProps) {
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);
  const [compareList, setCompareList] = useState<CareerRecommendation[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        No recommendations generated yet. Click "Generate Matches" above.
      </div>
    );
  }

  const handleToggleCompare = (rec: CareerRecommendation) => {
    setCompareList(prev => {
      const exists = prev.find(r => r.careerId === rec.careerId);
      if (exists) {
        return prev.filter(r => r.careerId !== rec.careerId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, rec];
    });
  };

  if (isComparing) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary-500" />
            Comparing {compareList.length} Careers
          </h2>
          <button 
            onClick={() => setIsComparing(false)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Back to Rankings
          </button>
        </div>
        <CareerComparisonView careers={compareList} />
      </div>
    );
  }

  const top3 = recommendations.slice(0, 3);
  const remainingTop5 = recommendations.slice(3, 5);

  return (
    <div className="space-y-8 pb-12 relative">
      
      {/* Sticky Action Bar */}
      {compareList.length > 0 && (
        <div className="sticky top-20 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-primary-200 dark:border-primary-900/50 shadow-lg shadow-primary-500/10 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-300 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full text-primary-600 dark:text-primary-400 font-bold">
              {compareList.length}/3
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Selected for Comparison</p>
              <p className="text-xs text-slate-500">{compareList.map(c => c.careerName).join(', ')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCompareList([])}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsComparing(true)}
              disabled={compareList.length < 2}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Top 3 Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Top Matches</h2>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {top3.map((rec) => (
            <CareerCard 
              key={rec.careerId} 
              recommendation={rec} 
              isTopRank={true}
              onViewDetails={setSelectedCareer}
              isComparing={!!compareList.find(c => c.careerId === rec.careerId)}
              onToggleCompare={handleToggleCompare}
              canCompare={compareList.length < 3}
            />
          ))}
        </div>
      </section>

      {/* Ranks 4-5 Section */}
      {remainingTop5.length > 0 && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Also Recommended</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {remainingTop5.map((rec) => (
              <CareerCard 
                key={rec.careerId} 
                recommendation={rec}
                onViewDetails={setSelectedCareer}
                isComparing={!!compareList.find(c => c.careerId === rec.careerId)}
                onToggleCompare={handleToggleCompare}
                canCompare={compareList.length < 3}
              />
            ))}
          </div>
        </section>
      )}

      <CareerDetailModal 
        isOpen={!!selectedCareer} 
        onClose={() => setSelectedCareer(null)} 
        career={selectedCareer} 
      />
    </div>
  );
}
