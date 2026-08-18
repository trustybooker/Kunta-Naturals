import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.from('analytics_events').select('event_name,path,label,created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(5000);
  if (error) return NextResponse.json({ error: 'Could not load analytics.' }, { status: 500 });
  const totals = (data || []).reduce<Record<string, number>>((result, event) => {
    result[event.event_name] = (result[event.event_name] || 0) + 1;
    return result;
  }, {});
  return NextResponse.json({ totals, recent: (data || []).slice(0, 50), windowDays: 30 }, { headers: { 'Cache-Control': 'no-store' } });
}
