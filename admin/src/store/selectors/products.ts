import type { RootState } from '@store/index';

// Products selectors
export const selectProducts = (state: RootState) => state.products.products;
export const selectProductsLoading = (state: RootState) => state.products.isLoading;
export const selectProductsError = (state: RootState) => state.products.error;

// Get a specific product by ID
export const selectProductById = (id: string) => (state: RootState) => 
  state.products.products.find(product => product.id === id);

// Get a function that counts products per website
export const selectProductCountByWebsite = (state: RootState) => {
  const products = state.products.products;
  
  // Return a function that takes a websiteId and returns the count
  return (websiteId: string): number => {
    return products.filter(product => {
      // Check if the product has a websites array
      if (!product.websites || !Array.isArray(product.websites)) {
        return false;
      }

      // Check if the websites array includes the websiteId
      return product.websites.some(website => {
        if (typeof website === 'string') {
          // If website is a string (ID), compare directly
          return website === websiteId;
        } else if (website && typeof website === 'object') {
          // If website is an object, check the id property
          return website.id === websiteId || website._id === websiteId;
        }
        return false;
      });
    }).length;
  };
};

// Combined selectors
export const selectProductsState = (state: RootState) => ({
  products: state.products.products,
  isLoading: state.products.isLoading,
  error: state.products.error,
});
