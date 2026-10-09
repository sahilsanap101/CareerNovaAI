import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileText, CheckCircle2, AlertCircle, Sparkles, Upload, FileUp, X, Briefcase, FileSignature, Check, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Spinner } from '@/components/ui/Loader';
import { aiApi, ResumeAnalysisResult } from '@/api/ai.api';
import { useToast } from '@/hooks/useToast';
import { clsx } from 'clsx';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export function ResumeIntelligence() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const analyzeMutation = useMutation({
    mutationFn: () => aiApi.analyzeResume(resumeText, jobDescription),
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast.success('Resume analyzed successfully!');
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData && errorData.stage) {
        toast.error(`${errorData.stage}: ${errorData.message}`);
      } else {
        toast.error('Failed to analyze resume. Please try again.');
      }
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size validation (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resume file is too large. Maximum supported size is 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFileName(file.name);
    setIsExtracting(true);

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          text += strings.join(' ') + '\n';
        }
        
        if (text.trim().length === 0) {
           toast.error('This PDF appears to contain scanned/image content. Please upload a text-based PDF.');
           setFileName(null);
        } else {
           setResumeText(text);
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value.trim().length === 0) {
           toast.error('We could not extract readable text from this DOCX file.');
           setFileName(null);
        } else {
           setResumeText(result.value);
        }
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        setResumeText(text);
      } else {
        toast.error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
        setFileName(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('We could not extract readable text from this resume.');
      setFileName(null);
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    if (!resumeText.trim()) {
      toast.error('Please upload a resume or paste your resume text first.');
      return;
    }
    analyzeMutation.mutate();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <FileSignature className="h-8 w-8 text-violet-500" />
          Resume Intelligence
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-3xl">
          Analyze your resume against a specific job description. We'll extract your skills, score your match, and provide actionable rewrite suggestions to beat the ATS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          {/* UPLOAD RESUME */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">1</div>
                <CardTitle className="text-lg">Upload Resume</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              
              {!fileName && !resumeText ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors group"
                >
                  {isExtracting ? (
                    <Spinner className="mb-4" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileUp className="h-6 w-6 text-slate-500 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
                    </div>
                  )}
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Upload PDF / DOCX</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse files</p>
                </button>
              ) : (
                <div className="space-y-3">
                  {fileName && (
                    <div className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-lg">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="h-5 w-5 text-violet-600 shrink-0" />
                        <span className="font-medium text-violet-900 dark:text-violet-100 truncate">{fileName}</span>
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      </div>
                      <button 
                        onClick={() => { setFileName(null); setResumeText(''); setAnalysisResult(null); }}
                        className="p-1 hover:bg-violet-200 dark:hover:bg-violet-500/30 rounded"
                      >
                        <X className="h-4 w-4 text-violet-600" />
                      </button>
                    </div>
                  )}
                  <Textarea
                    placeholder="Extracted resume text will appear here. You can also paste manually..."
                    rows={6}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* JOB DESCRIPTION */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">2</div>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the target Job Description here..."
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </CardContent>
          </Card>

          <Button 
            onClick={handleAnalyze} 
            isLoading={analyzeMutation.isPending} 
            className="w-full h-14 text-lg rounded-xl shadow-lg hover:shadow-violet-500/25 transition-all" 
            leftIcon={<Sparkles className="h-5 w-5" />}
          >
            Analyze Resume Against Job
          </Button>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="lg:col-span-7">
          {analyzeMutation.isPending ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Spinner size="lg" className="mb-4 text-violet-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Analyzing Your Resume</h3>
              <p className="text-slate-500">Cross-referencing skills with job description...</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              
              {analysisResult.isDeterministicOnly ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-400">Resume-JD analysis completed. AI-powered suggestions are temporarily unavailable.</h4>
                      <p className="text-sm text-amber-700/80 dark:text-amber-500/80">The system used deterministic matching because the AI provider is experiencing high demand.</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0" onClick={handleAnalyze} isLoading={analyzeMutation.isPending}>
                    Retry AI Insights
                  </Button>
                </div>
              ) : analysisResult.aiModelUsed && analysisResult.aiModelUsed !== import.meta.env.VITE_AI_MODEL && analysisResult.aiModelUsed !== 'gemini-3.5-flash' ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400">Analysis completed using an available AI model.</h4>
                    <p className="text-sm text-blue-700/80 dark:text-blue-500/80">The primary model was unavailable, so we seamlessly failed over to {analysisResult.aiModelUsed}.</p>
                  </div>
                </div>
              ) : null}

              {/* Score Header */}
              <Card className="bg-slate-900 text-white border-0 overflow-hidden relative shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <CardContent className="p-8 relative z-10 flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="12" fill="none" />
                      <circle 
                        cx="64" cy="64" r="56" 
                        className={clsx("transition-all duration-1000 ease-out", getScoreColor(analysisResult.matchScore).replace('text-', 'stroke-'))} 
                        strokeWidth="12" 
                        fill="none" 
                        strokeDasharray="351.86" 
                        strokeDashoffset={351.86 - (351.86 * analysisResult.matchScore) / 100} 
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{analysisResult.matchScore}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-widest">Match</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                    {[
                      { label: 'Required Skills', score: analysisResult.categoryScores.requiredSkills },
                      { label: 'Preferred Skills', score: analysisResult.categoryScores.preferredSkills },
                      { label: 'Experience', score: analysisResult.categoryScores.experience },
                      { label: 'Projects', score: analysisResult.categoryScores.projects },
                      { label: 'Education', score: analysisResult.categoryScores.education },
                      { label: 'ATS Readiness', score: analysisResult.categoryScores.atsReadiness },
                    ].map((cat, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-300">{cat.label}</span>
                          <span className={getScoreColor(cat.score)}>{cat.score}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={clsx("h-full rounded-full", getScoreBg(cat.score))} style={{ width: `${cat.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Skills You Have */}
                <Card className="border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-green-800 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      Skills You Have
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.skillsYouHave.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-green-100 dark:bg-green-800/40 text-green-800 dark:text-green-300 text-xs font-medium rounded-md border border-green-200 dark:border-green-700/50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Missing Required Skills */}
                <Card className="border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-red-800 dark:text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      Missing Required Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingRequiredSkills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-red-100 dark:bg-red-800/40 text-red-800 dark:text-red-300 text-xs font-medium rounded-md border border-red-200 dark:border-red-700/50">
                          {skill}
                        </span>
                      ))}
                      {analysisResult.missingRequiredSkills.length === 0 && (
                         <span className="text-sm text-slate-500">None! You hit all required skills.</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Missing Preferred Skills */}
                <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-amber-800 dark:text-amber-400">
                      <AlertCircle className="h-5 w-5" />
                      Missing Preferred Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingPreferredSkills?.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-medium rounded-md border border-amber-200 dark:border-amber-700/50">
                          {skill}
                        </span>
                      ))}
                      {(!analysisResult.missingPreferredSkills || analysisResult.missingPreferredSkills.length === 0) && (
                         <span className="text-sm text-slate-500">None! You hit all preferred skills or none were requested.</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actionable Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actionable Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {analysisResult.top5Changes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs">★</div>
                        Top Recommended Changes
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.top5Changes.map((change, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                            <ChevronRight className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.resumeIssues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        General Resume Issues
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        {analysisResult.resumeIssues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Improved Bullet Suggestions */}
              {analysisResult.improvedBulletSuggestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    AI Bullet Rewrites
                  </h3>
                  
                  {analysisResult.improvedBulletSuggestions.map((suggestion, i) => (
                    <Card key={i} className="overflow-hidden border-violet-100 dark:border-violet-900/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Original</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 line-through opacity-70">{suggestion.original}</p>
                        </div>
                        <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 space-y-2">
                          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1"><Check className="h-3 w-3" /> Improved</span>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{suggestion.improved}</p>
                          <p className="text-xs text-violet-700 dark:text-violet-300 mt-2 bg-violet-100 dark:bg-violet-900/30 p-2 rounded">
                            <span className="font-semibold">Why:</span> {suggestion.reason}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center p-8">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 transform rotate-12">
                <FileSignature className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Ready for Analysis</h3>
              <p className="text-slate-500 max-w-sm">
                Upload your resume and provide a target job description to get personalized, AI-driven feedback and score breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
