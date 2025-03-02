import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';
import { LoginCredentials, RegisterData, User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Échec de connexion');
      }

      router.push('/dashboard');
      return true;
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Échec de l\'inscription');
      }

      router.push('/login?registered=true');
      return true;
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      console.log('User data received:', userData); // Add this log
      
      // Make sure we're setting the ID correctly
      setUser({
        id: userData.id, // Make sure the backend returns this
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name || ''
      });
      
      return userData;
    } catch (err) {
      console.error('Error fetching current user:', err);
      setError('Failed to fetch user data');
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser
  };
}