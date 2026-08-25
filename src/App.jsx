import React from 'react'
import { Navigate,Route,Routes,useLocation } from 'react-router-dom'
import { Header,Footer } from './components'
import { Home,Collection,ProductDetails,Cart,Wishlist,Checkout,Auth,Profile,Track,B2B,StaticPage,NotFound } from './pages'

function Scroll(){const {pathname}=useLocation();React.useEffect(()=>window.scrollTo(0,0),[pathname]);return null}

export default function App(){return <div className="app"><Scroll/><Header/><Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/men" element={<Collection gender="MEN"/>}/>
  <Route path="/women" element={<Collection gender="WOMEN"/>}/>
  <Route path="/kids" element={<Collection gender="KIDS"/>}/>
  <Route path="/collection" element={<Collection/>}/>
  <Route path="/search" element={<Collection search/>}/>
  <Route path="/product/:key" element={<ProductDetails/>}/>
  <Route path="/checkout-product" element={<LegacyProductRedirect/>}/>
  <Route path="/cart" element={<Cart/>}/>
  <Route path="/wishlist" element={<Wishlist/>}/>
  <Route path="/checkout" element={<Checkout/>}/>
  <Route path="/auth" element={<Auth/>}/>
  <Route path="/profile" element={<Profile/>}/>
  <Route path="/track-order" element={<Track/>}/>
  <Route path="/b2b-dashboard" element={<B2B/>}/>
  <Route path="/b2b-products" element={<B2B products/>}/>
  <Route path="/contact" element={<StaticPage type="contact"/>}/>
  <Route path="/customer-care" element={<StaticPage type="contact"/>}/>
  <Route path="/terms" element={<StaticPage type="terms"/>}/>
  <Route path="/privacy-policy" element={<StaticPage type="privacy"/>}/>
  <Route path="*" element={<NotFound/>}/>
  </Routes><Footer/></div>}

function LegacyProductRedirect(){let p=null;try{p=JSON.parse(sessionStorage.getItem('selectedProduct')||'null')}catch{}return <Navigate replace to={p?`/product/${encodeURIComponent(p.design_code||p.style_code||p.product_id||p.id)}`:'/collection'}/>}
