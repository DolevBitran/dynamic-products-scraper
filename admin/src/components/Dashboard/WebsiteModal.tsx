import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@store/index';
import { WebsiteStatus } from '@store/models/websites';
import type { Website } from '@store/models/websites';
import Input from '@components/Input/Input';
import Label from '@components/Label/Label';
import Button from '@components/Button/Button';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {mode === 'create' ? 'Add New Website' : 'Edit Website'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">Website Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter website name"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="Enter website URL"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={WebsiteStatus.ACTIVE}>Active</option>
              <option value={WebsiteStatus.INACTIVE}>Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebsiteModal;
