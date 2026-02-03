import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import MenPage from './pages/MenPage'
import WomenPage from './pages/WomenPage'
import Profile from './pages/Profile'
import CheckoutPage from './pages/CheckoutPage'
import KidsPage from './pages/KidsPage'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Brands from './pages/Brands'
import { WishlistProvider } from './WishlistContext'
import SearchResults from './pages/SearchResults'
import TaraLoader from './pages/TaraLoader'
import ScrollToTop from './pages/ScrollToTop'
import OrderCheckout from './pages/OrderCheckout'
import OrderTracking from './pages/OrderTracking'
import ReturnsPage from './pages/ReturnsPage'
import OrderDetails from './pages/OrderDetails'
import PaymentPage from './pages/PaymentPage'
import Home1 from './pages/Home1'
import TrackOrder from './pages/TrackOrder'
import OrderCancel from './pages/OrderCancel'
import RefundRequest from './pages/RefundRequest'
import NavbarFinal from './pages/Navbar'
import Contactus from './pages/Contactus'
import CategoryDisplay from './pages/CategoryDisplay'

function NavigationLoader() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 2500)
    return () => clearTimeout(t)
  }, [location.pathname, location.search])

  return loading ? <TaraLoader /> : null
}

function AppShell() {
  return (
    <>
      <NavigationLoader />
      <ScrollToTop />
      <NavbarFinal />
      <Routes>
        <Route path="/" element={<Home1 />} />
        <Route path="/men" element={<MenPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/category-display" element={<CategoryDisplay />} />
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
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/order/:id/tracking" element={<OrderTracking />} />
        <Route path="/order/:id/cancel" element={<OrderCancel />} />
        <Route path="/returns/:id/refund" element={<RefundRequest />} />
        <Route path="/customer-care" element={<Contactus />} />
      </Routes>
    </>
  )
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
  )
}