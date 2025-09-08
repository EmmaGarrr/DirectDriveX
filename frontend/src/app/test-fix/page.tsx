"use client";

import Link from 'next/link';

export default function TestFixPage() {
  const testFileIds = [
    'video-test',
    'image-test', 
    'audio-test',
    'pdf-test',
    'text-test',
    'random-file-id',
    'some-video-file',
    'document-pdf',
    'audio-mp3'
  ];

  return (
    <div className="min-h-screen bg-bolt-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-bolt-black mb-8 text-center">
          Preview Fix Test Page
        </h1>
        
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-bolt-cyan/20">
          <h2 className="text-xl font-semibold text-bolt-black mb-4">Test Different File IDs</h2>
          <p className="text-bolt-black/70 mb-6">
            Click on any file ID below to test the download page with mock data. 
            The preview should now work even when the backend is not available.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {testFileIds.map((fileId) => (
              <Link
                key={fileId}
                href={`/download/${fileId}`}
                className="p-4 rounded-xl border-2 border-bolt-cyan/20 bg-white hover:border-bolt-blue/50 hover:bg-bolt-blue/5 transition-all duration-200 text-center"
              >
                <div className="text-sm font-medium text-bolt-black mb-1">
                  {fileId}
                </div>
                <div className="text-xs text-bolt-black/70">
                  Click to test
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-6 bg-bolt-cyan/5 rounded-2xl border border-bolt-cyan/20">
          <h3 className="text-lg font-semibold text-bolt-black mb-3">What's Fixed</h3>
          <ul className="space-y-2 text-sm text-bolt-black/70">
            <li>✅ Added fallback mock data when backend is not available</li>
            <li>✅ Fixed undefined fileId error handling</li>
            <li>✅ Added flexible content type detection from fileId</li>
            <li>✅ Added proper error handling for preview metadata</li>
            <li>✅ Added mock preview URLs for testing</li>
            <li>✅ Fixed TypeScript type errors</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-bolt-blue/10 rounded-xl border border-bolt-blue/20">
          <p className="text-sm text-bolt-blue">
            <strong>Note:</strong> The preview will now work with mock data even when the backend server is not running. 
            Check the browser console to see the debug logs and verify that the fileId is being passed correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
