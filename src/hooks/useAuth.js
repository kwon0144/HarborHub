'use client';

import { useState, useEffect } from 'react';

// Authentication system that reads from localStorage (synced with Navbar)
export const useAuth = () => {
  const [authentication, setAuthentication] = useState('user'); // Default to 'user' for consistent SSR
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // Mark as hydrated and get authentication state from localStorage
    const getAuthFromLocalStorage = () => {
      try {
        // Check if we're in admin view (set by Navbar component)
        const isAdminView = localStorage.getItem('isAdminView') === 'true';
        
        // If admin view is enabled, set as admin, otherwise as user
        const role = isAdminView ? 'admin' : 'user';
        setAuthentication(role);
      } catch (error) {
        setAuthentication('user');
      }
    };

    // Mark as hydrated and perform initial check
    setIsHydrated(true);
    getAuthFromLocalStorage();

    // Listen for storage changes (when user switches view in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'isAdminView') {
        // Defer the state update to avoid setState during render
        setTimeout(() => {
          getAuthFromLocalStorage();
        }, 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when the view changes in the same tab
    const handleViewChange = () => {
      // Defer the state update to avoid setState during render
      setTimeout(() => {
        getAuthFromLocalStorage();
      }, 0);
    };
    
    window.addEventListener('adminViewChanged', handleViewChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminViewChanged', handleViewChange);
    };
  }, []);
  
  return { 
    authentication: isHydrated ? authentication : 'user', // Always return 'user' until hydrated
    isHydrated 
  };
};
