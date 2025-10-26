// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import MenPage from './pages/MenPage';
import WomenPage from './pages/WomenPage';
import Profile from './pages/Profile';
import CheckoutPage from './pages/CheckoutPage';
import KidsPage from './pages/KidsPage';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Brands from './pages/Brands';
import { WishlistProvider } from './WishlistContext';
import SearchResults from './pages/SearchResults';
import TaraLoader from './pages/TaraLoader';
import ScrollToTop from './pages/ScrollToTop';
import OrderCheckout from './pages/OrderCheckout';
import OrderTracking from './pages/OrderTracking';
import ReturnsPage from './pages/ReturnsPage';
import OrderDetails from './pages/OrderDetails';

function NavigationLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);
  return loading ? <TaraLoader /> : null;
}

function AppShell() {
  return (
    <>
      <NavigationLoader />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/men" element={<MenPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/kids" element={<KidsPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/order/checkout" element={<OrderCheckout />} />
        <Route path="/track/:id" element={<OrderTracking />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/order/:id" element={<OrderDetails />} />

      </Routes>
    </>
  );
}

export default function App() {
  return (
    <WishlistProvider>
      <Router>
        <div className="App">
          <AppShell />
        </div>
      </Router>
    </WishlistProvider>
  );
}
