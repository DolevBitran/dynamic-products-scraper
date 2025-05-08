import React, { useEffect } from 'react';
import ProductsView from '@components/Dashboard/ProductsView';
import { useDispatch, useSelector } from 'react-redux';
import { selectProducts } from '@store/selectors';
import type { Dispatch } from '@store/index';

const Products: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const products = useSelector(selectProducts);

  useEffect(() => {
    !products?.length && dispatch.products.fetchProducts();
  }, [dispatch.products]);


  const handleAddProduct = () => {
    // Implement add product functionality
    console.log('Add product clicked');
  };

  return (
    <ProductsView onAddProduct={handleAddProduct} />
  );
};

export default Products;
