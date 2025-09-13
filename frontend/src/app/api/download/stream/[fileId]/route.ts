import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const params = await context.params;
  const fileId = params.fileId;
  const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/download/stream/${fileId}`;
  
  try {
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Download failed' }, { status: response.status });
    }
    
    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="${fileId}"`,
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}