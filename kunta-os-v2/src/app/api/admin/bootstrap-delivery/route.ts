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

function authorized(supplied: string) {
  const expected = process.env.DELIVERY_BOOTSTRAP_TOKEN_2 || process.env.DELIVERY_BOOTSTRAP_TOKEN || '';
  if (!expected || expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

export async function GET() {
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>Kunta delivery bootstrap</title></head><body><main><h1>Private delivery upload</h1><form method="post" enctype="multipart/form-data"><label>Token <input name="token" type="password" required></label><label>File <input name="file" type="file" required></label><button type="submit">Upload</button></form></main></body></html>`, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
    }
  });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get('token') || '');
  if (!authorized(token)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const file = form.get('file');
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
