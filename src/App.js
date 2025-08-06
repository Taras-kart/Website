import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <WishlistProvider> 
      <Router>
        <div className="App">
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
          </Routes>
        </div>
      </Router>
    </WishlistProvider>
  );
}

export default App;
