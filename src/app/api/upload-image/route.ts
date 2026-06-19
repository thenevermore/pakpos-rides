import { NextRequest, NextResponse } from 'next/server';

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fileName, folder } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'ImageKit private key not configured' },
        { status: 500 }
      );
    }

    // Generate filename from URL if not provided
    const finalFileName = fileName || generateFileName(imageUrl);
    const finalFolder = folder || 'pakpos-rides';

    // Prepare form data for ImageKit upload
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('fileName', finalFileName);
    formData.append('folder', finalFolder);

    // Upload to ImageKit
    const auth = Buffer.from(`${privateKey}:`).toString('base64');
    const response = await fetch(IMAGEKIT_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ImageKit upload failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to upload to ImageKit', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the CDN URL
    return NextResponse.json({
      success: true,
      cdnUrl: data.url,
      fileId: data.fileId,
      name: data.name,
    });

  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

function generateFileName(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const originalName = pathname.split('/').pop() || 'image.jpg';
    
    // Add timestamp to avoid duplicates
    const timestamp = Date.now();
    const ext = originalName.split('.').pop() || 'jpg';
    const baseName = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
    
    return `${baseName}-${timestamp}.${ext}`;
  } catch {
    return `image-${Date.now()}.jpg`;
  }
}
