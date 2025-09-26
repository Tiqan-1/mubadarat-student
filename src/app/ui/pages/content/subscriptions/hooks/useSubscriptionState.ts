import { useState, useEffect, useCallback } from 'react';

// Define the shape of our stored data
interface LastVisitedState {
  levelId: string;
  taskId: string;
  itemId: string;
}

type HistoryStore = Record<string, LastVisitedState>; // Keyed by subscriptionId
type CompletionStore = Record<string, string[]>; // Keyed by subscriptionId, value is array of itemIds

// Helper function to safely get data from localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

const HISTORY_KEY = 'subscriptionHistory';
const COMPLETION_KEY = 'subscriptionCompletion';

export function useSubscriptionState() {
  // State for the entire history object (all subscriptions)
  const [history, setHistory] = useState<HistoryStore>(() => getFromStorage(HISTORY_KEY, {}));

  // State for the entire completion object (all subscriptions)
  const [completion, setCompletion] = useState<CompletionStore>(() => getFromStorage(COMPLETION_KEY, {}));

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Persist completion status to localStorage whenever it changes
  useEffect(() => {
    window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(completion));
  }, [completion]);

  // Memoized function to update the history for a specific subscription
  const saveLastVisited = useCallback((subscriptionId: string, state: LastVisitedState) => {
    setHistory(prev => ({ ...prev, [subscriptionId]: state }));
  }, []);

  // Memoized function to mark a item as complete for a specific subscription
  const markItemAsCompleted = useCallback((subscriptionId: string, itemId: string) => {
    setCompletion(prev => {
      const currentCompleted = prev[subscriptionId] || [];
      if (currentCompleted.includes(itemId)) {
        return prev; // No change needed
      }
      return {
        ...prev,
        [subscriptionId]: [...currentCompleted, itemId],
      };
    });
  }, []);
  
  // Memoized function to get completed items (lessons/assignments) as a Set for efficient lookups
  const getCompletedItemsSet = useCallback((subscriptionId: string | null): Set<string> => {
    if (!subscriptionId || !completion[subscriptionId]) {
      return new Set();
    }
    return new Set(completion[subscriptionId]);
  }, [completion]);


  return {
    history,
    saveLastVisited,
    markItemAsCompleted,
    getCompletedItemsSet,
  };
}