import { useState } from 'react';
import { Loader2, Briefcase, ChevronRight, X, TrendingUp, Search } from 'lucide-react';
import { careerCatalogApi, TrendingJob } from '@/api/careerCatalog.api';

export function CareerCatalogPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingJobs, setTrendingJobs] = useState<TrendingJob[]>([]);
  
  // Selection
  const [selectedJob, setSelectedJob] = useState<TrendingJob | null>(null);

  const fetchTrendingJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await careerCatalogApi.getTrendingJobs();
      setTrendingJobs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch trending jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Trending Jobs
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
            Discover the top 5 currently trending software and IT career roles, generated in real-time by AI and personalized to your skills and interests.
          </p>
        </div>
        <button
          onClick={fetchTrendingJobs}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <TrendingUp className="w-5 h-5" />
          )}
          {loading ? 'Fetching current market trends...' : error ? 'Try Again' : 'Fetch Trending Jobs'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && trendingJobs.length === 0 && !error && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Ready to explore?</h3>
          <p className="text-slate-500 mb-6">Click the button above to generate the latest top trending IT jobs based on real-time data.</p>
          <button
            onClick={fetchTrendingJobs}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            Fetch Trending Jobs
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && trendingJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Analyzing market trends...</h3>
          <p className="text-slate-500">Generating the top 5 roles personalized for you.</p>
        </div>
      )}

      {/* Grid */}
      {trendingJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {trendingJobs.map((job, index) => (
            <div
              key={index}
              className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-primary-500/50 dark:hover:border-primary-500/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                Rank #{index + 1}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {job.jobName}
              </h3>
              
              <div className="space-y-2 mb-5 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Demand:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{job.demand}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">India Fresher Openings:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{job.openings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Fresher Salary:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{job.averageSalary}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Experience:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{job.experienceLevel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Top Locations:</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[150px] truncate">{job.topLocations?.join(', ')}</span>
                </div>
              </div>
              
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md">
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills.length > 3 && (
                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-medium rounded-md">
                      +{job.requiredSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-5 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="line-clamp-2"><span className="font-semibold text-slate-700 dark:text-slate-300">Why Trending:</span> {job.whyTrending}</p>
              </div>

              <button
                onClick={() => setSelectedJob(job)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors mt-auto"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 text-sm font-bold uppercase tracking-wider mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending Role
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedJob.jobName}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              
              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Why this role may be relevant to you</h3>
                <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 rounded-xl p-4">
                  <p className="text-primary-800 dark:text-primary-300 text-sm leading-relaxed">
                    {selectedJob.relevanceToUser}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Why it's trending</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedJob.whyTrending}
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current Demand</h3>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedJob.demand}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">India Fresher Openings</h3>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedJob.openings}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Top Hiring Cities</h3>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{selectedJob.topLocations?.join(', ')}</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Fresher Salary</h3>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">{selectedJob.averageSalary}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Typical Experience</h3>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedJob.experienceLevel}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Relevant Career</h3>
                    <p className="text-base font-semibold text-primary-600 dark:text-primary-400">{selectedJob.relevantPathforgeCareer}</p>
                  </div>
                </section>
              </div>

              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredSkills.map((s, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              {selectedJob.preferredSkills && selectedJob.preferredSkills.length > 0 && (
                <section>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    Preferred Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.preferredSkills.map((s, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Why companies hire for this role</h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{selectedJob.whyCompaniesHire}</p>
                </div>
                
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">What a fresher should learn</h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{selectedJob.whatToLearn}</p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Recommended projects</h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{selectedJob.recommendedProjects}</p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Interview preparation</h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{selectedJob.interviewPreparation}</p>
                </div>
              </section>

              {selectedJob.sources && selectedJob.sources.length > 0 && (
                <section className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sources & References</h3>
                  <ul className="list-disc list-inside text-xs text-slate-500 space-y-1">
                    {selectedJob.sources.map((src, idx) => (
                      <li key={idx}>{src}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-400 mt-4">Data generated by AI based on real-time market trends. Always verify with actual job postings.</p>
                </section>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
