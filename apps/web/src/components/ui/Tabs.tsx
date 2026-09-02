import { useState, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTabId, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId ?? tabs[0]?.id ?? '');

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium transition-all relative',
                isActive
                  ? 'text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
              )}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-4">{activeContent}</div>
    </div>
  );
}
