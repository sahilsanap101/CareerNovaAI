import { Zap, Target, Users, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { APP_ROUTES } from '@pathforge/shared-constants';

const values = [
  { icon: Target, title: 'Student-First', desc: 'Every feature is built for engineering students navigating early career decisions.' },
  { icon: BookOpen, title: 'Research-Backed', desc: 'Our BYSER algorithm is built on validated career science and ML research.' },
  { icon: Users, title: 'Community-Driven', desc: 'We listen to students and iterate fast based on real feedback.' },
  { icon: Award, title: 'Transparent AI', desc: 'Explainable AI — you always know WHY we recommend something.' },
];

export default function About() {
  return (
    <>
      <title>About CareerNova — Our Mission</title>

      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Built for <span className="gradient-text">engineering students</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            CareerNova was born from a simple observation: engineering students are brilliant, but most career guidance systems don't understand their world. We're changing that.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-12">
          <CardContent>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              To give every engineering student — regardless of their college tier, city, or background — access to world-class, data-driven career guidance. We believe your career path shouldn't be determined by who you know, but by what you can do and where you want to go.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {values.map((v) => (
            <Card key={v.title} hoverable>
              <CardContent>
                <div className="h-10 w-10 bg-primary-50 dark:bg-primary-950 rounded-lg flex items-center justify-center mb-3">
                  <v.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{v.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ready to start?</h2>
          <div className="flex items-center justify-center gap-3">
            <Link to={APP_ROUTES.REGISTER}><Button id="about-register">Create Free Account</Button></Link>
            <Link to={APP_ROUTES.HOME}><Button variant="outline" id="about-home">Learn More</Button></Link>
          </div>
        </div>
      </div>
    </>
  );
}
