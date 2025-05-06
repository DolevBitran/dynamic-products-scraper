import { STORAGE_KEYS } from "@utils/types";

// Get all state from storage
export const getStorageState = async (): Promise<StorageState> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(Object.values(STORAGE_KEYS), (result) => {
      resolve(result as StorageState);
    });
  });
};

// Set a specific state item
export const setStorageItem = async <K extends StorageKey>(
  key: K,
  value: any
): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
};

// Clear all stored state
export const clearStorage = async (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
};

// Save the entire app state
export const saveAppState = async (state: StorageState): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set(state, () => {
      resolve();
    });
  });
};
