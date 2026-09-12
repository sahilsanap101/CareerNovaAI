import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Linkedin } from 'lucide-react';

import { APP_ROUTES } from '@pathforge/shared-constants';

const footerLinks = {
  Product: [
    { label: 'Dashboard', href: APP_ROUTES.DASHBOARD },
    { label: 'Features', href: '/#features' },
    { label: 'About', href: APP_ROUTES.ABOUT },
  ],
  'Coming Soon': [
    { label: 'AI Mentor', href: '#' },
    { label: 'Resume Analysis', href: '#' },
    { label: 'Career Roadmap', href: '#' },
    { label: 'Skill Gap Analysis', href: '#' },
  ],
  Account: [
    { label: 'Login', href: APP_ROUTES.LOGIN },
    { label: 'Register', href: APP_ROUTES.REGISTER },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                Career<span className="text-primary-600 dark:text-primary-400">Nova</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              AI-assisted career navigation for engineering students.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">{section}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} CareerNova. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Built around the PathForge research framework for constraint-aware skill planning.
          </p>
        </div>
      </div>
    </footer>
  );
}
