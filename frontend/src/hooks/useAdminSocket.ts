"use client";

import { useState, useEffect, useCallback } from 'react';
import { adminSocketService } from '@/services/adminSocketService';
import { useAdminAuth } from './useAdminAuth';
import { AdminNotification } from '@/types/admin';

export const useAdminSocket = () => {
  const [events, setEvents] = useState<string[]>([
    'Admin Dashboard initializing...',
    'System monitoring starting...',
    'Loading dashboard components...'
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const { adminUser } = useAdminAuth();
  
  const addEvent = useCallback((event: string) => {
    setEvents(prev => {
      const newEvents = [event, ...prev];
      // Keep only the last 100 events for performance
      return newEvents.slice(0, 100);
    });
  }, []);
  
  const clearEvents = useCallback(() => {
    setEvents(['Event log cleared']);
  }, []);
  
  // Add multiple events with timestamps
  const addBulkEvents = useCallback((newEvents: string[]) => {
    setEvents(prev => {
      const combinedEvents = [...newEvents, ...prev];
      return combinedEvents.slice(0, 100);
    });
  }, []);
  
  // Parse notification from event data
  const parseNotification = useCallback((eventData: string): AdminNotification | null => {
    try {
      // Check if event looks like a notification (basic heuristic)
      if (eventData.includes('NOTIFICATION:')) {
        const cleanData = eventData.replace('NOTIFICATION:', '').trim();
        const data = JSON.parse(cleanData);
        
        // Validate expected notification format
        if (data.title && data.message && data.type) {
          return {
            id: `socket-${Date.now()}`,
            title: data.title,
            message: data.message,
            type: data.type as 'info' | 'warning' | 'error' | 'success',
            timestamp: new Date()
          };
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to parse notification from event:', error);
      return null;
    }
  }, []);
  
  useEffect(() => {
    // Initial load - show dashboard loading message
    addEvent('Dashboard initialized successfully');
    
    if (!adminUser) {
      addEvent('Waiting for admin authentication...');
      return;
    }
    
    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      addEvent('No admin token found - authentication required');
      return;
    }
    
    // Connect to WebSocket or simulation mode
    try {
      // Connect to WebSocket
      adminSocketService.connect(token);
      addEvent('Event stream connection initiated');
      
      // Set up event handlers
      const removeEventHandler = adminSocketService.onEvent(event => {
        addEvent(event);
      });
      
      const removeConnectionHandler = adminSocketService.onConnectionChange(connected => {
        setIsConnected(connected);
        if (connected && !isConnected) {
          addEvent('Event stream connected successfully');
        } else if (!connected && isConnected) {
          addEvent('Event stream disconnected - will attempt reconnection');
        }
      });
      
      // Clean up on unmount
      return () => {
        removeEventHandler();
        removeConnectionHandler();
        adminSocketService.disconnect();
        console.log('Admin socket event handlers cleaned up');
      };
    } catch (error) {
      console.error('Failed to set up admin socket:', error);
      addEvent('Error setting up event stream - using fallback mode');
    }
  }, [adminUser, addEvent, isConnected]);
  
  return {
    events,
    isConnected,
    clearEvents,
    addEvent,
    addBulkEvents,
    parseNotification
  };
};