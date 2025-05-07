import React from 'react';
import ProductsView from '@components/Dashboard/ProductsView';

const Products: React.FC = () => {
  const handleAddProduct = () => {
    // Implement add product functionality
    console.log('Add product clicked');
  };

  return (
    <ProductsView onAddProduct={handleAddProduct} />
  );
};

export default Products;
