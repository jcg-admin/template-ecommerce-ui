/**
 * StorefrontLayout — ecommerce-ui
 * Layout público: Header + contenido + Footer.
 * Usado por: HomePage, CatalogPage, ProductPage, CartPage.
 */

import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@redux/selectors';
import { fetchWishlist } from '@redux/slices/wishlistSlice';
import { fetchCart } from '@redux/slices/cartSlice';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import ToastContainer from '@components/common/Toast/ToastContainer';
import SearchModal    from '@components/common/SearchModal/SearchModal';
import ErrorBoundary from '@components/shared/ErrorBoundary';
import styles from './StorefrontLayout.module.scss';

export default function StorefrontLayout() {
  const dispatch        = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Cargar wishlist y carrito al montar o cuando cambia la sesión
  useEffect(() => {
    dispatch(fetchCart());
    if (isAuthenticated) dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated]);

  return (
    <div className={styles.root}>
      <SearchModal />
      <Header />
      <main className={styles.main}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
