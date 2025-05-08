import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@store/index';
import type { Field } from '@utils/types';
import '@styles/UserModal.css';

interface FieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  field?: Field;
  mode: 'create' | 'edit';
}

const FieldModal: React.FC<FieldModalProps> = ({ isOpen, onClose, field, mode = 'create' }) => {
  const dispatch = useDispatch<Dispatch>();
  const [formData, setFormData] = useState<Partial<Field>>({
    fieldName: '',
    selector: '',
    contentType: 'text',
    scrapeType: 'product',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when field prop changes or modal opens
  useEffect(() => {
    if (field && mode === 'edit') {
      setFormData({
        fieldName: field.fieldName || '',
        selector: field.selector || '',
        contentType: field.contentType || 'text',
        scrapeType: field.scrapeType || 'product',
      });
    } else if (mode === 'create') {
      // Reset form when creating a new field
      setFormData({
        fieldName: '',
        selector: '',
        contentType: 'text',
        scrapeType: 'product',
      });
    }

    // Clear any previous errors
    setError(null);
  }, [field, mode, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.fieldName) {
      setError('Field name is required');
      return;
    }

    if (!formData.selector) {
      setError('Selector is required');
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        // Call the API to create a new field
        const fieldData = {
          fieldName: formData.fieldName || '',
          selector: formData.selector || '',
          contentType: formData.contentType || 'text',
          scrapeType: formData.scrapeType || 'product',
        };

        const result = await dispatch.fields.createField(fieldData);

        if (result) {
          // Reset form and close modal on success
          setFormData({
            fieldName: '',
            selector: '',
            contentType: 'text',
            scrapeType: 'product',
          });
          onClose();
        } else {
          setError('Failed to create field');
        }
      } else if (mode === 'edit' && field) {
        // Call the API to update an existing field
        const updateData: Field = {
          ...field,
          fieldName: formData.fieldName || field.fieldName,
          selector: formData.selector || field.selector,
          contentType: (formData.contentType as Field['contentType']) || field.contentType,
          scrapeType: (formData.scrapeType as Field['scrapeType']) || field.scrapeType,
        };

        const result = await dispatch.fields.updateField(updateData);

        if (result) {
          onClose();
        } else {
          setError('Failed to update field');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-modal-overlay">
      <div className="user-modal-container">
        <h2 className="user-modal-title">{mode === 'create' ? 'Add New Field' : 'Edit Field'}</h2>
        <p className="user-modal-subtitle">
          {mode === 'create'
            ? 'Enter the details for the new field'
            : 'Update the field information'}
        </p>

        {error && (
          <div className="user-modal-error">
            {error}
          </div>
        )}

        <form className="user-modal-form" onSubmit={handleSubmit}>
          <div className="user-form-group">
            <label htmlFor="fieldName" className="user-form-label">Field Name</label>
            <input
              type="text"
              id="fieldName"
              name="fieldName"
              value={formData.fieldName || ''}
              onChange={handleChange}
              className="user-form-input"
              placeholder="Enter field name"
            />
          </div>

          <div className="user-form-group">
            <label htmlFor="selector" className="user-form-label">CSS Selector</label>
            <input
              type="text"
              id="selector"
              name="selector"
              value={formData.selector || ''}
              onChange={handleChange}
              className="user-form-input"
              placeholder="Enter CSS selector"
            />
          </div>

          <div className="user-form-group">
            <label htmlFor="contentType" className="user-form-label">Content Type</label>
            <select
              id="contentType"
              name="contentType"
              value={formData.contentType || 'text'}
              onChange={handleChange}
              className="user-form-select"
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="link">Link</option>
            </select>
          </div>

          <div className="user-form-group">
            <label htmlFor="scrapeType" className="user-form-label">Scrape Type</label>
            <select
              id="scrapeType"
              name="scrapeType"
              value={formData.scrapeType || 'product'}
              onChange={handleChange}
              className="user-form-select"
            >
              <option value="product">Product</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div className="user-modal-buttons">
            <button
              type="submit"
              disabled={isSubmitting}
              className="user-modal-button"
            >
              {isSubmitting
                ? (mode === 'create' ? 'Creating...' : 'Updating...')
                : (mode === 'create' ? 'Create Field' : 'Update Field')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="user-modal-button-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldModal;
