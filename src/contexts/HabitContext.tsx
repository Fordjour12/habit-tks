import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Habit, HabitCompletion, CreateHabitRequest, CompleteHabitRequest, SkipHabitRequest } from '../types/habit';

interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];
  loading: boolean;
  error: string | null;
}

type HabitAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'ADD_COMPLETION'; payload: HabitCompletion }
  | { type: 'SET_COMPLETIONS'; payload: HabitCompletion[] };

const initialState: HabitState = {
  habits: [],
  completions: [],
  loading: false,
  error: null,
};

function habitReducer(state: HabitState, action: HabitAction): HabitState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id ? action.payload : habit
        ),
      };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
      };
    case 'ADD_COMPLETION':
      return { ...state, completions: [...state.completions, action.payload] };
    case 'SET_COMPLETIONS':
      return { ...state, completions: action.payload };
    default:
      return state;
  }
}

interface HabitContextType {
  state: HabitState;
  fetchHabits: (tier?: string) => Promise<void>;
  createHabit: (habitData: CreateHabitRequest) => Promise<void>;
  completeHabit: (habitId: string, data: CompleteHabitRequest) => Promise<void>;
  skipHabit: (habitId: string, data: SkipHabitRequest) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(habitReducer, initialState);

  const fetchHabits = useCallback(async (tier?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const url = tier ? `/api/habits?tier=${tier}` : '/api/habits';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_HABITS', payload: data.data });
      } else {
        throw new Error(data.error || 'Failed to fetch habits');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createHabit = useCallback(async (habitData: CreateHabitRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'ADD_HABIT', payload: data.data });
      } else {
        throw new Error(data.error || 'Failed to create habit');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const completeHabit = useCallback(async (habitId: string, data: CompleteHabitRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.success) {
        dispatch({ type: 'ADD_COMPLETION', payload: responseData.data });
        // Refresh habits to update any progression
        await fetchHabits();
      } else {
        throw new Error(responseData.error || 'Failed to complete habit');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchHabits]);

  const skipHabit = useCallback(async (habitId: string, data: SkipHabitRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/habits/${habitId}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Refresh habits to update any penalties
        await fetchHabits();
      } else {
        throw new Error(responseData.error || 'Failed to skip habit');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchHabits]);

  const updateHabit = useCallback(async (habitId: string, updates: Partial<Habit>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'UPDATE_HABIT', payload: data.data });
      } else {
        throw new Error(data.error || 'Failed to update habit');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'DELETE_HABIT', payload: habitId });
      } else {
        throw new Error(data.error || 'Failed to delete habit');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Don't automatically fetch habits on mount - wait for explicit setup
  // useEffect(() => {
  //   fetchHabits();
  // }, []);

  const value: HabitContextType = {
    state,
    fetchHabits,
    createHabit,
    completeHabit,
    skipHabit,
    updateHabit,
    deleteHabit,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
