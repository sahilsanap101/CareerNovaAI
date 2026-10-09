import { CareerRecommendation, careerRecommendationApi } from '@/api/careerRecommendation.api';
import { ChevronRight, CheckCircle2, AlertTriangle, Briefcase, Award, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useCareerStore } from '@/store/career.store';
import { useNavigate } from 'react-router-dom';

interface CareerCardProps {
  recommendation: CareerRecommendation;
  isTopRank?: boolean;
  onViewDetails: (r: CareerRecommendation) => void;
  isComparing?: boolean;
  onToggleCompare?: (r: CareerRecommendation) => void;
  canCompare?: boolean;
}

export function CareerCard({ recommendation, isTopRank = false, onViewDetails, isComparing = false, onToggleCompare, canCompare = true }: CareerCardProps) {
  const { rank, careerId, careerName, domain, combinedScore, matchedSkills, missingSkills } = recommendation;
  const navigate = useNavigate();
  const { selectedCareer, setSelectedCareer } = useCareerStore();
  const isSelected = selectedCareer?.careerId === careerId;
  
  // Format score exactly as requested
  const scoreText = `Match Score: ${Math.round(combinedScore || 0)}/100`;

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(false);

  const handleSelectAndGenerate = async () => {
    if (isGenerating || isSelected) return;
    
    setIsGenerating(true);
    setGenerationError(false);
    
    try {
      await careerRecommendationApi.getRoadmap(careerId);
      
      setSelectedCareer({
        careerId,
        careerName,
        domain,
        selectedAt: new Date().toISOString()
      });
      navigate(`/roadmap/${encodeURIComponent(careerId)}`);
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      setGenerationError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 border ${
      isSelected 
        ? 'border-primary-500 shadow-md shadow-primary-500/20 ring-2 ring-primary-500/20'
        : isTopRank 
            ? rank === 1 
                ? 'border-yellow-400 dark:border-yellow-500/50 shadow-md shadow-yellow-500/5' 
                : 'border-primary-500/50 shadow-sm shadow-primary-500/5'
            : 'border-slate-200 dark:border-slate-800'
    } rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg dark:hover:shadow-none hover:-translate-y-1`}>
      
      {/* Header */}
      <div>
          <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg ${
                rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-500' :
                rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300' :
                rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400' :
                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                #{rank}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 truncate" title={domain}>
                <Briefcase className="w-3 h-3 shrink-0" />
                <span className="truncate">{domain}</span>
              </span>
            </div>
            
            {onToggleCompare && (
              <label className="flex items-center gap-2 cursor-pointer group shrink-0">
                <span className="text-xs font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                  {isComparing ? 'Comparing' : 'Compare'}
                </span>
                <input 
                  type="checkbox"
                  checked={isComparing}
                  disabled={!isComparing && !canCompare}
                  onChange={() => onToggleCompare(recommendation)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50 cursor-pointer"
                />
              </label>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate" title={careerName}>
            {careerName} {isSelected && <span className="ml-2 text-sm text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded flex-inline items-center gap-1"><CheckCircle2 className="w-4 h-4 inline" /> Selected</span>}
          </h3>
          
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="flex-1 min-w-[120px] max-w-[150px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${(combinedScore || 0) >= 75 ? 'bg-green-500' : (combinedScore || 0) >= 50 ? 'bg-amber-500' : 'bg-slate-400'}`}
                style={{ width: `${Math.min(100, Math.max(0, combinedScore || 0))}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              {scoreText}
            </span>
          </div>
      </div>

      {/* Analysis Snippet */}
      <div className="mt-6 mb-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        
        {/* Strengths */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Top Skills
          </h4>
          <ul className="space-y-2">
            {matchedSkills && matchedSkills.length > 0 ? (
              matchedSkills.map((match, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{match}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500 dark:text-slate-500 italic">No direct technical skills found.</li>
            )}
          </ul>
        </div>

        {/* Gaps */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Skills to Develop
          </h4>
          <ul className="space-y-2">
            {missingSkills && missingSkills.length > 0 ? (
              missingSkills.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{gap}</span>
                </li>
              ))
            ) : (
              <li className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Award className="w-4 h-4 shrink-0" />
                <span>You meet the core requirements!</span>
              </li>
            )}
          </ul>
        </div>

      </div>

      {/* Action */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => onViewDetails(recommendation)}
          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
        >
          View Details
        </button>
        <button
          onClick={handleSelectAndGenerate}
          disabled={isSelected || isGenerating}
          className={`flex-[2] flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-[13px] sm:text-sm font-medium transition-colors ${
            isSelected 
              ? 'bg-primary-100 text-primary-700 cursor-default dark:bg-primary-900/30 dark:text-primary-400' 
              : isGenerating
              ? 'bg-primary-400 text-white cursor-wait'
              : generationError
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20'
              : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20'
          }`}
        >
          {isSelected ? 'Roadmap Generated ✓' : isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : generationError ? 'Retry Generate Roadmap' : 'Select & Generate Roadmap'}
          {!isSelected && !isGenerating && !generationError && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
