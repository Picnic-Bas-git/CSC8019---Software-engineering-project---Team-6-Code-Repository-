import { NextResponse } from 'next/server';
import { getKioskOpenStatus } from '@/lib/business-hours';

/**
 * Returns current kiosk open/closed status.
 */
export async function GET() {
  const status = await getKioskOpenStatus();

  return NextResponse.json(status, { status: 200 });
}
