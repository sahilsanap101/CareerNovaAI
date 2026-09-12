import { Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between p-12 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-600/20 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">CareerNova</span>
        </div>

        {/* Feature list */}
        <div className="relative space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Navigate your career<br />with AI precision.
            </h2>
            <p className="mt-3 text-primary-200 text-base leading-relaxed">
              Built for engineering students who want data-driven guidance, not guesswork.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { emoji: '🧠', title: 'AI Career Guidance', desc: 'Personalized recommendations based on your skills and goals' },
              { emoji: '📊', title: 'Skill Gap Analysis', desc: 'Identify and bridge gaps with targeted learning paths' },
              { emoji: '🗺️', title: 'Career Roadmaps', desc: 'Step-by-step paths to your dream role' },
              { emoji: '📄', title: 'Resume Analysis', desc: 'AI-powered resume scoring and improvement tips' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{f.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-primary-300">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-primary-400">
          Trusted by engineering students across India
        </p>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              PATH<span className="text-primary-600">FORGE</span>
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
