import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Dispatch } from '@store/index';
import {
  selectUser,
  selectIsLoading,
  selectProducts,
  selectFields
} from '@store/selectors';
import { selectWebsites } from '@store/selectors/websites';
import StatCard from '@components/Dashboard/StatCard';
import FieldsView from '@components/Dashboard/FieldsView';
import ProductsView from '@components/Dashboard/ProductsView';
import { selectUsers } from '@store/selectors/users';

const Dashboard = () => {
  const dispatch = useDispatch<Dispatch>();
  const fields = useSelector(selectFields);
  const products = useSelector(selectProducts);
  const user = useSelector(selectUser);
  const users = useSelector(selectUsers);
  const websites = useSelector(selectWebsites);
  const isLoading = useSelector(selectIsLoading);
  const [activeSection, _setActiveSection] = useState('dashboard');

  useEffect(() => {
    !fields?.length && dispatch.fields.fetchFields();
    !products?.length && dispatch.products.fetchProducts();
    !users?.length && dispatch.users.fetchUsers();
    !websites?.length && dispatch.websites.fetchWebsites();
  }, [dispatch.fields, dispatch.products, dispatch.users, dispatch.websites, websites?.length]);

  const handleAddProduct = () => {
    console.log('Add product clicked');
    // Implement product addition functionality
  };

  const handleAddField = () => {
    console.log('Add field clicked');
    // Implement field addition functionality
  };

  if (isLoading && !user) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  // Render the appropriate content based on the active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard
                title="Products"
                value={(products?.length || 0).toString()}
                trend={{ value: "New", isUp: true, comparisonText: "TOTAL COUNT" }}
                icon="📊"
                showChart
              />

              <StatCard
                title="Fields"
                value={(fields?.length || 0).toString()}
                trend={{ value: "Active", isUp: true, comparisonText: "CONFIGURATION" }}
                icon="🔧"
                showChart
              />

              <StatCard
                title="Users"
                value={(users?.length || 0).toString()}
                trend={{ value: "Online", isUp: true, comparisonText: "SYSTEM" }}
                icon="👥"
                showChart
              />

              <StatCard
                title="Websites"
                value={(websites?.length || 0).toString()}
                trend={{ value: "Active", isUp: true, comparisonText: "DOMAINS" }}
                icon="🌐"
                showChart
              />

              <StatCard
                title="Status"
                value="Active"
                trend={{ value: "Online", isUp: true, comparisonText: "SYSTEM" }}
                icon="✅"
                showChart
              />
            </div>
          </>
        );

      case 'fields':
        return <FieldsView onAddField={handleAddField} />;

      case 'products':
        return <ProductsView onAddProduct={handleAddProduct} />;
        
      case 'websites':
        return <div className="p-4">
          <h2 className="text-xl font-semibold">Websites Management</h2>
          <p>Navigate to the Websites page to manage your websites.</p>
        </div>;

      default:
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold">Section {activeSection}</h2>
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <>
      {/* Dynamic Content Based on Active Section */}
      {renderContent()}
    </>
  );
};

export default Dashboard;
