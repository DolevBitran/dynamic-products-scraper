import React from 'react';
import Button from '@components/Button/Button';
import type { Field } from '@utils/types';

interface FieldsTableRowProps {
  field: Field;
  isFieldEditable: (fieldName: string) => boolean;
  hasChanged: boolean;
  onContentChange: (fieldId: string, fieldName: string, content: string) => void;
  onSave: (fieldId: string) => void;
  onDelete: (fieldId: string) => void;
}

const FieldsTableRow: React.FC<FieldsTableRowProps> = ({
  field,
  hasChanged,
  onContentChange,
  onSave,
  onDelete
}) => {
  return (
    <tr>
      <td>{field.id}</td>
      <td className="field-cell">
        <div className="field-info">
          <input
            type="text"
            className="field-name w-full bg-white border border-gray-300 rounded px-2 py-1"
            value={field.fieldName || ''}
            onChange={(e) => onContentChange(field.id, 'fieldName', e.target.value)}
            placeholder="Unnamed Field"
          />
        </div>
      </td>
      <td>
        <input
          type="text"
          className="editable-cell w-full bg-white border border-gray-300 rounded px-2 py-1"
          value={field.selector || ''}
          onChange={(e) => onContentChange(field.id, 'selector', e.target.value)}
          placeholder="-"
        />
      </td>
      <td>
        <select
          className="bg-white border border-gray-300 rounded px-2 py-1"
          value={field.contentType || 'text'}
          onChange={(e) => onContentChange(field.id, 'contentType', e.target.value)}
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="price">Price</option>
          <option value="link">Link</option>
        </select>
      </td>
      <td>
        <select
          className="bg-white border border-gray-300 rounded px-2 py-1"
          value={field.scrapeType || 'product'}
          onChange={(e) => onContentChange(field.id, 'scrapeType', e.target.value)}
        >
          <option value="product">Product</option>
          <option value="category">Category</option>
        </select>
      </td>
      {/* <td>
        <input
          type="checkbox"
          checked={field.isRequired}
          onChange={(e) => onContentChange(field.id, 'isRequired', e.target.checked.toString())}
        />
      </td> */}
      <td>
        <div className="flex gap-2">
          {hasChanged ? (
            <Button
              onClick={() => onSave(field.id)}
              variant="default"
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Save
            </Button>
          ) : null}
          <Button
            onClick={() => onDelete(field.id)}
            variant="destructive"
            size="sm"
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default FieldsTableRow;
