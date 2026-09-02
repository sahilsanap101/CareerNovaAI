import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Loader';
import { authApi } from '@/api/auth.api';
import { APP_ROUTES } from '@pathforge/shared-constants';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = params.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="text-center animate-fade-up">
      {status === 'loading' && (
        <>
          <Spinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Verifying your email...</h1>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email verified!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Your account is now active. You can log in.</p>
          <Link to={APP_ROUTES.LOGIN}><Button id="verify-login">Go to Login</Button></Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-6">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification failed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">This link is invalid or has expired.</p>
          <Link to={APP_ROUTES.LOGIN}><Button variant="outline" id="verify-back">Back to Login</Button></Link>
        </>
      )}
    </div>
  );
}
