import { useState } from 'react';
import { API_URL } from '@/config';

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<Record<number, User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (userId: number): Promise<User | null> => {
    if (users[userId]) {
      return users[userId];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch user');
      }

      const userData: User = await response.json();
      
      setUsers(prev => ({
        ...prev,
        [userId]: userData
      }));
      
      return userData;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = async (userId: number): Promise<string | null> => {
    const user = await fetchUser(userId);
    if (!user) return null;
    
    return user.full_name || user.username || `User #${userId}`;
  };

  return {
    users,
    isLoading,
    error,
    fetchUser,
    getUserName
  };
}