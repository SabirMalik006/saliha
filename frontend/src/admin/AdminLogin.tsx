import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, FlaskConical, KeyRound, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ClinicLogo } from '@/components/brand/ClinicLogo';
import { FormAlert } from '@/components/forms/Field';
import { PasswordInput, TextInput } from '@/components/forms/Inputs';
import { Seo } from '@/components/seo/Seo';
import { loginSchema, type LoginFormValues } from '@/schemas';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { normaliseApiError, type ApiError } from '@/services/apiClient';
import { appConfig } from '@/config/env';
import { routes } from '@/routes/paths';

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<ApiError | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? routes.admin;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { identifier: '', password: '' },
  });

  useEffect(() => {
    document.title = 'Admin Login | Specialist Clinic';
  }, []);

  if (isAuthenticated) return <Navigate to={routes.admin} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values.identifier, values.password);
      toast.success('Signed in', 'Welcome back to the Specialist Clinic admin area.');
      navigate(from, { replace: true });
    } catch (error) {
      const apiError = normaliseApiError(error);
      setServerError(apiError);
      if (apiError.isNetworkError) {
        toast.error(
          'Could not reach the server',
          'Check your internet connection and try again.',
        );
      }
    }
  });

  return (
    <>
      <Seo
        title="Admin Login | Specialist Clinic"
        description="Restricted administration area."
        path={routes.adminLogin}
        noIndex
      />

      <div className="flex min-h-screen flex-col bg-app">
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <div className="text-center">
              <ClinicLogo size="md" className="mx-auto h-16 w-16" title="Specialist Clinic" />
              <h1 className="mt-5 text-2xl font-bold text-navy-800">Admin Login</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Specialist Clinic &mdash; Dr. Saleha Ibtisam
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-md sm:p-7">
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                {serverError ? (
                  <FormAlert
                    title={
                      serverError.isUnauthorised
                        ? 'Incorrect email or password'
                        : 'We could not sign you in'
                    }
                    message={
                      serverError.isUnauthorised
                        ? 'Please check your details and try again.'
                        : serverError.message
                    }
                  />
                ) : null}

                <TextInput
                  label="Email or Username"
                  required
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@specialistclinic.pk"
                  error={errors.identifier?.message}
                  {...register('identifier')}
                />

                <PasswordInput
                  label="Password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  leftIcon={!isSubmitting ? <LogIn className="h-4 w-4" aria-hidden="true" /> : undefined}
                >
                  {isSubmitting ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>

              <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-line bg-app p-3.5 text-xs leading-relaxed text-ink-soft">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                Access is restricted to authorised clinic staff. Sign-in attempts are recorded, and
                all admin activity is authorised on the server.
              </p>
            </div>

            {appConfig.useMockApi ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-amber-900">
                  <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                  Development mode
                </p>
                <p className="mt-2 text-sm leading-relaxed text-amber-900">
                  The mock API accepts the development credentials{' '}
                  <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[0.8125rem] font-semibold">
                    admin@specialistclinic.test
                  </code>{' '}
                  /{' '}
                  <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[0.8125rem] font-semibold">
                    ClinicDev2025!
                  </code>
                  . These are not real credentials and do not exist in production.
                </p>
              </div>
            ) : null}

            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-faint">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              Trouble signing in? Contact the clinic administrator.
            </p>

            <p className="mt-2 flex items-center justify-center gap-2 text-xs text-ink-faint">
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Sessions are cookie-based and expire automatically.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}