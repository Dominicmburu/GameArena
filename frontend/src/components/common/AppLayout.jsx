import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';

const AppLayout = () => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  const hideLayoutRoutes = ['/auth'];

  const shouldHideLayout = loading || !user || hideLayoutRoutes.includes(pathname);

  if (shouldHideLayout) {
    return <Outlet />;
  }

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default AppLayout;
