import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb — auto-generates from route path if no items provided.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const location = useLocation();

  const autoItems: BreadcrumbItem[] = items ?? location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: index < arr.length - 1 ? `/${arr.slice(0, index + 1).join('/')}` : undefined,
    }));

  return (
    <nav aria-label="Breadcrumb" className={clsx('flex items-center gap-1 text-sm', className)}>
      <Link
        to="/dashboard"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {autoItems.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-slate-900 dark:text-slate-100 font-medium"
              aria-current="page"
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
