import { useSelector } from 'react-redux';
import { selectFields, selectFieldsLoading, selectFieldsError } from '@store/selectors';
import FieldsTable from './FieldsTable';

interface FieldsViewProps {
  onAddField?: () => void;
}

const FieldsView = ({ onAddField }: FieldsViewProps) => {
  const fields = useSelector(selectFields);
  const isLoading = useSelector(selectFieldsLoading);
  const error = useSelector(selectFieldsError);

  const handleAddField = () => {
    if (onAddField) {
      onAddField();
    }
  };

  // Field editing and deletion is now handled by the FieldsTable component

  if (isLoading && fields.length === 0) {
    return <div className="loading-container">Loading fields...</div>;
  }

  if (error && fields.length === 0) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="fields-view">
      {fields.length === 0 && !isLoading ? (
        <div className="no-fields">
          <p>No fields found. Add your first field to get started.</p>
        </div>
      ) : (
        <FieldsTable
          fields={fields}
          onAddField={handleAddField}
        />
      )}
    </div>
  );
};

export default FieldsView;
