import { useState, useEffect } from "react";

import { decryptData, encryptData } from "@/utils/encryptDecrypt";

export function useLocalStorageStateWithEncryption<T>(
  initialState: T,
  key: string
) {
  // Lazy initializer to load from local storage
  const [value, setValue] = useState<T>(() => {
    const encryptedData = localStorage.getItem(key);
    if (encryptedData) {
      try {
        const decryptedString = decryptData(encryptedData);
        return JSON.parse(decryptedString);
      } catch (error) {
        console.error("Error decrypting local storage data:", error);
      }
    }
    return initialState;
  });

  useEffect(() => {
    try {
      const valueToStore = JSON.stringify(value);
      const encryptedData = encryptData(valueToStore);
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      console.error("Error encrypting or saving data:", error);
    }
  }, [value, key]);

  return [value, setValue] as const;
}

export function useLocalStorageState<T>(initialState: T, key: string) {
  const [value, setValue] = useState(initialState);

  useEffect(() => {
    const storedValue = JSON.parse(localStorage.getItem(key));
    setValue(storedValue ? storedValue : initialState);
  }, [key, initialState]);

  useEffect(() => {
    if (!value) return;
    const valueToStore = value ? JSON.stringify(value) : null;
    localStorage.setItem(key, valueToStore);
  }, [value, key]);

  return [value, setValue];
}
