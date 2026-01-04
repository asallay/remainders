/**
 * Wallpaper Generation API Route
 * Minimalist Dot-Grid Redesign
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { YearView } from './year-view';
import { LifeView } from './life-view';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const width = parseInt(searchParams.get('width') || '1170');
    const height = parseInt(searchParams.get('height') || '2532');
    const isMondayFirst = searchParams.get('isMondayFirst') === '1';
    const viewMode = searchParams.get('viewMode') || 'year';
    const birthDate = searchParams.get('birthDate') || '';

    let content;

    if (viewMode === 'life' && birthDate) {
      content = <LifeView width={width} height={height} birthDate={birthDate} />;
    } else {
      // Default to Year View
      content = <YearView width={width} height={height} isMondayFirst={isMondayFirst} />;
    }

    return new ImageResponse(
      content,
      {
        width,
        height,
      }
    );
  } catch (error) {
    console.error('Error generating wallpaper:', error);
    return new Response('Error generating wallpaper', { status: 500 });
  }
}
