import React from 'react';
import type { Product as ProductType } from '@utils/types';
import '@styles/TableButtons.css';

interface ProductTableRowProps {
  product: ProductType;
  additionalColumns: string[];
  isFieldEditable: (fieldName: string) => boolean;
  hasChanged: boolean;
  onContentChange: (productId: string, fieldName: string, content: string) => void;
  onSave: (productId: string) => void;
  onDelete: (productId: string) => void;
}

const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  additionalColumns,
  isFieldEditable,
  hasChanged,
  onContentChange,
  onSave,
  onDelete
}) => {

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(product.id);
    }
  };

  return (
    <tr>
      <td>{product.id}</td>
      <td className="user-cell">
        {product.image ? (
          <div className="user-avatar" style={{ backgroundImage: `url(${product.image})` }} />
        ) : (
          <div className="user-avatar">{product.title ? product.title.charAt(0) : '?'}</div>
        )}
        <div className="user-info">
          <input
            type="text"
            className="user-name w-full bg-white border border-gray-300 rounded px-2 py-1"
            value={product.title || ''}
            onChange={(e) => onContentChange(product.id, 'title', e.target.value)}
            placeholder="Unnamed Product"
          />
          {product.subtitle && <div className="user-email">{product.subtitle}</div>}
        </div>
      </td>
      {/* Render dynamic column data */}
      {additionalColumns.map(column => (
        <td key={`${product.id}-${column}`}>
          {isFieldEditable(column) ? (
            <input
              type="text"
              className="editable-cell w-full bg-white border border-gray-300 rounded px-2 py-1"
              value={product[column] || ''}
              onChange={(e) => onContentChange(product.id, column, e.target.value)}
              placeholder="-"
            />
          ) : (
            product[column] || '-'
          )}
        </td>
      ))}
      <td>
        {product.status ? (
          <span className={`status-cell status-${product.status}`}>
            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
          </span>
        ) : (
          <span className="status-cell status-inactive">Unknown</span>
        )}
      </td>
      <td>
        <div className="table-actions-container">
          {hasChanged ? (
            <button
              onClick={() => onSave(product.id)}
              className="table-action-button table-action-button-success"
            >
              Save
            </button>
          ) : null}
          <button
            onClick={handleDeleteClick}
            className="table-action-button table-action-button-danger"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductTableRow;
