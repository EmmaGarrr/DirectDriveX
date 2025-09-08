"use client";

import { File, FileArchive, FileAudio, FileCode, FileImage, FileText, FileVideo } from 'lucide-react';
import React from 'react';

export const getFileTypeInfo = (filename: string) => {
  if (!filename) return { Icon: File, color: 'text-gray-500', bgColor: 'bg-gray-100' };

  const extension = filename.split('.').pop()?.toLowerCase() || '';

  if (['pdf'].includes(extension)) {
    return { Icon: FileText, color: 'text-red-600', bgColor: 'bg-red-100' };
  }
  if (['zip', 'rar', '7z', 'tar'].includes(extension)) {
    return { Icon: FileArchive, color: 'text-purple-600', bgColor: 'bg-purple-100' };
  }
  if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) {
    return { Icon: FileVideo, color: 'text-green-600', bgColor: 'bg-green-100' };
  }
  if (['doc', 'docx', 'txt'].includes(extension)) {
    return { Icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' };
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return { Icon: FileImage, color: 'text-indigo-500', bgColor: 'bg-indigo-50' };
  }
  if (['mp3', 'wav', 'flac'].includes(extension)) {
    return { Icon: FileAudio, color: 'text-pink-500', bgColor: 'bg-pink-50' };
  }
  if (['js', 'ts', 'html', 'css', 'json'].includes(extension)) {
    return { Icon: FileCode, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  }

  return { Icon: File, color: 'text-gray-500', bgColor: 'bg-gray-100' };
};