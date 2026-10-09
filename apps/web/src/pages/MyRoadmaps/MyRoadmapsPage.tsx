import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Map, Clock, ArrowRight, Play, CheckCircle2, MoreVertical, Plus, Trash2 } from 'lucide-react';

const MOCK_ROADMAPS = [
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
import { careerRecommendationApi } from '@/api/careerRecommendation.api';

export function MyRoadmapsPage() {
  const navigate = useNavigate();

  const [activeRoadmaps, setActiveRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRoadmaps = async () => {
      try {
        const data = await careerRecommendationApi.getUserRoadmaps();
        if (isMounted) {
          const mapped = data.map((r: any) => ({
            careerId: r.careerId,
            career: r.careerName,
            version: 'v1.0',
            progress: r.progress,
            currentStage: r.currentStage || 'Stage 1',
            lastActivity: new Date(r.updatedAt).toLocaleDateString(),
            estimatedHoursRemaining: 120, // dummy
            thumbnailClass: 'bg-primary-500' // dummy
          }));
          setActiveRoadmaps(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRoadmaps();
    return () => { isMounted = false; };
  }, []);

  const handleDelete = (careerId: string) => {
    const updated = activeRoadmaps.filter((r: any) => r.careerId !== careerId);
    setActiveRoadmaps(updated);
    localStorage.setItem('mockActiveRoadmaps', JSON.stringify(updated));
    setOpenMenuId(null);
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-10 pb-6 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Map className="w-8 h-8 text-primary-500" />
              My Learning Roadmaps
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Track and manage multiple career trajectories simultaneously without losing your progress.
            </p>
          </div>
          
          <Link 
            to="/career-recommendation" 
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Career Track
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
             <div className="text-slate-500">Loading roadmaps...</div>
          ) : activeRoadmaps.length === 0 ? (
             <div className="text-slate-500 col-span-2 text-center py-12">
               No roadmap has been generated yet. Select a career from Career Recommendations to generate your roadmap.
             </div>
          ) : (
          activeRoadmaps.map((roadmap: any) => (
            <div key={roadmap.careerId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl ${roadmap.thumbnailClass}`}>
                      {(roadmap.career || '??').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{roadmap.career || 'Unknown Career'}</h2>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mt-1">
                        Version {roadmap.version} • {roadmap.estimatedHoursRemaining}h remaining
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === roadmap.careerId ? null : roadmap.careerId)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenuId === roadmap.careerId && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
                        <button 
                          onClick={() => handleDelete(roadmap.careerId)}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Roadmap
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="my-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progress</span>
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{roadmap.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${roadmap.progress}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Map className="w-3.5 h-3.5" /> Current Stage</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{roadmap.currentStage}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last Activity</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{roadmap.lastActivity || 'Just now'}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => navigate(`/roadmap/${roadmap.careerId}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Play className="w-4 h-4" /> Continue Roadmap
                </button>
              </div>
            </div>
          )))}

          {/* Empty State / Add New */}
          <div 
            onClick={() => navigate('/career-recommendation')}
            className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all group min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-all">
              <Plus className="w-8 h-8 text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Explore Another Career</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Discover and generate a new personalized learning roadmap without losing progress in your current ones.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
