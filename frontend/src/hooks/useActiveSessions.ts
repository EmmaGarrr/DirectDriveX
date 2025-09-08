import { useState, useCallback } from 'react';
import { 
  SessionManagement, 
  UseActiveSessionsReturn 
} from '@/types/security';
import { securityService } from '@/services/admin/securityService';

export const useActiveSessions = (): UseActiveSessionsReturn => {
  const [sessionManagement, setSessionManagement] = useState<SessionManagement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadActiveSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading active sessions...');
      const sessions = await securityService.getActiveSessions();
      setSessionManagement(sessions);
      console.log('Active sessions loaded successfully:', sessions.total_active);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load active sessions';
      setError(errorMessage);
      console.error('Error loading active sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const terminateSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Terminating session:', sessionId);
      await securityService.terminateSession(sessionId);
      
      // Update local state to remove the terminated session
      if (sessionManagement) {
        const updatedSessions = sessionManagement.active_sessions.filter(
          session => session.session_id !== sessionId
        );
        setSessionManagement({
          ...sessionManagement,
          active_sessions: updatedSessions,
          total_active: updatedSessions.length
        });
      }
      
      console.log('Session terminated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to terminate session';
      setError(errorMessage);
      console.error('Error terminating session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionManagement]);

  const terminateAllSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Terminating all sessions...');
      await securityService.terminateAllSessions();
      
      // Update local state to clear all sessions
      if (sessionManagement) {
        setSessionManagement({
          ...sessionManagement,
          active_sessions: [],
          total_active: 0
        });
      }
      
      console.log('All sessions terminated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to terminate all sessions';
      setError(errorMessage);
      console.error('Error terminating all sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionManagement]);

  const refreshSessions = useCallback(async () => {
    await loadActiveSessions();
  }, [loadActiveSessions]);

  return {
    sessionManagement,
    loading,
    error,
    loadActiveSessions,
    terminateSession,
    terminateAllSessions,
    refreshSessions
  };
};
