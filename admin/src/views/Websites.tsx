import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@components/Button/Button';
import type { Dispatch } from '@store/index';
import { selectWebsitesState } from '@store/selectors/websites';
import WebsitesTable from '@components/Dashboard/WebsitesTable';
import WebsiteModal from '@components/Dashboard/WebsiteModal';
import { selectUsers } from '@store/selectors/users';
import Loading from '@components/Loading/Loading';
import { selectProducts } from '@store/selectors';

const Websites: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const { websites, isLoading, error } = useSelector(selectWebsitesState);
  const users = useSelector(selectUsers);
  const products = useSelector(selectProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    !websites?.length && dispatch.websites.fetchWebsites();
    !users?.length && dispatch.users.fetchUsers();
    !products?.length && dispatch.products.fetchProducts();
  }, [dispatch.websites]);

  const handleAddWebsite = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading && websites.length === 0) {
    return <Loading />
  }

  if (error && websites.length === 0) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="websites-view">
      <div className="websites-header">
        <h2 className="text-xl font-semibold">Websites</h2>
        <Button onClick={handleAddWebsite} variant="default">Add New Website</Button>
      </div>

      {!websites || websites.length === 0 ? (
        <div className="no-websites">
          <p>No websites found. Add your first website to get started.</p>
        </div>
      ) : (
        <WebsitesTable websites={websites} />
      )}

      {/* Website Modal */}
      <WebsiteModal isOpen={isModalOpen} onClose={handleCloseModal} mode="create" />
    </div>
  );
};

export default Websites;
