import { NextResponse } from 'next/server';
import manifest from '@/content/image-manifest.json';

// Shows which game images the last build managed to download, and why any were skipped.
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(manifest);
}
