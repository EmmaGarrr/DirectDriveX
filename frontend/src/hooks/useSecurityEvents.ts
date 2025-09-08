import { useState, useCallback } from 'react';
import { 
  SecurityEvent, 
  UseSecurityEventsReturn 
} from '@/types/security';
import { securityService } from '@/services/admin/securityService';

export const useSecurityEvents = (): UseSecurityEventsReturn => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSecurityEvents = useCallback(async (filters?: any) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading security events...', filters);
      const securityEvents = await securityService.getSecurityEvents(filters);
      setEvents(securityEvents);
      console.log('Security events loaded successfully:', securityEvents.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load security events';
      setError(errorMessage);
      console.error('Error loading security events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markEventResolved = useCallback(async (eventId: string) => {
    try {
      console.log('Marking security event as resolved:', eventId);
      
      // Update local state to mark event as resolved
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, resolved: true }
            : event
        )
      );
      
      console.log('Security event marked as resolved');
    } catch (err) {
      console.error('Error marking security event as resolved:', err);
      throw err;
    }
  }, []);

  const getSecurityAlerts = useCallback((): SecurityEvent[] => {
    return events.filter(event => 
      !event.resolved && 
      (event.severity === 'high' || event.severity === 'critical')
    );
  }, [events]);

  return {
    events,
    loading,
    error,
    loadSecurityEvents,
    markEventResolved,
    getSecurityAlerts
  };
};
