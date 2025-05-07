import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@components/Button/Button';
import { selectFields } from '@store/selectors';
import type { Dispatch } from '@store/index';
import type { Product as ProductType } from '@utils/types';
import ProductTableRow from './ProductTableRow';



interface Product extends ProductType {
  // Extending the Product type from types.ts
  [key: string]: any; // Allow dynamic property access
}

interface ProductTableProps {
  products: Product[];
  onAddProduct?: () => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onAddProduct }) => {
  const dispatch = useDispatch<Dispatch>();
  const fields = useSelector(selectFields);
  const [originalProducts, setOriginalProducts] = useState<Record<string, ProductType>>({});
  const [currentProducts, setCurrentProducts] = useState<Record<string, ProductType>>({});

  // Initialize products data when component mounts or products change
  useMemo(() => {
    const productsMap: Record<string, ProductType> = {};
    products.forEach(product => {
      productsMap[product.id] = { ...product };
    });
    setOriginalProducts(productsMap);
    setCurrentProducts(productsMap);
  }, [products]);

  // Check if a field is editable (title or text/link type)
  const isFieldEditable = (fieldName: string) => {
    if (fieldName === 'title') return true;

    const field = fields?.find(f => f.name === fieldName);
    // Note: Using 'type' instead of 'contentType' based on the Field interface in types.ts
    return field?.type === 'text' || field?.type === 'link';
  };

  // Handle content editable changes
  const handleContentChange = (productId: string, fieldName: string, content: string) => {
    setCurrentProducts(prev => {
      const updatedProduct = { ...prev[productId] };
      updatedProduct[fieldName] = content;
      return { ...prev, [productId]: updatedProduct };
    });
  };

  // Check if a product has been edited using useMemo
  const changedProducts = useMemo(() => {
    const changed: Record<string, boolean> = {};

    Object.keys(currentProducts).forEach(productId => {
      const original = originalProducts[productId];
      const current = currentProducts[productId];

      if (!original || !current) return;

      // Compare relevant fields
      const isDifferent = JSON.stringify(original) !== JSON.stringify(current);
      if (isDifferent) {
        changed[productId] = true;
      }
    });

    return changed;
  }, [originalProducts, currentProducts]);

  // Check if a specific product has changed
  const hasProductChanged = (productId: string) => {
    return !!changedProducts[productId];
  };

  // Save changes to a product
  const handleSaveProduct = (productId: string) => {
    const originalProduct = originalProducts[productId];
    const currentProduct = currentProducts[productId];

    if (!originalProduct || !currentProduct) return;

    // Dispatch update action with the current product
    dispatch.products.updateProduct(currentProduct);

    // Update the original product to match the current one after saving
    setOriginalProducts(prev => ({
      ...prev,
      [productId]: { ...currentProduct }
    }));
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch.products.deleteProduct(id);
    }
  };

  // Determine which additional columns to display based on available fields
  const getAdditionalColumns = () => {
    if (!fields || fields.length === 0) return [];

    // Default columns that are already handled separately
    const defaultColumns = ['title', 'id'];

    return fields
      .filter(field => field && field.fieldName && field.contentType === 'text' && !defaultColumns.includes(field.fieldName.toLowerCase()))
      .map(field => field.fieldName);
  };

  const additionalColumns = getAdditionalColumns();
  return (
    <div className="table-section">
      <div className="table-header">
        <div className="table-title">
          <span className="menu-item-icon">📦</span>
          <span>Products</span>
        </div>
        <div className="table-actions">
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={onAddProduct}
          >
            Add Product
          </Button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            {/* Render dynamic column headers from fields */}
            {additionalColumns.map(column => (
              <th key={column}>{column}</th>
            ))}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <ProductTableRow
              key={product.id}
              product={product}
              additionalColumns={additionalColumns}
              isFieldEditable={isFieldEditable}
              hasChanged={hasProductChanged(product.id)}
              onContentChange={handleContentChange}
              onSave={handleSaveProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
