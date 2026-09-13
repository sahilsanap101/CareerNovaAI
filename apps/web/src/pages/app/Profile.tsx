import { ProfileWizard } from '@/pages/Profile/ProfileWizard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export default function Profile() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumb />
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Student Profile & Skills Assessment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your academic background, technical skills, interests, projects, certifications, and career goals.
        </p>
      </div>

      <div className="mb-6 p-4 border border-blue-200 bg-blue-50 dark:bg-slate-800 dark:border-slate-700 rounded-md">
        <p className="text-sm text-blue-800 dark:text-slate-300 font-medium">
          Optional Demographic Context
        </p>
        <p className="text-sm text-blue-700 dark:text-slate-400 mt-1">
          This information is collected only for academic fairness research and is never used as an input to your recommendation.
        </p>
      </div>

      <ProfileWizard />
    </div>
  );
}
