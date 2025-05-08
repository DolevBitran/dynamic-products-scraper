import { useSelector } from 'react-redux';
import {
  selectProducts,
  selectProductsLoading,
  selectProductsError,
} from '@store/selectors';
import ProductTable from '@components/Dashboard/ProductTable';

interface ProductsViewProps {
  onAddProduct?: () => void;
}

const ProductsView = ({ onAddProduct }: ProductsViewProps) => {
  const products = useSelector(selectProducts);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);

  if (isLoading && products.length === 0) {
    return <div className="loading-container">Loading products...</div>;
  }

  if (error && products.length === 0) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="products-view">

      {!products || products.length === 0 ? (
        <div className="no-products">
          <p>No products found. Add your first product to get started.</p>
        </div>
      ) : (
        <ProductTable
          products={products}
          onAddProduct={onAddProduct}
        />
      )}
    </div>
  );
};

export default ProductsView;
