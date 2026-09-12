import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mic, Send, Sparkles, CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Spinner } from '@/components/ui/Loader';
import { aiApi } from '@/api/ai.api';

export function InterviewCoach() {
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const interviewMutation = useMutation({
    mutationFn: (ans: string) =>
      aiApi.sendChatMessage(`[${interviewType} Mock Interview Answer]: ${ans}`, undefined, 'INTERVIEW'),
    onSuccess: (data) => setFeedback(data.message.content),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    interviewMutation.mutate(userAnswer);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Breadcrumb />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Mic className="h-6 w-6 text-violet-500" />
          Technical & HR Mock Interview Simulator
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Simulate real-world technical, system design, HR, and behavioral interview questions with instant feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mock Session</CardTitle>
              <div className="w-48">
                <Select
                  options={[
                    { value: 'TECHNICAL', label: 'Technical Core' },
                    { value: 'SYSTEM_DESIGN', label: 'System Design' },
                    { value: 'BEHAVIORAL', label: 'Behavioral HR' },
                  ]}
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>Question: "Explain how database indexing works in PostgreSQL."</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Type your response here..."
                rows={8}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
              <Button type="submit" isLoading={interviewMutation.isPending} className="w-full" rightIcon={<Send className="h-4 w-4" />}>
                Submit Answer for Feedback
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Interview Coach Evaluation</CardTitle>
            <CardDescription>Instant feedback, scoring, and missing points</CardDescription>
          </CardHeader>
          <CardContent>
            {interviewMutation.isPending ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : feedback ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                {feedback}
              </div>
            ) : (
              <div className="text-center py-20 space-y-2 text-slate-400">
                <Mic className="h-10 w-10 mx-auto text-slate-300" />
                <p className="text-sm">Submit your answer to receive synchronous coaching feedback.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
