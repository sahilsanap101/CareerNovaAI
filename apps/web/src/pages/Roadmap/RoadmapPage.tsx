import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Map as MapIcon, CheckCircle2, Circle, Clock, Target,
  BrainCircuit, Code, BookOpen, Code2, Wrench, Loader2,
  ChevronDown, ChevronUp, ExternalLink, PlayCircle, FileText, Briefcase, Rocket,
  Lock, Unlock, Check, BarChart2, Info, RefreshCw, AlertCircle, Sparkles, User, Calendar
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { useCareerStore } from '@/store/career.store';
import { careerRecommendationApi } from '@/api/careerRecommendation.api';

const getProficiencyLabel = (level: number) => {
  switch(level) {
    case 1: return "Beginner";
    case 2: return "Basic";
    case 3: return "Intermediate";
    case 4: return "Advanced";
    case 5: return "Expert";
    default: return "";
  }
};

export function RoadmapPage() {
  const { careerId: paramCareerId } = useParams<{ careerId: string }>();
  const [searchParams] = useSearchParams();
  const queryCareerId = searchParams.get('career');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { studentData } = useStudentProfile();
  const { selectedCareer, setSelectedCareer } = useCareerStore();
  
  const activeCareerId = paramCareerId || queryCareerId || selectedCareer?.careerId;
  
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState<any>(null);
  const [studentProgress, setStudentProgress] = useState<Record<string, { status: string, progress: number }>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [showRecalculateBanner, setShowRecalculateBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCareerId) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const fetchRoadmap = async () => {
      setLoading(true);
      setError(null);
      try {
        const roadmapData = await careerRecommendationApi.getRoadmap(activeCareerId);
        if (isMounted) {
          setData(roadmapData);
          
          // Ensure global selectedCareer stays in sync if accessed directly via URL
          if (roadmapData.targetCareer && activeCareerId !== selectedCareer?.careerId) {
            setSelectedCareer({
              careerId: activeCareerId,
              careerName: roadmapData.targetCareer,
              domain: 'Technology',
              selectedAt: new Date().toISOString()
            });
          }

          if (roadmapData.roadmapStages?.[0]?.nodes?.[0]) {
            setExpandedNodes({ [roadmapData.roadmapStages[0].nodes[0].skillId]: true });
          }
          
          try {
            const saved = localStorage.getItem('mockActiveRoadmaps');
            let activeRoadmaps = saved ? JSON.parse(saved) : [
              {
                careerId: 'ai-engineer',
                career: 'AI Engineer',
                version: 'v1.2',
                progress: 42,
                currentStage: 'Stage 2: Advanced Specialization',
                lastActivity: '2 hours ago',
                estimatedHoursRemaining: 60,
                thumbnailClass: 'bg-primary-500'
              },
              {
                careerId: 'full-stack-developer',
                career: 'Full Stack Developer',
                version: 'v2.0',
                progress: 15,
                currentStage: 'Stage 1: React Fundamentals',
                lastActivity: '3 days ago',
                estimatedHoursRemaining: 150,
                thumbnailClass: 'bg-blue-500'
              }
            ];

            const exists = activeRoadmaps.find((r: any) => r.careerId === activeCareerId);
            if (!exists) {
              activeRoadmaps.unshift({
                careerId: activeCareerId,
                career: roadmapData.career || roadmapData.targetCareer || selectedCareer?.careerName || 'Unknown Career',
                version: 'v1.0',
                progress: 0,
                currentStage: roadmapData.roadmapStages?.[0]?.title || 'Stage 1',
                lastActivity: 'Just now',
                estimatedHoursRemaining: 120,
                thumbnailClass: 'bg-violet-500'
              });
              localStorage.setItem('mockActiveRoadmaps', JSON.stringify(activeRoadmaps));
            }
          } catch(e) {
            console.error(e);
          }
          
          const progress: Record<string, { status: string, progress: number }> = {};
          roadmapData.roadmapStages.forEach((stage: any) => {
            stage.nodes.forEach((node: any) => {
              if (node.status === 'SKIPPED_BY_EXISTING_KNOWLEDGE') {
                 progress[node.skillId] = { status: 'COMPLETED', progress: 100 };
              }
            });
          });
          setStudentProgress(progress);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load personalized roadmap.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchRoadmap();
    
    return () => { isMounted = false; };
  }, [activeCareerId, studentData]);

  const toggleNode = (skillId: string) => setExpandedNodes(prev => ({ ...prev, [skillId]: !prev[skillId] }));

  const markCompleted = (skillId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentProgress(prev => ({ ...prev, [skillId]: { status: "COMPLETED", progress: 100 } }));
  };

  const startLearning = (skillId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentProgress(prev => ({ ...prev, [skillId]: { status: "IN_PROGRESS", progress: 10 } }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{error}</h2>
        <button onClick={() => navigate(-1)} className="px-4 py-2 mt-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Back to Career Recommendations
        </button>
      </div>
    );
  }

  if (!activeCareerId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <MapIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No career selected</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Select a career from Career Recommendations to generate your personalized learning roadmap.
        </p>
        <Link to="/career-recommendation" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors">
          Explore Careers
        </Link>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Generating Personalized Roadmap...</h2>
      </div>
    );
  }

  const isSkillCompleted = (skillId: string) => {
    return data.currentStrengths.some((s: any) => s.skillId === skillId) || studentProgress[skillId]?.status === "COMPLETED";
  };

  const checkIsLocked = (node: any) => {
    if (node.status === 'SKIPPED_BY_EXISTING_KNOWLEDGE') return false; 
    if (!node.prerequisites || node.prerequisites.length === 0) return false;
    return node.prerequisites.some((req: any) => !isSkillCompleted(req.skillId));
  };

  let totalNodes = 0; let completedNodes = 0; let inProgressNodes = 0;
  data.roadmapStages.forEach((stage: any) => {
    stage.nodes.forEach((node: any) => {
      totalNodes++;
      if (studentProgress[node.skillId]?.status === "COMPLETED" || node.status === 'SKIPPED_BY_EXISTING_KNOWLEDGE') completedNodes++;
      if (studentProgress[node.skillId]?.status === "IN_PROGRESS") inProgressNodes++;
    });
  });
  const overallProgress = Math.round((completedNodes / totalNodes) * 100) || 0;
  const currentReadiness = data.readiness + Math.round((overallProgress / 100) * 20);

  // Calculate "Your Next Step"
  let nextActionNode = null;
  for (const stage of data.roadmapStages) {
    for (const node of stage.nodes) {
      const isLocked = checkIsLocked(node);
      const isSkipped = node.status === 'SKIPPED_BY_EXISTING_KNOWLEDGE';
      const status = isSkipped ? 'MASTERED' : (studentProgress[node.skillId]?.status || (isLocked ? 'LOCKED' : 'NOT_STARTED'));
      if ((status === 'NOT_STARTED' || status === 'IN_PROGRESS') && !isLocked) {
        nextActionNode = node;
        break;
      }
    }
    if (nextActionNode) break;
  }

  const ResourceCard = ({ type, data, icon: Icon, colorClass, linkText }: any) => {
    if (!data || data.fallback) return null;
    const isVerified = data.validationStatus === 'VERIFIED';
    let displayType = type;
    if (!isVerified) displayType = displayType.replace(/Official/gi, '').trim();

    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${colorClass} uppercase`}><Icon className="w-4 h-4" /> {displayType}</div>
            {isVerified ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded text-[10px] font-bold uppercase tracking-wide border border-green-200 dark:border-green-500/20"><CheckCircle2 className="w-3 h-3" /> Verified Resource</div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700"><AlertCircle className="w-3 h-3" /> Verification Pending</div>
            )}
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{data.title}</div>
          {data.provider && <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2">{data.provider}</div>}
        </div>
        {data.url && (
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
            <a href={data.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-sm font-bold ${colorClass} hover:opacity-80 transition-opacity`}>{linkText} <ExternalLink className="w-3.5 h-3.5" /></a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 relative">
      
      {showRecalculateBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-full duration-300">
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-center gap-2 font-medium shadow-md">
            <RefreshCw className="w-5 h-5 animate-spin-slow" /> Your roadmap has been updated because your profile changed.
          </div>
        </div>
      )}

      {/* ==================================================
          HEADER 
          ================================================== */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-8 pb-8 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-sm uppercase tracking-wider rounded-lg mb-4 border border-primary-100 dark:border-primary-500/20">
                <MapIcon className="w-4 h-4" /> Personalized Roadmap
              </div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Target Career</div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">{data.career}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md">
                  <User className="w-4 h-4 text-slate-400" /> For: <span className="font-bold text-slate-900 dark:text-white">{data.studentName}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md">
                  <Calendar className="w-4 h-4 text-slate-400" /> Current Year: <span className="font-bold text-slate-900 dark:text-white">{data.currentYear}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 min-w-[300px]">
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Readiness
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-1">
                  {currentReadiness}<span className="text-lg text-slate-400 font-medium">/100</span>
                </div>
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> Overall Progress
                </div>
                <div className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 flex items-baseline gap-1">
                  {overallProgress}<span className="text-lg text-primary-400/70 font-medium">%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-3">
                  <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12 space-y-16">
        
        {/* ==================================================
            SECTION 1: CAREER TARGET 
            ================================================== */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <Briefcase className="w-6 h-6 text-primary-500" /> Career Target
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm md:col-span-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">What this role involves</h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{data.careerTarget.roleInvolves}</p>
             </div>
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.careerTarget.keySkills.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded">{s}</span>
                  ))}
                </div>
             </div>
             <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-6 rounded-2xl shadow-sm md:col-span-3">
                <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-2">Entry-level Expectations</h3>
                <p className="text-blue-900 dark:text-blue-200 font-medium leading-relaxed">{data.careerTarget.entryLevelExpectations}</p>
             </div>
          </div>
        </section>

        {/* ==================================================
            SECTION 2: YOUR CURRENT POSITION 
            ================================================== */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <Target className="w-6 h-6 text-primary-500" /> Your Current Position
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Strong Skills</h3>
              <ul className="space-y-3">
                {data.currentStrengths.map((s: any) => (
                  <li key={s.skillId} className="flex justify-between items-center text-sm font-semibold"><span className="text-slate-700 dark:text-slate-300">{s.name}</span> <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded text-xs">{getProficiencyLabel(s.level)} ({s.level}/5)</span></li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Partial Skills</h3>
              <ul className="space-y-3">
                {data.partialSkills.map((s: any) => (
                  <li key={s.skillId} className="flex justify-between items-center text-sm font-semibold"><span className="text-slate-700 dark:text-slate-300">{s.name}</span> <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded text-xs">{getProficiencyLabel(s.level)} ({s.level}/5)</span></li>
                ))}
                {data.partialSkills.length === 0 && <li className="text-sm text-slate-500 italic">None identified.</li>}
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Circle className="w-4 h-4 text-red-500" /> Skill Gaps</h3>
              <ul className="space-y-3">
                {data.skillGaps.map((s: any) => (
                  <li key={s.skillId} className="flex justify-between items-center text-sm font-semibold"><span className="text-slate-700 dark:text-slate-300">{s.name}</span> <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded text-xs">Target: {getProficiencyLabel(s.target)}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ==================================================
            SECTION 3: LEARNING ROADMAP 
            ================================================== */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <MapIcon className="w-6 h-6 text-primary-500" /> Learning Roadmap
          </h2>
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-6 space-y-12 pb-8">
            {data.roadmapStages.map((stage: any, sIdx: number) => (
              <div key={sIdx} className="relative pl-8 md:pl-10">
                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-sm ${sIdx === 0 ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{stage.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{stage.focus}</p>

                <div className="space-y-4">
                  {stage.nodes.map((node: any) => {
                    const isExpanded = !!expandedNodes[node.skillId];
                    const isLocked = checkIsLocked(node);
                    const isSkipped = node.status === 'SKIPPED_BY_EXISTING_KNOWLEDGE';
                    const status = isSkipped ? 'MASTERED' : (studentProgress[node.skillId]?.status || (isLocked ? 'LOCKED' : 'NOT_STARTED'));

                    return (
                      <div key={node.skillId} className={`bg-white dark:bg-slate-900 rounded-2xl border ${isLocked ? 'border-slate-200 dark:border-slate-800/50 opacity-75' : isSkipped ? 'border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-700'} overflow-hidden shadow-sm transition-all duration-300`}>
                        <div className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors ${isLocked ? 'hover:bg-transparent' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`} onClick={() => !isLocked && toggleNode(node.skillId)}>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              {isLocked ? <Lock className="w-5 h-5 text-slate-400" /> : status === 'COMPLETED' || status === 'MASTERED' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : status === 'IN_PROGRESS' ? <Clock className="w-5 h-5 text-amber-500" /> : <Unlock className="w-5 h-5 text-slate-400" />}
                              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{node.skillName}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20' : 
                                status === 'MASTERED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' : 
                                status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' : 
                                isLocked ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20'
                              }`}>{isSkipped ? 'SKIPPED BY EXISTING KNOWLEDGE' : status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 ml-8">
                              <span className={isSkipped ? "text-blue-600 dark:text-blue-400 font-medium" : ""}>{node.whyNeeded}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 ml-8 md:ml-0">
                            {status === 'NOT_STARTED' && !isLocked && !isSkipped && (
                              <button onClick={(e) => startLearning(node.skillId, e)} className="px-4 py-1.5 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-semibold text-sm rounded-lg hover:bg-primary-100 transition-colors">Start Module</button>
                            )}
                            {status === 'IN_PROGRESS' && !isSkipped && (
                              <button onClick={(e) => markCompleted(node.skillId, e)} className="px-4 py-1.5 bg-green-500 text-white font-semibold text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5"><Check className="w-4 h-4" /> Mark Complete</button>
                            )}
                            {!isLocked && <div className="text-slate-400 p-2 ml-2">{isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</div>}
                          </div>
                        </div>
                        
                        {isExpanded && !isLocked && (
                          <div className="border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                             {isSkipped ? (
                               <div className="p-5 text-slate-500 italic text-sm bg-slate-50 dark:bg-slate-900/50">This module's resources are hidden because you already verified mastery in this skill.</div>
                             ) : (
                               <div className="p-5 bg-slate-50 dark:bg-slate-900/50">
                                 {/* SECTION 4 is embedded here per node as it makes the most sense logically */}
                                 <div className="flex items-center justify-between mb-4">
                                   <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><BookOpen className="w-4 h-4" /> Recommended Resources</h5>
                                   <span className="text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Estimated Effort: {node.estimatedEffort}</span>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                   <ResourceCard type="Course" data={node.resources.learn} icon={BrainCircuit} colorClass="text-primary-600 dark:text-primary-400" linkText="Open Course" />
                                   <ResourceCard type="Official Documentation" data={node.resources.documentation} icon={FileText} colorClass="text-slate-600 dark:text-slate-400" linkText="Open Docs" />
                                   <ResourceCard type="Playlist" data={node.resources.watch} icon={PlayCircle} colorClass="text-red-600 dark:text-red-400" linkText="Watch Playlist" />
                                 </div>
                               </div>
                             )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            SECTION 5: PROJECTS 
            ================================================== */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <Wrench className="w-6 h-6 text-primary-500" /> Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.recommendedProjects.map((proj: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded mb-3">
                  {proj.type}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{proj.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{proj.description}</p>
                <div className="flex flex-wrap gap-2">
                  {proj.skills.map((s: string) => <span key={s} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            SECTION 6: PLACEMENT PREPARATION 
            ================================================== */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <Rocket className="w-6 h-6 text-primary-500" /> Placement Preparation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.placementPrep.map((prep: any, idx: number) => (
              <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{prep.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{prep.description}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ==================================================
          SECTION 7: YOUR NEXT STEP (STICKY FOOTER / CTA)
          ================================================== */}
      {nextActionNode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-40 animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-0.5">Your Next Step</h3>
                <p className="text-slate-900 dark:text-white font-semibold">
                  Complete {nextActionNode.skillName} — approximately {nextActionNode.estimatedEffort}.
                </p>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                if (studentProgress[nextActionNode.skillId]?.status === 'IN_PROGRESS') markCompleted(nextActionNode.skillId, e);
                else startLearning(nextActionNode.skillId, e);
                
                // Scroll to node logic could go here
                document.getElementById(nextActionNode.skillId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                toggleNode(nextActionNode.skillId);
              }}
              className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5"
            >
              {studentProgress[nextActionNode.skillId]?.status === 'IN_PROGRESS' ? 'MARK COMPLETED' : 'START LEARNING'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
