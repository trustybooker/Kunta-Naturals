import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase() || '';
  const allowed = (process.env.KUNTA_ADMIN_EMAILS || process.env.KUNTA_ADMIN_EMAIL || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (error || !data.user || !email || !allowed.includes(email)) return null;
  return { user: data.user, email };
}
