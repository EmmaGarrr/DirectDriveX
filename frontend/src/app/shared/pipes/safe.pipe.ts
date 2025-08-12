import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Pipe({
  name: 'totalStorage'
})
export class TotalStoragePipe implements PipeTransform {
  transform(fileTypes: any[]): string {
    if (!fileTypes || fileTypes.length === 0) {
      return '0 B';
    }
    
    const totalBytes = fileTypes.reduce((sum, type) => sum + (type.total_size || 0), 0);
    
    if (totalBytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(totalBytes) / Math.log(k));
    
    return parseFloat((totalBytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
} 