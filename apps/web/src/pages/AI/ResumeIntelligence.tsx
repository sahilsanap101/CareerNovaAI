import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileText, CheckCircle2, AlertCircle, Sparkles, Upload } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Spinner } from '@/components/ui/Loader';
import { aiApi } from '@/api/ai.api';
import { useToast } from '@/hooks/useToast';

export function ResumeIntelligence() {
  const toast = useToast();
  const [resumeText, setResumeText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: (text: string) => aiApi.sendChatMessage(text, undefined, 'RESUME'),
    onSuccess: (data) => {
      setAnalysisResult(data.message.content);
      toast.success('Resume analyzed by Resume Intelligence Agent!');
    },
    onError: () => toast.error('Failed to analyze resume.'),
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    analyzeMutation.mutate(resumeText);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Breadcrumb />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="h-6 w-6 text-violet-500" />
          ATS Resume Intelligence & Keyword Optimizer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analyze resume text against target engineering roles, ATS parser compatibility, and missing technical keywords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Paste Resume Content or Bullet Points</CardTitle>
            <CardDescription>Include experience, projects, skills, and summary for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <Textarea
                placeholder="Paste your resume text here..."
                rows={12}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />

              <Button type="submit" isLoading={analyzeMutation.isPending} className="w-full" leftIcon={<Sparkles className="h-4 w-4" />}>
                Analyze Resume with AI
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Intelligence Feedback Output */}
        <Card>
          <CardHeader>
            <CardTitle>ATS Analysis & Recommendations</CardTitle>
            <CardDescription>AI-generated score breakdown and rewrite suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            {analyzeMutation.isPending ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : analysisResult ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                {analysisResult}
              </div>
            ) : (
              <div className="text-center py-20 space-y-2 text-slate-400">
                <FileText className="h-10 w-10 mx-auto text-slate-300" />
                <p className="text-sm">Paste resume text on the left and click analyze to see feedback.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
