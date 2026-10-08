import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import B2CGuard from './components/B2CGuard'
import B2BGuard from './components/B2BGuard'
import TaraLoader from './pages/TaraLoader'
import ScrollToTop from './pages/ScrollToTop'
import NavbarFinal from './pages/Navbar'
import { CategoryProductsPage } from './pages/GenderStorefront'

const MenPage = lazy(() => import('./pages/MenPage'))
const WomenPage = lazy(() => import('./pages/WomenPage'))
const Profile = lazy(() => import('./pages/Profile'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const KidsPage = lazy(() => import('./pages/KidsPage'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Cart = lazy(() => import('./pages/Cart'))
const Brands = lazy(() => import('./pages/Brands'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const OrderCheckout = lazy(() => import('./pages/OrderCheckout'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'))
const OrderDetails = lazy(() => import('./pages/OrderDetails'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const Home1 = lazy(() => import('./pages/Home1'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const OrderCancel = lazy(() => import('./pages/OrderCancel'))
const RefundRequest = lazy(() => import('./pages/RefundRequest'))
const Contactus = lazy(() => import('./pages/Contactus'))
const CategoryDisplay = lazy(() => import('./pages/CategoryDisplay'))
const B2BDashboard = lazy(() => import('./pages/B2BDashboard'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const B2BCheckout = lazy(() => import('./pages/B2BCheckout'))
const B2BProductList = lazy(() => import('./pages/B2BProductList'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'))

function AppShell() {
  return <><ScrollToTop /><NavbarFinal /><Suspense fallback={<TaraLoader />}><Routes><Route element={<B2BGuard />}><Route path="/b2b-dashboard" element={<B2BDashboard />} /><Route path="/b2b-products" element={<B2BProductList />} /><Route path="/b2b-checkout" element={<B2BCheckout />} /></Route><Route element={<B2CGuard />}><Route path="/" element={<Home1 />} /><Route path="/men" element={<MenPage />} /><Route path="/women" element={<WomenPage />} /><Route path="/kids" element={<KidsPage />} /><Route path="/shop/:gender/:categorySlug" element={<CategoryProductsPage />} /><Route path="/product/:variantId" element={<ProductDetailsPage />} /></Route><Route path="/category-display" element={<CategoryDisplay />} /><Route path="/profile" element={<Profile />} /><Route path="/checkout" element={<CheckoutPage />} /><Route path="/wishlist" element={<Wishlist />} /><Route path="/cart" element={<Cart />} /><Route path="/brands" element={<Brands />} /><Route path="/brands/:brandSlug" element={<Brands />} /><Route path="/brands/:brandSlug/:categoryId" element={<Brands />} /><Route path="/search" element={<SearchResults />} /><Route path="/order/checkout" element={<OrderCheckout />} /><Route path="/track/:id" element={<OrderTracking />} /><Route path="/returns" element={<ReturnsPage />} /><Route path="/order/:id" element={<OrderDetails />} /><Route path="/payment" element={<PaymentPage />} /><Route path="/track-order" element={<TrackOrder />} /><Route path="/order/:id/tracking" element={<OrderTracking />} /><Route path="/order/:id/cancel" element={<OrderCancel />} /><Route path="/returns/:id/refund" element={<RefundRequest />} /><Route path="/customer-care" element={<Contactus />} /><Route path="/privacy-policy" element={<PrivacyPolicy />} /></Routes></Suspense></>
}

export default function App() {
  return <Router><div className="App"><AppShell /></div></Router>
}
