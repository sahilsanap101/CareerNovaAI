import { useMemo } from 'react';
import { CareerRecommendation } from '@/api/careerRecommendation.api';
import { Briefcase, CheckCircle2, Minus, Target } from 'lucide-react';

interface CareerComparisonViewProps {
  careers: CareerRecommendation[];
}

export function CareerComparisonView({ careers }: CareerComparisonViewProps) {
  // Extract a master list of all skills mentioned in matches and gaps across all selected careers
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    
    careers.forEach(career => {
      career.matchedSkills?.forEach(s => skillsSet.add(s));
      career.missingSkills?.forEach(s => skillsSet.add(s));
    });

    return Array.from(skillsSet).sort((a, b) => a.localeCompare(b));
  }, [careers]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="w-1/4 min-w-[200px] p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-r border-slate-200 dark:border-slate-800 align-bottom">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Comparison Matrix</div>
                <div className="text-xs text-slate-400 font-normal">Side-by-side analysis of your top career matches.</div>
              </th>
              {careers.map(career => (
                <th key={career.careerId} className="w-1/4 min-w-[250px] p-6 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-800 last:border-r-0 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg mb-4">
                    <Briefcase className="w-3.5 h-3.5" />
                    {career.domain}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                    {career.careerName}
                  </h3>
                  <div className="inline-flex items-center justify-center px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-xl text-sm font-bold border border-primary-100 dark:border-primary-800/50">
                    Match Score: {Math.round(career.combinedScore || 0)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            
            {/* Breakdowns */}
            <tr className="bg-slate-50/50 dark:bg-slate-800/20">
              <td className="p-4 px-6 font-bold text-slate-900 dark:text-white border-r border-b border-slate-200 dark:border-slate-800">
                Component Scores
              </td>
              {careers.map(career => (
                <td key={career.careerId} className="p-4 px-6 border-r border-b border-slate-200 dark:border-slate-800 last:border-r-0 align-top">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Profile Match</span><span className="font-bold text-slate-700 dark:text-slate-300">{Math.round(career.profileScore || 0)}%</span></div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${career.profileScore || 0}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Assessment Match</span><span className="font-bold text-slate-700 dark:text-slate-300">{Math.round(career.assessmentScore || 0)}%</span></div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${career.assessmentScore || 0}%` }} /></div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* Skill Matrix */}
            <tr>
              <td colSpan={careers.length + 1} className="p-4 px-6 font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                Technical Skill Alignment
              </td>
            </tr>
            {allSkills.map((skillName) => (
              <tr key={skillName} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 px-6 border-r border-b border-slate-200 dark:border-slate-800">
                  <div className="font-medium text-slate-900 dark:text-white">{skillName}</div>
                </td>
                {careers.map(career => {
                  const match = career.matchedSkills?.includes(skillName);
                  const gap = career.missingSkills?.includes(skillName);
                  
                  if (match) {
                    return (
                      <td key={career.careerId} className="p-4 px-6 border-r border-b border-slate-200 dark:border-slate-800 last:border-r-0 text-center bg-green-50/50 dark:bg-green-900/10">
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">Match</span>
                        </div>
                      </td>
                    );
                  } else if (gap) {
                    return (
                      <td key={career.careerId} className="p-4 px-6 border-r border-b border-slate-200 dark:border-slate-800 last:border-r-0 text-center bg-red-50/30 dark:bg-red-900/10">
                        <div className="flex flex-col items-center gap-1">
                          <Target className="w-5 h-5 text-red-500" />
                          <span className="text-xs font-medium text-red-700 dark:text-red-400">
                            Gap
                          </span>
                        </div>
                      </td>
                    );
                  } else {
                    return (
                      <td key={career.careerId} className="p-4 px-6 border-r border-b border-slate-200 dark:border-slate-800 last:border-r-0 text-center text-slate-300 dark:text-slate-700">
                        <Minus className="w-5 h-5 mx-auto" />
                      </td>
                    );
                  }
                })}
              </tr>
            ))}

            {/* Summary Row */}
            <tr>
              <td colSpan={careers.length + 1} className="p-4 px-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 italic">
                  Note: The recommendation engine calculates these scores purely on your profile alignment against our standardized career requirements catalog.
                </p>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}
