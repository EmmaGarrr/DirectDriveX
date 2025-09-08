"use client";

import { FileTypeAnalytics as FileTypeAnalyticsType, FileType } from "@/types/file-browser";
import { cn } from "@/lib/utils";
import { FileImage, FileVideo, FileText, FileArchive, FileAudio, FileQuestion } from "lucide-react";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
};

const fileTypeConfig: Record<FileType, { icon: React.ElementType; color: string }> = {
  image: { icon: FileImage, color: "bg-blue-500" },
  video: { icon: FileVideo, color: "bg-purple-500" },
  document: { icon: FileText, color: "bg-orange-500" },
  archive: { icon: FileArchive, color: "bg-pink-500" },
  audio: { icon: FileAudio, color: "bg-green-500" },
  other: { icon: FileQuestion, color: "bg-slate-500" },
};

export function FileTypeAnalytics({ data }: { data: FileTypeAnalyticsType['file_types'] }) {
  const totalFiles = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">File Type Analytics</h3>
      <div className="space-y-4">
        {data.map(item => {
          const percentage = totalFiles > 0 ? (item.count / totalFiles) * 100 : 0;
          const { icon: Icon, color } = fileTypeConfig[item._id as FileType];
          return (
            <div key={item._id}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                  <Icon className="w-4 h-4" />
                  <span>{item._id.charAt(0).toUpperCase() + item._id.slice(1)}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {item.count.toLocaleString()} files ({percentage.toFixed(0)}%) - {item.size_formatted}
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className={cn("h-2 rounded-full", color)} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}