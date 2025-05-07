import React from 'react';
import FieldsView from '@components/Dashboard/FieldsView';

const Fields: React.FC = () => {
  const handleAddField = () => {
    // Implement add field functionality
    console.log('Add field clicked');
  };

  return (
    <FieldsView onAddField={handleAddField} />
  );
};

export default Fields;
