import { useSelector } from 'react-redux';
import {
  selectProducts,
  selectProductsLoading,
  selectProductsError,
} from '@store/selectors';
import Button from '@components/Button/Button';
import ProductTable from '@components/Dashboard/ProductTable';
// Using ProductTable for rendering

interface ProductsViewProps {
  onAddProduct?: () => void;
}

const ProductsView = ({ onAddProduct }: ProductsViewProps) => {
  const products = useSelector(selectProducts);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);

  const handleAddProduct = () => {
    if (onAddProduct) {
      onAddProduct();
    }
  };

  // Note: Edit and delete functionality is now handled by the ProductTable component

  if (isLoading && products.length === 0) {
    return <div className="loading-container">Loading products...</div>;
  }

  if (error && products.length === 0) {
    return <div className="error-container">{error}</div>;
  }

  // Note: Dynamic column rendering is now handled by the ProductTable component

  return (
    <div className="products-view">
      <div className="products-header">
        <h2 className="text-xl font-semibold">Products</h2>
      </div>

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
