/**
 * Upload image URL to ImageKit CDN via server-side API
 * Returns the CDN URL or null on failure
 */
export async function uploadToCdn(imageUrl: string, folder?: string): Promise<string | null> {
  if (!imageUrl) return null;
  
  // If already a CDN URL, return as-is
  if (imageUrl.includes('imagekit.io')) return imageUrl;

  try {
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, folder }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('CDN upload failed:', errData);
      return null;
    }

    const data = await res.json();
    return data.cdnUrl || null;
  } catch (err) {
    console.error('CDN upload error:', err);
    return null;
  }
}
