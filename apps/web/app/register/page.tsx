'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signup } from '@/lib/auth';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiquidButton } from '@/components/ui/LiquidButton';

type RegisterForm = {
  email: string;
  password: string;
  role: 'advisor' | 'admin' | 'assistant';
};

export default function RegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterForm>({
    defaultValues: { role: 'advisor' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage('');
    setInfoMessage('');

    const { data, error } = await signup(values.email, values.password, values.role);
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data?.needsEmailVerification) {
      setInfoMessage('Account created. Please verify your email, then login.');
      router.replace('/login');
      return;
    }

    router.replace('/');
  });

  return (
    <div className="mx-auto mt-14 max-w-md">
      <GlassCard className="space-y-4">
        <h1 className="text-2xl font-semibold">Register</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            {...register('email', { required: true })}
            placeholder="Email"
            className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2"
          />
          <input
            {...register('password', { required: true, minLength: 8 })}
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2"
          />
          <select
            {...register('role', { required: true })}
            className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2"
          >
            <option value="advisor">Advisor</option>
            <option value="assistant">Assistant</option>
            <option value="admin">Admin</option>
          </select>
          {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
          {infoMessage ? <p className="text-sm text-cyan-200">{infoMessage}</p> : null}
          <LiquidButton type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating...' : 'Create account'}
          </LiquidButton>
        </form>
        <p className="text-sm text-slate-300">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-200">
            Login
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
