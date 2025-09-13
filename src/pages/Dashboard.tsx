import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SalesmanDashboard from '@/components/dashboards/SalesmanDashboard';

const Dashboard = () => {
  const { isAdmin, isSalesman } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isSalesman) {
    return <SalesmanDashboard />;
  }

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Access denied. Please contact your administrator.</p>
    </div>
  );
};

export default Dashboard;