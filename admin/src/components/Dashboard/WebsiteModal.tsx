import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@store/index';
import { WebsiteStatus } from '@store/models/websites';
import type { Website } from '@store/models/websites';
import '@styles/UserModal.css';

interface WebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  website?: Website;
}

const WebsiteModal: React.FC<WebsiteModalProps> = ({
  isOpen,
  onClose,
  mode,
  website
}) => {
  const dispatch = useDispatch<Dispatch>();
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    status: WebsiteStatus.ACTIVE as typeof WebsiteStatus[keyof typeof WebsiteStatus]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && website) {
      setFormData({
        name: website.name,
        url: website.url,
        status: website.status
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        url: '',
        status: WebsiteStatus.ACTIVE
      });
    }
    setError(null);
  }, [mode, website, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let result;

      if (mode === 'create') {
        result = await dispatch.websites.createWebsite(formData);
      } else if (mode === 'edit' && website) {
        // Use type assertion to resolve type mismatch
        result = await dispatch.websites.updateWebsite({
          id: website.id,
          data: {
            name: formData.name,
            url: formData.url,
            status: formData.status
          }
        } as any);
      }

      // Type guard for result
      if (result && typeof result === 'object' && 'success' in result)

      if (result && result.success) {
        onClose();
      } else if (result && result.error) {
        setError(result.error);
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
        <h2 className="user-modal-title">
          {mode === 'create' ? 'Add New Website' : 'Edit Website'}
        </h2>
        <p className="user-modal-subtitle">
          {mode === 'create'
            ? 'Enter the details for the new website'
            : 'Update the website information'}
        </p>

        {error && (
          <div className="user-modal-error">
            {error}
          </div>
        )}

        <form className="user-modal-form" onSubmit={handleSubmit}>
          <div className="user-form-group">
            <label htmlFor="name" className="user-form-label">Website Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter website name"
              className="user-form-input"
            />
          </div>

          <div className="user-form-group">
            <label htmlFor="url" className="user-form-label">Website URL</label>
            <input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="Enter website URL"
              className="user-form-input"
            />
          </div>

          <div className="user-form-group">
            <label htmlFor="status" className="user-form-label">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="user-form-select"
            >
              <option value={WebsiteStatus.ACTIVE}>Active</option>
              <option value={WebsiteStatus.INACTIVE}>Inactive</option>
            </select>
          </div>

          <div className="user-modal-buttons">
            <button
              type="submit"
              disabled={isSubmitting}
              className="user-modal-button"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
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

export default WebsiteModal;
