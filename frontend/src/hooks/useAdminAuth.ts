"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthService } from '@/services/adminAuthService';
import { AdminLoginRequest, AdminUserInDB, AdminSession, UserRole } from '@/types/admin';

export function useAdminAuth() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUserInDB | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    // Force clear session when landing on admin login page
    const path = window.location.pathname;
    if (path === '/admin/login') {
      adminAuthService.forceClearSession();
    }

    // Check for authentication status
    const checkAuth = () => {
      const isAdminAuth = adminAuthService.isAdminAuthenticated();
      setIsAuthenticated(isAdminAuth);
      
      if (isAdminAuth) {
        // We have authentication, get admin data
        const adminData = adminAuthService.getCurrentAdmin();
        if (adminData) {
          setAdminUser(adminData);
        } else {
          // Try to load profile if we don't have it
          adminAuthService.loadAdminProfile()
            .then(data => setAdminUser(data))
            .catch(err => {
              console.error('Error loading admin profile:', err);
              // Don't clear authentication if profile load fails
            });
        }
        
        // Get current session
        const session = adminAuthService.getCurrentAdminSession();
        if (session) {
          setAdminSession(session);
        }
      } else {
        setAdminUser(null);
        setAdminSession(null);
      }
      
      setLoading(false);
    };
    
    // Initial check
    checkAuth();
    
    // Subscribe to authentication state changes
    const authSubscription = adminAuthService.isAdminAuthenticated$.subscribe(
      authState => {
        setIsAuthenticated(authState);
        if (authState) {
          // When authenticated, try to load admin data if not already loaded
          const adminData = adminAuthService.getCurrentAdmin();
          if (!adminData) {
            adminAuthService.loadAdminProfile()
              .then(data => setAdminUser(data))
              .catch(err => console.error('Error loading admin profile:', err));
          }
        } else {
          // When not authenticated, clear admin data
          setAdminUser(null);
          setAdminSession(null);
        }
        setLoading(false);
      }
    );
    
    // Subscribe to admin data changes
    const adminSubscription = adminAuthService.currentAdmin$.subscribe(
      admin => setAdminUser(admin)
    );
    
    // Subscribe to session changes
    const sessionSubscription = adminAuthService.adminSession$.subscribe(
      session => setAdminSession(session)
    );
    
    // Cleanup subscriptions
    return () => {
      authSubscription.unsubscribe();
      adminSubscription.unsubscribe();
      sessionSubscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = useCallback(async (credentials: AdminLoginRequest) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await adminAuthService.adminLogin(credentials);
      setIsAuthenticated(true);
      
      // Navigate to admin panel on success
      router.push('/admin-panel');
      
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during login');
      }
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Logout function
  const logout = useCallback(() => {
    adminAuthService.adminLogout();
    setIsAuthenticated(false);
    setAdminUser(null);
    setAdminSession(null);
    router.push('/admin/login');
  }, [router]);

  // Check if current admin is a superadmin
  const isSuperAdmin = useCallback(() => {
    return adminAuthService.isSuperAdmin();
  }, []);

  // Refresh session
  const refreshSession = useCallback(() => {
    adminAuthService.refreshAdminSession();
  }, []);

  // Force clear session
  const forceClearSession = useCallback(() => {
    adminAuthService.forceClearSession();
    setIsAuthenticated(false);
    setAdminUser(null);
    setAdminSession(null);
  }, []);

  return {
    loading,
    error,
    isAuthenticated,
    adminUser,
    adminSession,
    login,
    logout,
    isSuperAdmin,
    refreshSession,
    forceClearSession
  };
}
