import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../../shared/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { createTableService } from '../../shared/supabase/database-service';

interface UserProfile {
  id: string;
  user_id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department: string;
  employee_code: string;
  phone: string;
  location_id: string;
  manager_id: string;
  specialization: string;
  certification: string;
  skills: string;
  certifications: string;
  emergency_contact: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const userProfileService = createTableService('user_profiles');
      const result = await userProfileService.getByField('user_id', userId);
      if (result.data && result.data.length > 0) {
        setUserProfile(result.data[0] as UserProfile);
      } else {
        console.warn('No user profile found for user:', userId);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch user profile if user exists
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }

      setLoading(false);

      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        navigate('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
