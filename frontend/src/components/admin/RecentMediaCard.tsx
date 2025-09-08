"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileImage, FileVideo, FileAudio, FileQuestion, ArrowRight, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FileType = 'image' | 'video' | 'audio' | 'other';
interface MediaFile {
  _id: string;
  filename: string;
  file_type: FileType;
  owner_email: string;
  upload_date: string;
}

const mockRecentMedia: MediaFile[] = [
  { _id: 'file_2', filename: 'vacation_photo_2.jpg', file_type: 'image', owner_email: 'user2@corporate.com', upload_date: new Date(Date.now() - 1 * 3600000).toISOString() },
  { _id: 'file_3', filename: 'meeting_recording_3.mp4', file_type: 'video', owner_email: 'user3@corporate.com', upload_date: new Date(Date.now() - 2 * 3600000).toISOString() },
  { _id: 'file_4', filename: 'podcast_episode_4.mp3', file_type: 'audio', owner_email: 'user4@corporate.com', upload_date: new Date(Date.now() - 3 * 3600000).toISOString() },
  { _id: 'file_7', filename: 'product_shot_7.jpg', file_type: 'image', owner_email: 'user2@corporate.com', upload_date: new Date(Date.now() - 4 * 3600000).toISOString() },
  { _id: 'file_8', filename: 'onboarding_video_8.mp4', file_type: 'video', owner_email: 'user1@corporate.com', upload_date: new Date(Date.now() - 5 * 3600000).toISOString() },
];

const getFileIcon = (fileType: FileType) => {
  const props = { className: "w-5 h-5" };
  switch (fileType) {
    case 'image': return <FileImage {...props} />;
    case 'video': return <FileVideo {...props} />;
    case 'audio': return <FileAudio {...props} />;
    default: return <FileQuestion {...props} />;
  }
};

const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const uploadTime = new Date(dateString);
    const diffMs = now.getTime() - uploadTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? 'Just now' : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
};

export function RecentMediaCard() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMediaFiles(mockRecentMedia);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-lg shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Recent Media Uploads
        </h3>
        <Link href="/admin-panel/files" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="flex justify-center items-center h-60 text-slate-500">
            No recent media files.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {mediaFiles.map(file => (
              <li key={file._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
                    file.file_type === 'image' && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                    file.file_type === 'video' && "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
                    file.file_type === 'audio' && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                  )}>
                    {getFileIcon(file.file_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={file.owner_email}>
                      by {file.owner_email}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {formatRelativeTime(file.upload_date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}