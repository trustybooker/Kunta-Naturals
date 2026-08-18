'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus('Signing in…');
    const form = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email: String(form.get('email') || ''), password: String(form.get('password') || '') });
    if (error) {
      setStatus('Sign-in failed. Check the email and password, then try again.');
      setPending(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get('next');
    router.replace(next?.startsWith('/') ? next : '/dashboard');
    router.refresh();
  }

  return <form className="form-grid" onSubmit={submit}>
    <label>Email<input className="input" name="email" type="email" autoComplete="username" required /></label>
    <label>Password<input className="input" name="password" type="password" autoComplete="current-password" required /></label>
    <button disabled={pending} type="submit">{pending ? 'Signing in…' : 'Sign in securely'}</button>
    <p className="notice" role="status">{status || 'Only approved Kunta Naturals administrators can access this workspace.'}</p>
  </form>;
}
