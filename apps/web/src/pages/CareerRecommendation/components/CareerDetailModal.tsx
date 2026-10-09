import { Fragment } from 'react';
import { X, Briefcase, ChevronRight, GraduationCap, Code, Cpu, Target, Star, BrainCircuit, Map } from 'lucide-react';
import { CareerRecommendation } from '@/api/careerRecommendation.api';
import { useNavigate } from 'react-router-dom';
import { useCareerStore } from '@/store/career.store';

interface CareerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  career: CareerRecommendation | null;
}

export function CareerDetailModal({ isOpen, onClose, career }: CareerDetailModalProps) {
  const navigate = useNavigate();

  if (!isOpen || !career) return null;

  const { careerName, domain, combinedScore, profileScore, assessmentScore, matchedProfileEvidence, matchedAssessmentEvidence, matchedSkills, missingSkills, explanation } = career;

  // Render a score bar
  const ScoreBar = ({ label, score, icon: Icon }: { label: string; score: number; icon: any }) => (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          {label}
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(score)}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-500 rounded-full transition-all duration-1000" 
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }} 
        />
      </div>
    </div>
  );

  return (
    <Fragment>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 text-sm font-medium mb-1">
              <Briefcase className="w-4 h-4" />
              {domain}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {careerName}
            </h2>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded-lg text-sm font-semibold">
              Match Score: {Math.round(combinedScore || 0)}/100
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Analysis Snippet / Evidence */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary-500" />
              Why this matches you
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-800">
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{explanation}</p>

              {matchedProfileEvidence && matchedProfileEvidence.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-2">Profile Evidence</span>
                  {matchedProfileEvidence.map((m, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <ChevronRight className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{m}</span>
                    </div>
                  ))}
                </div>
              )}

              {matchedAssessmentEvidence && matchedAssessmentEvidence.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-2">Assessment Evidence</span>
                  {matchedAssessmentEvidence.map((int, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <ChevronRight className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{int}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </section>

          {/* Breakdown Bars */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              Detailed Score Breakdown
            </h3>
            <div className="space-y-2">
              <ScoreBar label="Profile Match" score={profileScore || 0} icon={Code} />
              <ScoreBar label="Assessment Alignment" score={assessmentScore || 0} icon={BrainCircuit} />
            </div>
          </section>

          {/* Skill Gaps */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              Skills to Develop
            </h3>
            {missingSkills && missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missingSkills.map(gap => (
                  <span key={gap} className="px-3 py-1.5 border rounded-lg text-sm font-medium bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
                    {gap}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                You meet all the core technical requirements for this role!
              </p>
            )}
          </section>
        </div>
        
        {/* Footer */}
         <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
           <button 
             onClick={() => {
               useCareerStore.getState().setSelectedCareer({
                 careerId: career.careerId,
                 careerName: career.careerName,
                 domain: career.domain,
                 selectedAt: new Date().toISOString()
               });
               onClose();
               navigate(`/roadmap/${encodeURIComponent(career.careerId)}`);
             }}
             className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
           >
              <Map className="w-5 h-5" />
              Select & Generate Roadmap
           </button>
           <button onClick={onClose} className="w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              Close
           </button>
        </div>
      </div>
    </Fragment>
  );
}
