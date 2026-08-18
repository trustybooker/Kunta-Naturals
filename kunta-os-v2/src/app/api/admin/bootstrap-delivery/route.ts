import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

const allowedFiles = new Map([
  ['7-day-body-ritual-guide.pdf', 'application/pdf'],
  ['bathroom-reset-cards.pdf', 'application/pdf'],
  ['ritual-journal.pdf', 'application/pdf'],
  ['self-care-planner.pdf', 'application/pdf'],
  ['glow-scent-bundle.zip', 'application/zip'],
  ['ritual-vault.zip', 'application/zip']
]);

function authorized(request: Request) {
  const expected = process.env.DELIVERY_BOOTSTRAP_TOKEN || '';
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!expected || expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const file = (await request.formData()).get('file');
  if (!(file instanceof File) || !allowedFiles.has(file.name) || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Invalid delivery file.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const contentType = allowedFiles.get(file.name)!;
  const supabase = createSupabaseAdminClient();
  const bucket = process.env.SUPABASE_DELIVERY_BUCKET || 'digital-products';
  const { error } = await supabase.storage.from(bucket).upload(`paid/${file.name}`, file, {
    contentType,
    upsert: true,
    cacheControl: '3600'
  });

  if (error) {
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({ uploaded: file.name }, { headers: { 'Cache-Control': 'no-store' } });
}
