import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@store/index';
import type { Field } from '@utils/types';
import FieldsTableRow from './FieldsTableRow';
import FieldModal from './FieldModal';
import '@styles/TableButtons.css';

interface FieldsTableProps {
  fields: Field[];
}

const FieldsTable: React.FC<FieldsTableProps> = ({ fields }) => {
  const dispatch = useDispatch<Dispatch>();
  const [originalFields, setOriginalFields] = useState<Record<string, Field>>({});
  const [currentFields, setCurrentFields] = useState<Record<string, Field>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Initialize fields data when component mounts or fields change
  useMemo(() => {
    const fieldsMap: Record<string, Field> = {};
    fields.forEach(field => {
      fieldsMap[field.id] = { ...field };
    });
    setOriginalFields(fieldsMap);
    setCurrentFields(fieldsMap);
  }, [fields]);

  // Check if a field is editable
  const isFieldEditable = (fieldName: string) => {
    return ['name', 'selector'].includes(fieldName);
  };

  // Handle content editable changes
  const handleContentChange = (fieldId: string, fieldName: string, content: string) => {
    setCurrentFields(prev => {
      // Create a deep copy of the previous field to avoid reference issues
      const updatedField = JSON.parse(JSON.stringify(prev[fieldId]));
      
      // Log the update for debugging
      console.log(`Updating field ${fieldId}, ${fieldName} to:`, content);
      console.log('Updated field:', updatedField);
      
      // Create a new state object to ensure React detects the change
      return { ...prev, [fieldId]: updatedField };
    });
  };

  // Check if fields have been edited
  const changedFields = useMemo(() => {
    const changed: Record<string, boolean> = {};
    
    Object.keys(currentFields).forEach(fieldId => {
      const original = originalFields[fieldId];
      const current = currentFields[fieldId];
      
      if (!original || !current) return;
      
      // Compare relevant fields
      const isDifferent = JSON.stringify(original) !== JSON.stringify(current);
      if (isDifferent) {
        changed[fieldId] = true;
      }
    });
    
    return changed;
  }, [originalFields, currentFields]);
  
  // Check if a specific field has changed
  const hasFieldChanged = (fieldId: string) => {
    return !!changedFields[fieldId];
  };

  // Save changes to a field
  const handleSaveField = (fieldId: string) => {
    const originalField = originalFields[fieldId];
    const currentField = currentFields[fieldId];

    if (!originalField || !currentField) return;

    // Dispatch update action with the current field
    dispatch.fields.updateField(currentField);

    // Update the original field to match the current one after saving
    setOriginalFields(prev => ({
      ...prev,
      [fieldId]: { ...currentField }
    }));
  };

  const handleDeleteField = (id: string) => {
    dispatch.fields.deleteField(id);
  };

  const handleEditField = (field: Field) => {
    setSelectedField(field);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddNewField = () => {
    setSelectedField(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedField(null);
  };

  return (
    <div className="table-section">
      {isModalOpen && (
        <FieldModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          mode={modalMode}
          field={selectedField || undefined}
        />
      )}

      <div className="table-header">
        <div className="table-title">
          <span className="menu-item-icon">🔧</span>
          <span>Fields</span>
        </div>
        <div className="table-actions">
          <button
            className="table-action-button table-action-button-primary"
            onClick={handleAddNewField}
          >
            Add Field
          </button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Field</th>
            <th>Selector</th>
            <th>Content Type</th>
            <th>Scrape Type</th>
            {/* <th>Required</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map(field => {
            // Use the currentFields state for the field data to ensure UI reflects latest changes
            const currentField = currentFields[field.id] || field;
            
            return (
              <FieldsTableRow
                key={field.id}
                field={currentField}
                isFieldEditable={isFieldEditable}
                hasChanged={hasFieldChanged(field.id)}
                onContentChange={handleContentChange}
                onSave={handleSaveField}
                onDelete={handleDeleteField}
                onEdit={() => handleEditField(currentField)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FieldsTable;
