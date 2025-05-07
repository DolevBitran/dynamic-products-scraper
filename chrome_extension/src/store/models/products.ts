import { createModel } from '@rematch/core';
import { RootModel } from './types';
import { IRootState } from '@store/types';
import { setStorageItem } from '@service/storage';
import { STORAGE_KEYS, ScrapeType, ContentType } from '@utils/types';
import API from '@service/api';

export interface ProductsState {
  scrapedData: Product[];
  isLoading: boolean;
  error: string | null;
}

// Helper function to process scraped data based on field types
const processScrapedData = (data: Product[], fields: Field[]): Product[] => {
  return data.map(product => {
    const processedProduct: any = { ...product };

    // Process each field based on its contentType
    fields.forEach(field => {
      const fieldName = field.fieldName;
      const value = product[fieldName as keyof Product];

      if (value !== undefined) {
        // Process based on content type
        switch (field.contentType) {
          case ContentType.LINK:
            // Ensure links are properly formatted
            if (typeof value === 'string' && !value.startsWith('http')) {
              processedProduct[fieldName] = value.startsWith('/')
                ? `https://${window.location.hostname}${value}`
                : `https://${window.location.hostname}/${value}`;
            }
            break;

          case ContentType.IMAGE:
            // Ensure image URLs are properly formatted
            if (typeof value === 'string' && !value.startsWith('http')) {
              processedProduct[fieldName] = value.startsWith('/')
                ? `https://${window.location.hostname}${value}`
                : `https://${window.location.hostname}/${value}`;
            }
            break;

          // Add more content type processing as needed
        }
      }
    });

    return processedProduct;
  });
};

export const products = createModel<RootModel>()({
  state: {
    scrapedData: [],
    isLoading: false,
    error: null,
  } as ProductsState,

  reducers: {
    setScrapedData(state: ProductsState, payload: Product[]) {
      return {
        ...state,
        scrapedData: payload,
        isLoading: false,
        error: null,
      };
    },
    setLoading(state: ProductsState, payload: boolean) {
      return {
        ...state,
        isLoading: payload,
      };
    },
    setError(state: ProductsState, payload: string) {
      return {
        ...state,
        error: payload,
        isLoading: false,
      };
    },
  },

  effects: (dispatch: any) => ({
    async updateScrapedData(payload: Product[] | { products: Product[] }, rootState: IRootState) {
      dispatch.products.setLoading(true);
      try {
        // Handle both direct array and object with products property
        const products = Array.isArray(payload) ? payload : payload.products;

        // Get all fields to process the data
        const fields = rootState.fields.fieldsData;

        // Process the scraped data based on field types
        const processedProducts = processScrapedData(products, fields);

        // Update local state
        dispatch.products.setScrapedData(processedProducts);

        // Store in Chrome storage
        await setStorageItem(STORAGE_KEYS.SCRAPED_DATA, processedProducts);

        // Switch to results tab when we have new data
        dispatch.ui.setActiveTab('results');

        return processedProducts;
      } catch (error) {
        console.error('Error updating scraped data:', error);
        dispatch.products.setError('Failed to update scraped data');
        return [];
      }
    },

    async handleScrapedDataMessage(payload: ScrapedDataMessage | { message: ScrapedDataMessage }) {
      // Handle both direct message and object with message property
      const message = 'type' in payload ? payload : payload.message;

      if (message.type === "SCRAPED_DATA" && message.payload) {
        await dispatch.products.updateScrapedData(message.payload);
      }
    },

    initiateScraping(payload: { scrapeType?: ScrapeType } = {}) {
      // Set loading state
      dispatch.products.setLoading(true);

      // Get scrapeType from payload or use default
      const scrapeType = payload.scrapeType || ScrapeType.CATEGORY;

      // Get fields based on scrape type
      const fields = scrapeType === ScrapeType.CATEGORY
        ? dispatch.fields.getCategoryFields()
        : dispatch.fields.getProductFields();

      if (fields.length === 0) {
        console.warn(`No ${scrapeType} fields configured`);
        dispatch.products.setError(`No ${scrapeType} fields configured. Please add fields in the Fields tab.`);
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab.id) {
          console.error('No active tab found');
          dispatch.products.setError('No active tab found');
          return;
        }

        chrome.tabs.sendMessage(
          tab.id,
          { type: "MANUAL_SCRAPE", fields },
          (response) => {
            console.log({ response });
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
              dispatch.products.setError('Error initiating scraping: ' + chrome.runtime.lastError.message);
            }
          }
        );
      });
    },
    
    // Delete a product by ID
    async deleteProduct(productId: string, rootState: IRootState) {
      dispatch.products.setLoading(true);
      try {
        // Make API call to delete the product using URL parameter
        await API.delete(`/products/${productId}`);
        
        // Update local state after successful deletion
        const { scrapedData } = rootState.products;
        const updatedProducts = scrapedData.filter((product: Product) => product._id !== productId);
        
        // Update state and storage
        dispatch.products.setScrapedData(updatedProducts);
        await setStorageItem(STORAGE_KEYS.SCRAPED_DATA, updatedProducts);
        
        return true;
      } catch (error) {
        console.error('Error deleting product:', error);
        dispatch.products.setError('Failed to delete product');
        return false;
      }
    },
  }),
});
