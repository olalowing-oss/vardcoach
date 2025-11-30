import { useState, useEffect } from 'react';

const PREFIX = 'vardcoachen-';

export function useLocalStorage(key, initialValue) {
  const prefixedKey = PREFIX + key;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(prefixedKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${prefixedKey}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${prefixedKey}":`, error);
    }
  }, [prefixedKey, storedValue]);

  return [storedValue, setStoredValue];
}

export function clearAllData() {
  const keys = ['diagnoses', 'medications', 'diary', 'appointments'];
  keys.forEach(key => localStorage.removeItem(PREFIX + key));
}
