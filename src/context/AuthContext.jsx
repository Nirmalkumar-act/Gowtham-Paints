/* ============================================
   GOWTHAM PAINTS - Authentication Context
   ============================================ */

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from '../services/firebase';
import { syncUser, getUserRole } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Sync user with backend and get role
        try {
          const syncResult = await syncUser({
            firebase_uid: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            profile_photo: user.photoURL || ''
          });

          // Use role and profile from sync response if available
          if (syncResult.data && syncResult.data.role) {
            setUserRole(syncResult.data.role);
          }
          if (syncResult.data && syncResult.data.profile) {
            setUserProfile(syncResult.data.profile);
          } else {
            // Fallback: Get full user profile and role from /role endpoint
            const { data } = await getUserRole();
            if (data) {
              setUserRole(data.role);
              setUserProfile(data.profile);
            }
          }
        } catch (err) {
          console.error('Error syncing user:', err);
          // Default to 'user' role if backend is not available
          setUserRole('user');
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    try {
      const { data } = await getUserRole();
      if (data) {
        setUserRole(data.role);
        setUserProfile(data.profile);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    isAdmin: userRole === 'admin',
    isAuthenticated: !!currentUser,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
