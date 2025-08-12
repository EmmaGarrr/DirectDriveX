import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminStatsService } from '../../services/admin-stats.service';
import { interval, Subscription } from 'rxjs';

interface HetznerFileItem {
  _id: string;
  filename: string;
  size_bytes: number;
  size_formatted: string;
  content_type: string;
  file_type: string;
  upload_date: string;
  owner_email: string;
  status: string;
  storage_location: string;
  backup_status: string;
  backup_location: string;
  hetzner_remote_path: string;
  gdrive_account_id: string;
  download_url: string;
  preview_available?: boolean;
  health_status?: 'healthy' | 'corrupted' | 'inaccessible' | 'unknown';
  last_integrity_check?: string;
  sync_status?: 'synced' | 'syncing' | 'failed' | 'pending';
}

interface HetznerFileListResponse {
  files: HetznerFileItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  hetzner_stats: {
    total_files: number;
    total_storage: number;
    total_storage_formatted: string;
    recent_backups: number;
    failed_backups: number;
  };
}

interface HetznerFileTypeAnalytics {
  file_types: {
    _id: string;
    count: number;
    total_size: number;
    percentage: number;
    size_formatted: string;
  }[];
  total_files: number;
  backup_timeline: {
    date: string;
    count: number;
    total_size: number;
    size_formatted: string;
  }[];
  account_distribution: {
    account_id: string;
    count: number;
    total_size: number;
    size_formatted: string;
  }[];
}

@Component({
  selector: 'app-hetzner-file-management',
  templateUrl: './hetzner-file-management.component.html',
  styleUrls: ['./hetzner-file-management.component.css']
})
export class HetznerFileManagementComponent implements OnInit, OnDestroy {
  Math = Math; // Make Math available to template
  files: HetznerFileItem[] = [];
  selectedFiles: string[] = [];
  
  // Pagination
  currentPage = 1;
  pageSize = 50;
  totalFiles = 0;
  totalPages = 0;
  
  // Filters
  searchTerm = '';
  fileTypeFilter = '';
  ownerFilter = '';
  backupStatusFilter = '';
  sizeMinFilter: number | null = null;
  sizeMaxFilter: number | null = null;
  healthStatusFilter = '';
  syncStatusFilter = '';
  
  // Sorting
  sortBy = 'upload_date';
  sortOrder = 'desc';
  
  // UI state
  loading = false;
  error = '';
  showFilters = false;
  viewMode: 'list' | 'grid' = 'list';
  
  // Statistics
  hetznerStats: any = {};
  fileTypeAnalytics: HetznerFileTypeAnalytics | null = null;
  
  // Bulk actions
  showBulkActions = false;
  bulkActionType = '';
  bulkActionReason = '';
  
  // Auto-refresh
  private autoRefreshSubscription?: Subscription;
  autoRefreshEnabled = true;
  autoRefreshInterval = 30000; // 30 seconds
  
  // Enhanced file type detection
  detectedFileTypes: string[] = [];
  
  // Loading states
  refreshing = false;
  bulkActionLoading = false;

  constructor(
    private http: HttpClient,
    private adminAuthService: AdminAuthService,
    private adminStatsService: AdminStatsService
  ) {}
  
  ngOnInit(): void {
    this.loadFiles();
    this.loadFileTypeAnalytics();
    this.startAutoRefresh();
    this.adminStatsService.triggerStatsUpdate();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  startAutoRefresh(): void {
    if (this.autoRefreshEnabled) {
      this.autoRefreshSubscription = interval(this.autoRefreshInterval).subscribe(() => {
        if (!this.loading && !this.refreshing) {
          this.refreshData();
        }
      });
    }
  }

  stopAutoRefresh(): void {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  refreshData(): void {
    this.refreshing = true;
    Promise.all([
      this.loadFiles(),
      this.loadFileTypeAnalytics()
    ]).finally(() => {
      this.refreshing = false;
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.adminAuthService.getAdminToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  loadFiles(): void {
    this.loading = true;
    this.error = '';
    
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString())
      .set('sort_by', this.sortBy)
      .set('sort_order', this.sortOrder);
    
    if (this.searchTerm) {
      params = params.set('search', this.searchTerm);
    }
    if (this.fileTypeFilter) {
      params = params.set('file_type', this.fileTypeFilter);
    }
    if (this.ownerFilter) {
      params = params.set('owner_email', this.ownerFilter);
    }
    if (this.backupStatusFilter) {
      params = params.set('backup_status', this.backupStatusFilter);
    }
    if (this.healthStatusFilter) {
      params = params.set('health_status', this.healthStatusFilter);
    }
    if (this.syncStatusFilter) {
      params = params.set('sync_status', this.syncStatusFilter);
    }
    if (this.sizeMinFilter !== null) {
      const sizeMinBytes = this.sizeMinFilter * 1024 * 1024;
      params = params.set('size_min', sizeMinBytes.toString());
    }
    if (this.sizeMaxFilter !== null) {
      const sizeMaxBytes = this.sizeMaxFilter * 1024 * 1024;
      params = params.set('size_max', sizeMaxBytes.toString());
    }
    
    this.http.get<HetznerFileListResponse>(`${environment.apiUrl}/api/v1/admin/hetzner/files`, { 
      params,
      headers: this.getAuthHeaders()
    })
      .subscribe({
        next: (response) => {
          this.files = response.files;
          this.totalFiles = response.total;
          this.totalPages = response.total_pages;
          this.hetznerStats = response.hetzner_stats;
          this.loading = false;
          this.updateDetectedFileTypes();
        },
        error: (error) => {
          this.error = 'Failed to load Hetzner files. Please try again.';
          this.loading = false;
          console.error('Error loading Hetzner files:', error);
        }
      });
  }
  
  loadFileTypeAnalytics(): void {
    this.http.get<HetznerFileTypeAnalytics>(`${environment.apiUrl}/api/v1/admin/hetzner/analytics`, {
      headers: this.getAuthHeaders()
    })
      .subscribe({
        next: (response) => {
          this.fileTypeAnalytics = response;
        },
        error: (error) => {
          console.error('Error loading Hetzner analytics:', error);
        }
      });
  }

  updateDetectedFileTypes(): void {
    const types = new Set<string>();
    this.files.forEach(file => {
      if (file.file_type && file.file_type !== 'unknown') {
        types.add(file.file_type);
      }
    });
    this.detectedFileTypes = Array.from(types).sort();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadFiles();
  }
  
  onFilterChange(): void {
    this.currentPage = 1;
    this.loadFiles();
  }
  
  onSortChange(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'desc';
    }
    this.loadFiles();
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadFiles();
  }
  
  toggleFileSelection(fileId: string): void {
    const index = this.selectedFiles.indexOf(fileId);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    } else {
      this.selectedFiles.push(fileId);
    }
    this.showBulkActions = this.selectedFiles.length > 0;
  }
  
  selectAllFiles(): void {
    if (this.selectedFiles.length === this.files.length) {
      this.selectedFiles = [];
    } else {
      this.selectedFiles = this.files.map(f => f._id);
    }
    this.showBulkActions = this.selectedFiles.length > 0;
  }
  
  downloadFile(file: HetznerFileItem): void {
    const token = this.adminAuthService.getAdminToken();
    if (token) {
      const downloadUrl = `${environment.apiUrl}${file.download_url}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  // === FILE OPERATIONS ===
  
  checkFileIntegrity(file: HetznerFileItem): void {
    const operationData = {
      operation: 'integrity_check',
      reason: 'Manual integrity check from Hetzner management'
    };
    
    this.http.post(`${environment.apiUrl}/api/v1/admin/files/${file._id}/operation`, operationData, {
      headers: this.getAuthHeaders()
    })
      .subscribe({
        next: (response: any) => {
          const result = response.integrity_check;
          const status = result.status;
          
          if (status === 'verified') {
            alert(`File integrity check passed!\n\nStatus: ${status}\nChecksum match: ${result.checksum_match}\nLast check: ${new Date(result.last_check).toLocaleString()}`);
          } else if (status === 'corrupted') {
            alert(`WARNING: File integrity check failed!\n\nStatus: ${status}\nCorruption detected: ${result.corruption_detected}\nCorruption type: ${result.corruption_type || 'Unknown'}\n\nPlease consider recovering from backup.`);
          } else if (status === 'inaccessible') {
            alert(`ERROR: File is inaccessible!\n\nStatus: ${status}\nError: ${result.error}\n\nFile may need to be recovered from backup.`);
          }
        },
        error: (error) => {
          alert('Failed to check file integrity');
          console.error('Error checking file integrity:', error);
        }
      });
  }
  
  recoverFile(file: HetznerFileItem): void {
    if (confirm(`Recover "${file.filename}" from Hetzner backup? This will restore the file if it's corrupted or missing.`)) {
      const reason = prompt('Reason for file recovery (optional):');
      
      const operationData = {
        operation: 'recover',
        reason: reason || undefined
      };
      
      this.http.post(`${environment.apiUrl}/api/v1/admin/files/${file._id}/operation`, operationData, {
        headers: this.getAuthHeaders()
      })
        .subscribe({
          next: (response: any) => {
            alert('File recovered successfully from Hetzner backup!');
            this.loadFiles(); // Refresh the file list
          },
          error: (error) => {
            if (error.error?.detail?.includes('no completed backup')) {
              alert('Cannot recover file: No completed backup available');
            } else {
              alert('Failed to recover file');
            }
            console.error('Error recovering file:', error);
          }
        });
    }
  }
  
  previewFile(file: HetznerFileItem): void {
    if (file.preview_available) {
      this.http.get(`${environment.apiUrl}/api/v1/admin/files/${file._id}/preview`, {
        headers: this.getAuthHeaders()
      })
        .subscribe({
          next: (previewData: any) => {
            // Open preview in modal or new window
            window.open(previewData.preview_url, '_blank');
          },
          error: (error) => {
            console.error('Error loading preview:', error);
          }
        });
    }
  }
  
  deleteFile(file: HetznerFileItem): void {
    if (confirm(`Are you sure you want to delete "${file.filename}" from Hetzner backup?`)) {
      const reason = prompt('Reason for deletion (optional):');
      
      let params = new HttpParams();
      if (reason) {
        params = params.set('reason', reason);
      }
      
      this.http.delete(`${environment.apiUrl}/api/v1/admin/files/${file._id}`, { 
        params,
        headers: this.getAuthHeaders()
      })
        .subscribe({
          next: () => {
            // Refresh both files and analytics to update storage stats
            this.loadFiles();
            this.loadFileTypeAnalytics();

            // Trigger admin panel stats update
            this.adminStatsService.triggerStatsUpdate();
            alert('File deleted successfully from Hetzner backup');
          },
          error: (error) => {
            alert('Failed to delete file from Hetzner backup');
            console.error('Error deleting file:', error);
          }
        });
    }
  }

  executeBulkAction(): void {
    if (!this.bulkActionType || this.selectedFiles.length === 0) {
      return;
    }
    
    this.bulkActionLoading = true;
    const actionData = {
      file_ids: this.selectedFiles,
      action: this.bulkActionType,
      reason: this.bulkActionReason || undefined
    };
    
    this.http.post(`${environment.apiUrl}/api/v1/admin/files/bulk-action`, actionData, {
      headers: this.getAuthHeaders()
    })
      .subscribe({
        next: (response: any) => {
          alert(response.message);
          this.selectedFiles = [];
          this.showBulkActions = false;
          this.bulkActionType = '';
          this.bulkActionReason = '';
          this.loadFiles();
          this.loadFileTypeAnalytics();
          this.adminStatsService.triggerStatsUpdate();
          this.bulkActionLoading = false;
        },
        error: (error) => {
          alert('Bulk action failed');
          console.error('Error executing bulk action:', error);
          this.bulkActionLoading = false;
        }
      });
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.fileTypeFilter = '';
    this.ownerFilter = '';
    this.backupStatusFilter = '';
    this.healthStatusFilter = '';
    this.syncStatusFilter = '';
    this.sizeMinFilter = null;
    this.sizeMaxFilter = null;
    this.currentPage = 1;
    this.loadFiles();
  }
  
  getFileIcon(fileType: string): string {
    const icons: { [key: string]: string } = {
      'image': 'fas fa-image',
      'video': 'fas fa-video',
      'audio': 'fas fa-music',
      'document': 'fas fa-file-text',
      'archive': 'fas fa-file-archive',
      'other': 'fas fa-file'
    };
    return icons[fileType] || icons['other'];
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
  
  formatDateRelative(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }
  
  getBackupStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'none': 'Not Backed Up',
      'in_progress': 'Transferring to Hetzner',
      'completed': 'Backed Up to Hetzner',
      'failed': 'Backup Failed'
    };
    return statusMap[status] || status;
  }
  
  getBackupStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'none': 'status-pending',
      'in_progress': 'status-uploading',
      'completed': 'status-completed',
      'failed': 'status-failed'
    };
    return classMap[status] || 'status-unknown';
  }
  
  getHetznerPath(file: HetznerFileItem): string {
    return file.hetzner_remote_path || 'Unknown path';
  }

  // Enhanced file type detection
  detectFileType(filename: string, contentType: string): string {
    const extension = filename.toLowerCase().split('.').pop() || '';
    const mimeType = contentType.toLowerCase();
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension) || 
        mimeType.startsWith('image/')) {
      return 'image';
    }
    
    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension) || 
        mimeType.startsWith('video/')) {
      return 'video';
    }
    
    // Audio files
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(extension) || 
        mimeType.startsWith('audio/')) {
      return 'audio';
    }
    
    // Document files
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(extension) || 
        mimeType.includes('document') || mimeType.includes('text/')) {
      return 'document';
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension) || 
        mimeType.includes('archive') || mimeType.includes('compressed')) {
      return 'archive';
    }
    
    return 'other';
  }

  // Enhanced status indicators
  getHealthStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'healthy': 'status-healthy',
      'corrupted': 'status-corrupted',
      'inaccessible': 'status-inaccessible',
      'unknown': 'status-unknown'
    };
    return statusMap[status] || 'status-unknown';
  }

  getSyncStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'synced': 'status-synced',
      'syncing': 'status-syncing',
      'failed': 'status-failed',
      'pending': 'status-pending'
    };
    return statusMap[status] || 'status-unknown';
  }

  getHealthStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'healthy': 'Healthy',
      'corrupted': 'Corrupted',
      'inaccessible': 'Inaccessible',
      'unknown': 'Unknown'
    };
    return statusMap[status] || 'Unknown';
  }

  getSyncStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'synced': 'Synced',
      'syncing': 'Syncing...',
      'failed': 'Failed',
      'pending': 'Pending'
    };
    return statusMap[status] || 'Unknown';
  }

  // Enhanced file size formatting
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
} 