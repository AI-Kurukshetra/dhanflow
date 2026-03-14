'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { login, session } from '@/lib/auth';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiquidButton } from '@/components/ui/LiquidButton';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState('/');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>();

  useEffect(() => {
    const redirectParam = new URLSearchParams(window.location.search).get('redirect');
    if (redirectParam) {
      setRedirectTo(redirectParam);
    }

    void session().then(({ data }) => {
      if (data.session) router.replace('/');
    });
  }, [router]);

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage('');
    const { error } = await login(values.email, values.password);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    router.replace(redirectTo);
  });

  return (
    <div className="mx-auto mt-14 max-w-md">
      <GlassCard className="space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            {...register('email', { required: true })}
            placeholder="Email"
            className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2"
          />
          <input
            {...register('password', { required: true })}
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2"
          />
          {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
          <LiquidButton type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </LiquidButton>
        </form>
        <p className="text-sm text-slate-300">
          No account?{' '}
          <Link href="/register" className="text-cyan-200">
            Register
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
