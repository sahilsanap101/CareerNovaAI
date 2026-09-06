import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Github,
  Mic,
  BookOpen,
  Compass,
  Cpu,
  User,
  Zap,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Spinner } from '@/components/ui/Loader';
import { aiApi, type AiChatMessage } from '@/api/ai.api';
import { useToast } from '@/hooks/useToast';

const AGENTS = [
  { id: 'CAREER_MENTOR', name: 'Career Mentor', icon: Compass, desc: 'General career guidance & mentoring' },
  { id: 'RESUME', name: 'Resume Intelligence', icon: FileText, desc: 'ATS score & rewrite suggestions' },
  { id: 'GITHUB', name: 'GitHub Intelligence', icon: Github, desc: 'Code quality & repo maintainability' },
  { id: 'INTERVIEW', name: 'Interview Coach', icon: Mic, desc: 'HR & Technical mock interviews' },
  { id: 'LEARNING', name: 'Learning Assistant', icon: BookOpen, desc: 'Technical concept explanations' },
  { id: 'RESEARCH', name: 'Research Assistant', icon: Cpu, desc: 'Paper summaries & citations' },
];

export default function AiDashboard() {
  const toast = useToast();
  const [selectedAgent, setSelectedAgent] = useState('CAREER_MENTOR');
  const [inputMessage, setInputMessage] = useState('');
  const [activeConvId, setActiveConvId] = useState<string | undefined>();
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([]);

  const handleAgentChange = (agentId: string) => {
    setSelectedAgent(agentId);
    setChatMessages([]);
    setActiveConvId(undefined);
  };

  const sendMutation = useMutation({
    mutationFn: (msg: string) => aiApi.sendChatMessage(msg, activeConvId, selectedAgent),
    onSuccess: (data) => {
      setActiveConvId(data.conversationId);
      setChatMessages((prev) => [...prev, data.message]);
      setInputMessage('');
    },
    onError: () => toast.error('Failed to send message to AIOS.'),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendMutation.isPending) return;

    const userMsg: AiChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    sendMutation.mutate(inputMessage);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <Breadcrumb />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-xs font-semibold text-violet-300">
            <Bot className="h-3.5 w-3.5 text-violet-400" />
            AI Operating System (AIOS) v5.0
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Career Intelligence Multi-Agent System</h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Grounded in your student profile, BYSER recommendation score, and active learning roadmap.
          </p>
        </div>
      </div>



      {/* Agent Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {AGENTS.map((agent) => {
          const isSelected = selectedAgent === agent.id;
          const Icon = agent.icon;
          return (
            <button
              key={agent.id}
              onClick={() => handleAgentChange(agent.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${isSelected
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{agent.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Interface */}
      <Card className="min-h-[450px] flex flex-col justify-between">
        <CardContent className="p-6 flex-1 space-y-4 overflow-y-auto max-h-[500px]">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-2">
              <Bot className="h-10 w-10 text-violet-500" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-sm">Start a session with {AGENTS.find(a => a.id === selectedAgent)?.name}</h3>
              <p className="text-xs text-slate-400 max-w-md">
                {selectedAgent === 'CAREER_MENTOR' && 'Ask about career paths, BYSER recommendations, skill gaps, and career strategy.'}
                {selectedAgent === 'RESUME' && 'Ask about your resume, ATS optimization, projects, and career-specific improvements.'}
                {selectedAgent === 'GITHUB' && 'Ask about your GitHub portfolio, projects, repositories, and coding profile.'}
                {selectedAgent === 'INTERVIEW' && 'Practice technical and behavioral interviews and receive feedback.'}
                {selectedAgent === 'LEARNING' && 'Get personalized learning guidance based on your career goals and skill gaps.'}
                {selectedAgent === 'RESEARCH' && 'Research careers, technologies, industries, skills, and learning resources.'}
              </p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </CardContent>

        {/* Input Form */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder={`Ask ${AGENTS.find(a => a.id === selectedAgent)?.name.toUpperCase()}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sendMutation.isPending}
              className="flex-1"
            />
            <Button type="submit" isLoading={sendMutation.isPending} disabled={!inputMessage.trim() || sendMutation.isPending} rightIcon={<Send className="h-4 w-4" />}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
