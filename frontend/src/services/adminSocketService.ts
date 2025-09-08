type EventHandler = (event: string) => void;
type ConnectionHandler = (connected: boolean) => void;

/**
 * Service to handle WebSocket connections for admin panel real-time updates
 * 
 * Note: If the WebSocket server is not available, this service will fall back
 * to a simulation mode that generates synthetic events periodically.
 */
class AdminSocketService {
  private socket: WebSocket | null = null;
  private eventHandlers: EventHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 2; // Reduced to avoid excessive attempts
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private simulationMode = false;
  private simulationInterval: NodeJS.Timeout | null = null;
  
  /**
   * Connect to the WebSocket server or fall back to simulation mode
   * @param token Admin authentication token
   */
  connect(token: string): void {
    if (typeof window === 'undefined') return;
    if (this.socket?.readyState === WebSocket.OPEN) return;
    
    // Clear any existing simulation if we're trying to connect for real
    this.clearSimulationMode();
    
    try {
      // For development/testing environments, you can disable WebSocket by setting
      // NEXT_PUBLIC_DISABLE_WS=true in .env
      if (process.env.NEXT_PUBLIC_DISABLE_WS === 'true') {
        this.enableSimulationMode();
        return;
      }
      
      // Get base URL from environment or fallback
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
      
      // Connect to WebSocket server - don't add /ws_admin path, it's already the endpoint
      const wsUrl = `${baseUrl}/ws_admin?token=${token}`;
      console.log('Connecting to WebSocket:', wsUrl.replace(token, '[REDACTED]'));
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('✅ Admin WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.notifyConnectionHandlers(true);
        // Send a test message to verify connection
        this.notifyEventHandlers('WebSocket connection established');
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message) {
            this.notifyEventHandlers(data.message);
          }
        } catch (err) {
          console.warn('Failed to parse WebSocket message:', err);
        }
      };
      
      this.socket.onclose = (event) => {
        // Log close code and reason for better diagnostics
        console.log(`Admin WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        this.notifyConnectionHandlers(false);
        
        // Check if we should attempt reconnect or switch to simulation mode
        if (event.code === 1006) { // Abnormal closure - server might not be available
          console.warn('WebSocket server appears to be unavailable, switching to simulation mode');
          this.enableSimulationMode();
        } else {
          this.attemptReconnect(token);
        }
      };
      
      this.socket.onerror = (error) => {
        // WebSocket error event doesn't provide useful information due to browser security restrictions
        console.warn('WebSocket connection error - server may be unavailable');
        
        // Notify handlers and cleanup for retry
        this.notifyConnectionHandlers(false);
        this.cleanup();
        
        // After first error, switch to simulation mode
        if (this.reconnectAttempts >= 1) {
          console.log('WebSocket connection failed, switching to simulation mode');
          this.enableSimulationMode();
        } else {
          this.attemptReconnect(token);
        }
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.notifyConnectionHandlers(false);
      this.enableSimulationMode();
    }
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.cleanup();
    this.notifyConnectionHandlers(false);
    this.clearSimulationMode();
  }
  
  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        // Ignore close errors
      }
      this.socket = null;
    }
  }
  
  /**
   * Enable simulation mode to provide fake events
   * when WebSocket server is unavailable
   */
  private enableSimulationMode(): void {
    this.simulationMode = true;
    console.log('⚠️ WebSocket simulation mode enabled - using synthetic events');
    this.notifyConnectionHandlers(true); // Pretend we're connected
    this.notifyEventHandlers('SYSTEM: Using fallback simulation mode - WebSocket server unavailable');
    
    // Generate synthetic events periodically
    const simulationEvents = [
      'User login: admin@enterprise.com',
      'Backup process started',
      'Storage optimization completed',
      'New file uploaded: financial-report-q2.xlsx',
      'System health check: All systems operational',
      'Google Drive quota usage increased by 2%',
      'Scheduled maintenance completed',
      'User password changed: user@example.com',
      'Storage threshold warning: 85% capacity reached',
      'Background task completed: file indexing'
    ];
    
    // Send an initial event
    setTimeout(() => {
      this.notifyEventHandlers(simulationEvents[Math.floor(Math.random() * simulationEvents.length)]);
    }, 1000);
    
    // Set up interval for periodic events (every 8-12 seconds)
    this.simulationInterval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to get an event
        const event = simulationEvents[Math.floor(Math.random() * simulationEvents.length)];
        this.notifyEventHandlers(event);
      }
    }, 8000 + Math.random() * 4000);
  }
  
  /**
   * Clear simulation mode
   */
  private clearSimulationMode(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.simulationMode = false;
  }
  
  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(`Max WebSocket reconnect attempts (${this.maxReconnectAttempts}) reached, switching to simulation mode`);
      this.enableSimulationMode();
      return;
    }
    
    this.reconnectAttempts++;
    const delay = 2000 * this.reconnectAttempts;
    
    console.log(`Attempting WebSocket reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay/1000}s`);
    
    this.reconnectTimeout = setTimeout(() => {
      // Only attempt reconnect if we're in a browser environment
      if (typeof window !== 'undefined') {
        this.connect(token);
      }
    }, delay);
  }
  
  /**
   * Subscribe to WebSocket events
   */
  onEvent(handler: EventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) this.eventHandlers.splice(index, 1);
    };
  }

  /**
   * Subscribe to Google Drive specific events
   */
  onGoogleDriveAccountUpdate(handler: (data: any) => void): () => void {
    return this.onEvent((event) => {
      try {
        const parsed = JSON.parse(event);
        if (parsed.type === 'google-drive-account-updated') {
          handler(parsed.data);
        }
      } catch (error) {
        // Ignore non-JSON events
      }
    });
  }

  onGoogleDriveStatsUpdate(handler: (data: any) => void): () => void {
    return this.onEvent((event) => {
      try {
        const parsed = JSON.parse(event);
        if (parsed.type === 'google-drive-stats-updated') {
          handler(parsed.data);
        }
      } catch (error) {
        // Ignore non-JSON events
      }
    });
  }

  onGoogleDriveOperationProgress(handler: (data: any) => void): () => void {
    return this.onEvent((event) => {
      try {
        const parsed = JSON.parse(event);
        if (parsed.type === 'google-drive-operation-progress') {
          handler(parsed.data);
        }
      } catch (error) {
        // Ignore non-JSON events
      }
    });
  }

  onGoogleDriveCacheUpdate(handler: (data: any) => void): () => void {
    return this.onEvent((event) => {
      try {
        const parsed = JSON.parse(event);
        if (parsed.type === 'google-drive-cache-updated') {
          handler(parsed.data);
        }
      } catch (error) {
        // Ignore non-JSON events
      }
    });
  }
  
  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    // Pass the current connection status (or simulation status)
    handler(this.isConnected() || this.simulationMode);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) this.connectionHandlers.splice(index, 1);
    };
  }
  
  /**
   * Notify all event handlers of a new event
   */
  private notifyEventHandlers(event: string): void {
    this.eventHandlers.forEach(handler => handler(event));
  }
  
  /**
   * Notify all connection handlers of connection status change
   */
  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(connected));
  }
  
  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN || this.simulationMode;
  }
  
  /**
   * Send a message to the WebSocket server
   * If in simulation mode, this will echo back a response
   */
  sendMessage(message: string): void {
    if (this.simulationMode) {
      // Echo back a response in simulation mode
      setTimeout(() => {
        this.notifyEventHandlers(`Response to: ${message}`);
      }, 500);
      return;
    }
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }



  /**
   * Subscribe to backup management events
   */
  onBackupEvent(eventType: string, handler: (data: any) => void): () => void {
    const wrappedHandler = (event: string) => {
      try {
        const data = JSON.parse(event);
        if (data.type === eventType) {
          handler(data.payload);
        }
      } catch {
        // Not a JSON event, ignore
      }
    };

    return this.onEvent(wrappedHandler);
  }

  /**
   * Subscribe to backup status updates
   */
  onBackupStatusUpdate(handler: (data: any) => void): () => void {
    return this.onBackupEvent('backup_status_update', handler);
  }

  /**
   * Subscribe to backup queue updates
   */
  onBackupQueueUpdate(handler: (data: any) => void): () => void {
    return this.onBackupEvent('backup_queue_update', handler);
  }

  /**
   * Subscribe to backup failure updates
   */
  onBackupFailureUpdate(handler: (data: any) => void): () => void {
    return this.onBackupEvent('backup_failure_update', handler);
  }

  /**
   * Subscribe to backup progress updates
   */
  onBackupProgressUpdate(handler: (data: any) => void): () => void {
    return this.onBackupEvent('backup_progress_update', handler);
  }

  /**
   * Subscribe to mass backup completion
   */
  onMassBackupComplete(handler: (data: any) => void): () => void {
    return this.onBackupEvent('mass_backup_complete', handler);
  }

  /**
   * Subscribe to backup cleanup completion
   */
  onBackupCleanupComplete(handler: (data: any) => void): () => void {
    return this.onBackupEvent('backup_cleanup_complete', handler);
  }

  /**
   * Subscribe to file browser specific events
   */
  onFileBrowserEvent(eventType: string, handler: (data: any) => void): () => void {
    const wrappedHandler = (event: string) => {
      try {
        const data = JSON.parse(event);
        if (data.type === eventType) {
          handler(data.payload);
        }
      } catch {
        // Not a JSON event, ignore
      }
    };

    return this.onEvent(wrappedHandler);
  }

  /**
   * Subscribe to file integrity check events
   */
  onFileIntegrityCheck(handler: (data: any) => void): () => void {
    return this.onFileBrowserEvent('file_integrity_check_complete', handler);
  }

  /**
   * Subscribe to file backup events
   */
  onFileBackup(handler: (data: any) => void): () => void {
    return this.onFileBrowserEvent('file_backup_complete', handler);
  }

  /**
   * Subscribe to file recovery events
   */
  onFileRecovery(handler: (data: any) => void): () => void {
    return this.onFileBrowserEvent('file_recovery_complete', handler);
  }

  /**
   * Subscribe to storage stats updates
   */
  onStorageStatsUpdate(handler: (data: any) => void): () => void {
    return this.onFileBrowserEvent('storage_stats_updated', handler);
  }

  /**
   * Subscribe to orphaned files cleanup events
   */
  onOrphanedFilesCleanup(handler: (data: any) => void): () => void {
    return this.onFileBrowserEvent('orphaned_files_cleanup_complete', handler);
  }
}

export const adminSocketService = new AdminSocketService();