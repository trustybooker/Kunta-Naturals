import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Not approved for administration.' }, { status: 403 });
  return NextResponse.json({ email: admin.email }, { headers: { 'Cache-Control': 'no-store' } });
}
