import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

const schema = z.object({ id: z.string().uuid(), status: z.enum(['new', 'in_progress', 'resolved']) });

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid support update.' }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('support_requests').update({
    status: parsed.data.status,
    resolved_at: parsed.data.status === 'resolved' ? new Date().toISOString() : null
  }).eq('id', parsed.data.id).select('id,status').single();
  if (error) return NextResponse.json({ error: 'Could not update the request.' }, { status: 500 });
  await supabase.from('admin_audit_log').insert({ actor_email: admin.email, action: 'support_status_update', entity_type: 'support_request', entity_id: data.id, metadata: { status: data.status } });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
