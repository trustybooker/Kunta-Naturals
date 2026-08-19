'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const [setup, setSetup] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(setup ? 'Creating owner access…' : 'Signing in…');
    const form = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');
    if (setup && email !== 'fifynow@gmail.com') {
      setStatus('Owner setup is restricted to the approved Kunta Naturals email.');
      setPending(false);
      return;
    }
    const { error } = setup
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(setup ? error.message : 'Sign-in failed. Check the email and password, then try again.');
      setPending(false);
      return;
    }
    if (setup) {
      setStatus('Owner access created. Check fifynow@gmail.com for the confirmation link, then sign in.');
      setSetup(false);
      setPending(false);
      return;
    }
    const access = await fetch('/api/admin/session', { cache: 'no-store' });
    if (!access.ok) {
      await supabase.auth.signOut();
      setStatus('This account is valid but is not approved for Kunta Naturals administration.');
      setPending(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get('next');
    router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
    router.refresh();
  }

  return <form className="form-grid" onSubmit={submit}>
    <label>Email<input key={setup ? 'setup' : 'signin'} className="input" name="email" type="email" autoComplete="username" defaultValue={setup ? 'fifynow@gmail.com' : ''} readOnly={setup} required /></label>
    <label>Password<input className="input" name="password" type="password" autoComplete={setup ? 'new-password' : 'current-password'} minLength={12} required /></label>
    <button disabled={pending} type="submit">{pending ? 'Please wait…' : setup ? 'Create owner access' : 'Sign in securely'}</button>
    <button disabled={pending} className="button-secondary" type="button" onClick={() => { setSetup((value) => !value); setStatus(''); }}>{setup ? 'Back to sign in' : 'First time? Set up owner access'}</button>
    <p className="notice" role="status">{status || 'Only approved Kunta Naturals administrators can access this workspace.'}</p>
  </form>;
}
