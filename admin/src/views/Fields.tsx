import React, { useEffect } from 'react';
import FieldsView from '@components/Dashboard/FieldsView';
import { useDispatch, useSelector } from 'react-redux';
import { selectFields } from '@store/selectors';
import type { Dispatch } from '@store/index';

const Fields: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const fields = useSelector(selectFields);

  useEffect(() => {
    !fields?.length && dispatch.fields.fetchFields();
  }, [dispatch.fields]);


  const handleAddField = () => {
    // Implement add field functionality
    console.log('Add field clicked');
  };

  return (
    <FieldsView onAddField={handleAddField} />
  );
};

export default Fields;
