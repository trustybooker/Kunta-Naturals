import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

const types = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from('brand-media').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) return NextResponse.json({ error: 'Could not load media.' }, { status: 500 });
  return NextResponse.json((data || []).filter((file) => file.id).map((file) => ({ ...file, url: supabase.storage.from('brand-media').getPublicUrl(file.name).data.publicUrl })), { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const file = (await request.formData()).get('file');
  if (!(file instanceof File) || !types.has(file.type) || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Choose a PNG, JPEG, WebP, or SVG no larger than 10 MB.' }, { status: 400 });
  const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  const name = `${Date.now()}-${safe || 'brand-image'}`;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from('brand-media').upload(name, file, { contentType: file.type, upsert: false, cacheControl: '31536000' });
  if (error) return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  await supabase.from('admin_audit_log').insert({ actor_email: admin.email, action: 'media_upload', entity_type: 'brand_media', entity_id: name });
  return NextResponse.json({ name, url: supabase.storage.from('brand-media').getPublicUrl(name).data.publicUrl });
}
