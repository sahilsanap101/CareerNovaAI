import { Link } from 'react-router-dom';
import { ArrowRight, Brain, BarChart3, Map, FileText, Github, MessageSquare, Zap, CheckCircle, Star } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { APP_ROUTES } from '@pathforge/shared-constants';

// ─── Data ─────────────────────────────────────────────────────────

const features = [
  {
    icon: Brain,
    title: 'AI Career Guidance',
    description: 'BYSER algorithm analyzes your profile and recommends the best career path tailored for you.',
    badge: 'Core Feature',
    color: 'from-blue-500 to-blue-700',
  },
  {
    icon: BarChart3,
    title: 'Skill Gap Analysis',
    description: 'Identify exactly what skills you\'re missing for your target role and get a personalized learning plan.',
    badge: 'Coming Soon',
    color: 'from-emerald-500 to-teal-700',
  },
  {
    icon: Map,
    title: 'Roadmap Generation',
    description: 'AI-generated step-by-step roadmaps from where you are today to where you want to be.',
    badge: 'Coming Soon',
    color: 'from-violet-500 to-purple-700',
  },
  {
    icon: FileText,
    title: 'Resume Analysis',
    description: 'Get your resume scored and improved with AI-powered feedback and industry benchmarks.',
    badge: 'Coming Soon',
    color: 'from-orange-500 to-amber-700',
  },
  {
    icon: Github,
    title: 'GitHub Analysis',
    description: 'Your GitHub is your portfolio. We analyze it to highlight your strengths to recruiters.',
    badge: 'Coming Soon',
    color: 'from-slate-500 to-slate-700',
  },
  {
    icon: MessageSquare,
    title: 'AI Career Mentor',
    description: 'Chat with an AI mentor that knows your profile and provides contextual career advice.',
    badge: 'Coming Soon',
    color: 'from-pink-500 to-rose-700',
  },
];

const stats = [
  { value: '10K+', label: 'Students guided' },
  { value: '95%', label: 'Satisfaction rate' },
  { value: '3x', label: 'Faster career growth' },
  { value: '50+', label: 'Career paths' },
];

// ─── Hero ─────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-20 pb-28 px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary-50 dark:from-primary-950/50 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent-50 dark:from-accent-950/30 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 animate-fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
          AI-Powered Career Navigation Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.05] tracking-tight text-balance animate-fade-up">
          Forge your{' '}
          <span className="gradient-text">engineering career</span>
          {' '}with AI
        </h1>

        <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-up text-balance">
          PATHFORGE gives every engineering student access to a personal AI career navigator — with roadmaps, skill gap analysis, and explainable recommendations.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
          <Link to={APP_ROUTES.REGISTER}>
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} id="hero-start-journey">
              Start Your Journey
            </Button>
          </Link>
          <Link to={APP_ROUTES.LOGIN}>
            <Button size="lg" variant="outline" id="hero-login">
              Login to Dashboard
            </Button>
          </Link>
        </div>

        {/* Trust */}
        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          {['Free to start', 'No credit card required', 'Built for IIT/NIT students'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────

function Stats() {
  return (
    <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">{s.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────

function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Everything you need to succeed</h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            From AI-powered recommendations to resume analysis — PATHFORGE is your complete career toolkit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} hoverable className="group transition-all duration-300">
              <CardContent>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{f.title}</h3>
                  <span className={`badge shrink-0 text-xs ${f.badge === 'Core Feature' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {f.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="relative">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-amber-300 fill-amber-300" aria-hidden="true" />)}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to forge your path?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of engineering students navigating their careers with AI-powered guidance.
          </p>
          <Link to={APP_ROUTES.REGISTER}>
            <Button
              size="lg"
              variant="secondary"
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="bg-white text-primary-700 hover:bg-primary-50 font-semibold shadow-lg"
              id="cta-start-journey"
            >
              Start Your Journey — It's Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────

export default function Landing() {
  return (
    <>
      <title>PATHFORGE — AI-Powered Career Navigation for Engineering Students</title>
      <Hero />
      <Stats />
      <Features />
      <CTA />
    </>
  );
}
