import { createModel } from '@rematch/core';
import { RootModel } from './types';
import { IRootState } from '@store/types';
import { getStorageState, setStorageItem } from '@service/storage';
import { STORAGE_KEYS } from '@utils/types';

export interface UIState {
  activeTab: string;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export const ui = createModel<RootModel>()({
  state: {
    activeTab: 'main',
    isLoading: false,
    isInitialized: false,
    error: null,
  } as UIState,

  reducers: {
    setActiveTab(state: UIState, payload: string) {
      return {
        ...state,
        activeTab: payload,
      };
    },
    setLoading(state: UIState, payload: boolean) {
      return {
        ...state,
        isLoading: payload,
      };
    },
    setInitialized(state: UIState, payload: boolean) {
      return {
        ...state,
        isInitialized: payload,
      };
    },
    setError(state: UIState, payload: string | null) {
      return {
        ...state,
        error: payload,
      };
    },
  },

  effects: (dispatch: any) => ({
    async updateActiveTab(tab: string) {
      dispatch.ui.setActiveTab(tab);

      // Store in Chrome storage
      await setStorageItem(STORAGE_KEYS.ACTIVE_TAB, tab);
    },

    // Initialize the application state from storage
    async initializeApp(_: void, rootState: IRootState) {
      if (rootState.ui.isInitialized) {
        return; // Prevent multiple initializations
      }

      dispatch.ui.setLoading(true);
      try {
        // Get stored state from Chrome storage
        const storedState = await getStorageState();
        console.log('Initializing app with stored state:', storedState);

        // Load fields from API
        await dispatch.fields.fetchFields();

        // Set active tab from storage if available
        if (storedState.activeTab) {
          dispatch.ui.setActiveTab(storedState.activeTab);
        }

        // Load scraped data from storage if available
        if (storedState.scrapedData) {
          dispatch.products.setScrapedData(storedState.scrapedData);
        }

        // Set up message listener for scraped data
        this.setupMessageListeners();

        // Mark as initialized
        dispatch.ui.setInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        dispatch.ui.setError('Failed to initialize application');
      } finally {
        dispatch.ui.setLoading(false);
      }
    },

    // Set up Chrome message listeners
    setupMessageListeners() {
      // Create a message handler function that adapts to our handleChromeMessage effect
      const messageHandler = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
        dispatch.ui.handleChromeMessage({ message, sender, sendResponse });
        return true; // Keep the message channel open for sendResponse
      };

      // Remove any existing listeners first to prevent duplicates
      chrome.runtime.onMessage.removeListener(messageHandler);

      // Add the message listener
      chrome.runtime.onMessage.addListener(messageHandler);

      console.log('Message listeners set up');
    },

    // Wrapper for Chrome message handling
    handleChromeMessage(payload: { message: any; sender: chrome.runtime.MessageSender; sendResponse: (response?: any) => void }) {
      const { message, sender: _sender, sendResponse: _sendResponse } = payload;
      console.log('Received message:', message);

      if (message.type === "SCRAPED_DATA") {
        dispatch.products.handleScrapedDataMessage({ message });
      }
    },
  }),
});
