import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './CheckoutPage.css';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';



const CheckoutPage = () => {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const location = useLocation();
  //const { product } = location.state || {};
  const product = JSON.parse(window.name || '{}');
  const [lens, setLens] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [zoomStyles, setZoomStyles] = useState({ offsetX: 0, offsetY: 0, zoomLeft: false });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [pincode, setPincode] = useState('');
  const zoomFactor = 3;

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  const handleAdd = (type) => {
  if (type === 'bag') {
    if (!selectedColor || !selectedSize) {
      setPopupMessage('Please select color and size');
    } else {
      addToCart({ ...product, selectedColor, selectedSize });
      setPopupMessage('Added to bag successfully');
    }
  }else if (type === 'wishlist') {
  if (!selectedColor || !selectedSize) {
    setPopupMessage('Please select color and size');
  } else {
    addToWishlist({ ...product, selectedColor, selectedSize });
    setPopupMessage('Added to wishlist successfully');
  }
}
  setTimeout(() => setPopupMessage(''), 2000);
};




  const handleMouseMove = (e) => {
    const image = e.target;
    const { left, top, width, height } = image.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const lensWidth = width / zoomFactor;
    const lensHeight = height / zoomFactor;
    let lensX = x - lensWidth / 2;
    let lensY = y - lensHeight / 2;
    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX > width - lensWidth) lensX = width - lensWidth;
    if (lensY > height - lensHeight) lensY = height - lensHeight;
    const imageWidth = width;
    const imageHeight = height;
    let containerWidth = window.innerWidth > 1024 ? 400 : imageWidth;
    let containerHeight;
    if (window.innerWidth > 1024) containerHeight = 400;
    else if (window.innerWidth > 768) containerHeight = 300;
    else if (window.innerWidth > 500) containerHeight = 200;
    else if (window.innerWidth > 400) containerHeight = 180;
    else containerHeight = 150;
    const bigImageWidth = imageWidth * zoomFactor;
    const bigImageHeight = imageHeight * zoomFactor;
    let offsetX = containerWidth / 2 - (lensX * zoomFactor + (lensWidth * zoomFactor) / 2);
    let offsetY = containerHeight / 2 - (lensY * zoomFactor + (lensHeight * zoomFactor) / 2);
    if (offsetX > 0) offsetX = 0;
    if (offsetX < containerWidth - bigImageWidth) offsetX = containerWidth - bigImageWidth;
    if (offsetY > 0) offsetY = 0;
    if (offsetY < containerHeight - bigImageHeight) offsetY = containerHeight - bigImageHeight;
    let zoomLeftFlag = false;
    if (window.innerWidth > 1024 && left + width + containerWidth > window.innerWidth) {
      zoomLeftFlag = true;
    }
    setLens({ x: lensX, y: lensY, w: lensWidth, h: lensHeight });
    setZoomStyles({ offsetX, offsetY, zoomLeft: zoomLeftFlag });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setLens({ x: 0, y: 0, w: 0, h: 0 });
    setZoomStyles({ offsetX: 0, offsetY: 0, zoomLeft: false });
  };

  /*const handleAdd = (type) => {
    setPopupMessage(`Added to ${type} successfully`);
    setTimeout(() => setPopupMessage(''), 2000);
  }; */

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) setPincode(value);
  };

  return (
    <div className="bhuvi-checkout-page">
      <Navbar />
      <div className="bhuvi-checkout-main">
        <div className="bhuvi-checkout-section1">
          <div className="bhuvi-checkout-section1-left">
            <div
              className="bhuvi-checkout-section1-image-container"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={product?.image}
                alt={product?.name}
                className="bhuvi-checkout-section1-image"
              />
              {isHovering && (
                <>
                  <div
                    className="bhuvi-checkout-section1-lens"
                    style={{
                      width: `${lens.w}px`,
                      height: `${lens.h}px`,
                      top: `${lens.y}px`,
                      left: `${lens.x}px`
                    }}
                  />
                  <div
                    className="bhuvi-checkout-section1-zoomed"
                    style={{
                      top: window.innerWidth > 1024 ? 0 : `${lens.h * zoomFactor}px`,
                      left: zoomStyles.zoomLeft
                        ? `-${window.innerWidth > 1024 ? 400 : lens.w * zoomFactor}px`
                        : `${window.innerWidth > 1024 ? lens.w * zoomFactor : 0}px`
                    }}
                  >
                    <img
                      src={product?.image}
                      alt="Zoomed view"
                      className="bhuvi-checkout-section1-zoomed-image"
                      style={{
                        width: `${lens.w * zoomFactor * zoomFactor}px`,
                        height: `${lens.h * zoomFactor * zoomFactor}px`,
                        top: `${zoomStyles.offsetY}px`,
                        left: `${zoomStyles.offsetX}px`
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="bhuvi-checkout-section1-right">
            <h1 className="bhuvi-brand-name">{product?.brand}</h1>
            <h2 className="bhuvi-product-name">{product?.name}</h2>
            <div className="bhuvi-price-row">
              <span className="bhuvi-price">₹{product?.offerPrice}</span>
              <span className="bhuvi-discount">60% Off</span>
            </div>
            <div className="bhuvi-mrp-info">
              <div className="bhuvi-mrp-line">
                <span>MRP:</span>
                <span className="bhuvi-mrp-strike">₹1,899</span>
              </div>
              <div className="bhuvi-tax-note">Inclusive of all taxes</div>
            </div>
            <hr />
            <div className="bhuvi-section">
              <h3>Select Color</h3>
              {selectedColor && <div className="bhuvi-selected-color">{selectedColor}</div>}
              <div className="bhuvi-color-circles">
                {['Red', 'Black', 'Gold', 'Green', 'Purple', 'Blue'].map((color) => (
                  <div
                    key={color}
                    className="bhuvi-color-circle"
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            <hr />
            <div className="bhuvi-section">
              <h3>Select Size</h3>
              <div className="bhuvi-size-options">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    className={`bhuvi-size-button ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="bhuvi-action-buttons">
                <button className="bhuvi-wishlist" onClick={() => handleAdd('wishlist')}>
                  <FaHeart style={{ marginRight: '8px' }} />
                  Add to Wishlist
                </button>
                <button className="bhuvi-bag" onClick={() => handleAdd('bag')}>
                  <FaShoppingBag style={{ marginRight: '8px' }} />
                  Add to Bag
                </button>
              </div>
            </div>
            <hr />
            <div className="bhuvi-section">
              <h3>Select Delivery Location</h3>
              <p className="bhuvi-subtext">Enter the pincode of your area to check product availability and delivery options</p>
              <div className="bhuvi-pincode-form">
                <input
                  type="text"
                  maxLength="6"
                  value={pincode}
                  onChange={handlePincodeChange}
                  placeholder="Enter Pincode"
                />
                <button className="bhuvi-apply-btn">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {popupMessage && <div className="bhuvi-popup">{popupMessage}</div>}
      <Footer />
    </div>
  );
};

export default CheckoutPage;
