import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { User, CreateUserRequest, UpdateUserSettingsRequest } from '../types/user';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_USER' };

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'CLEAR_USER':
      return { ...state, user: null };
    default:
      return state;
  }
}

interface UserContextType {
  state: UserState;
  fetchUser: () => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUserSettings: (settings: UpdateUserSettingsRequest) => Promise<void>;
  updateUserTier: (tier: string) => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const fetchUser = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/users/me');
      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_USER', payload: data.data });
      } else {
        throw new Error(data.error || 'Failed to fetch user');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_USER', payload: data.data });
      } else {
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateUserSettings = useCallback(async (settings: UpdateUserSettingsRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/users/me/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'UPDATE_USER', payload: data.data });
      } else {
        throw new Error(data.error || 'Failed to update user settings');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateUserTier = useCallback(async (tier: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/users/me/tier', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'UPDATE_USER', payload: data.data });
      } else {
        throw new Error(data.error || 'Failed to update user tier');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearUser = useCallback(() => {
    dispatch({ type: 'CLEAR_USER' });
  }, []);

  // Don't automatically fetch user on mount - wait for explicit setup
  // useEffect(() => {
  //   // Try to fetch user on mount
  //   fetchUser();
  // }, []);

  const value: UserContextType = {
    state,
    fetchUser,
    createUser,
    updateUserSettings,
    updateUserTier,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
