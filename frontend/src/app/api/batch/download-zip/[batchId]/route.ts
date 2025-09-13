import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ batchId: string }> }
) {
  const params = await context.params;
  const batchId = params.batchId;
  const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/batch/download-zip/${batchId}`;
  
  try {
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Download failed' }, { status: response.status });
    }
    
    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="files-${batchId}.zip"`,
        'Content-Type': 'application/zip',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}