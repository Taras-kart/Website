import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './CheckoutPage.css';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';

const CheckoutPage = () => {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [lens, setLens] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [zoomStyles, setZoomStyles] = useState({ offsetX: 0, offsetY: 0, zoomLeft: false });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [pincode, setPincode] = useState('');
  const [product, setProduct] = useState(null);
  const userId = sessionStorage.getItem('userId');
  const zoomFactor = 3;

  useEffect(() => {
    const storedProduct = sessionStorage.getItem('selectedProduct');
    if (storedProduct) {
      setProduct(JSON.parse(storedProduct));
    }
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('selectedProduct');
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAdd = async (type) => {
    if (!selectedColor || !selectedSize || !userId || !product?.id) {
      setPopupMessage('Please select color and size');
      setTimeout(() => setPopupMessage(''), 2000);
      return;
    }

    const item = {
      ...product,
      selectedColor,
      selectedSize
    };

    if (type === 'bag') {
      await fetch('http://localhost:5000/api/tarascart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          selected_size: selectedSize,
          selected_color: selectedColor
        })
      });
      addToCart(item);
      setPopupMessage('Added to bag successfully');
    } else {
      await fetch('http://localhost:5000/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id
        })
      });
      addToWishlist(item);
      setPopupMessage('Added to wishlist successfully');
    }

    setTimeout(() => setPopupMessage(''), 2000);
  };

  const handleMouseMove = (e) => {
    const image = e.target;
    const { left, width, height } = image.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - image.getBoundingClientRect().top;
    const lensWidth = width / zoomFactor;
    const lensHeight = height / zoomFactor;
    let lensX = Math.max(0, Math.min(x - lensWidth / 2, width - lensWidth));
    let lensY = Math.max(0, Math.min(y - lensHeight / 2, height - lensHeight));
    const bigImageWidth = width * zoomFactor;
    const bigImageHeight = height * zoomFactor;
    let containerWidth = window.innerWidth > 1024 ? 400 : width;
    let containerHeight = window.innerWidth > 1024 ? 400 : window.innerWidth > 768 ? 300 : window.innerWidth > 500 ? 200 : window.innerWidth > 400 ? 180 : 150;
    let offsetX = containerWidth / 2 - (lensX * zoomFactor + (lensWidth * zoomFactor) / 2);
    let offsetY = containerHeight / 2 - (lensY * zoomFactor + (lensHeight * zoomFactor) / 2);
    offsetX = Math.max(containerWidth - bigImageWidth, Math.min(0, offsetX));
    offsetY = Math.max(containerHeight - bigImageHeight, Math.min(0, offsetY));
    const zoomLeftFlag = window.innerWidth > 1024 && left + width + containerWidth > window.innerWidth;
    setLens({ x: lensX, y: lensY, w: lensWidth, h: lensHeight });
    setZoomStyles({ offsetX, offsetY, zoomLeft: zoomLeftFlag });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setLens({ x: 0, y: 0, w: 0, h: 0 });
    setZoomStyles({ offsetX: 0, offsetY: 0, zoomLeft: false });
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) setPincode(value);
  };

  const getDiscount = () => {
    const mrp = product?.original_price_b2c || 0;
    const offer = product?.final_price_b2c || 0;
    if (!mrp || mrp <= offer) return 0;
    return Math.round(((mrp - offer) / mrp) * 100);
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
              {product && (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="bhuvi-checkout-section1-image"
                />
              )}
              {isHovering && product && (
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
                      src={product.image_url}
                      alt="Zoomed"
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
            <h2 className="bhuvi-product-name">{product?.product_name}</h2>
            <div className="bhuvi-price-row">
              <span className="bhuvi-price">₹{product?.final_price_b2c}</span>
              <span className="bhuvi-discount">{getDiscount()}% Off</span>
            </div>
            <div className="bhuvi-mrp-info">
              <div className="bhuvi-mrp-line">
                <span>MRP:</span>
                <span className="bhuvi-mrp-strike">₹{product?.original_price_b2c}</span>
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
                  <FaHeart style={{ marginRight: '8px' }} /> Add to Wishlist
                </button>
                <button className="bhuvi-bag" onClick={() => handleAdd('bag')}>
                  <FaShoppingBag style={{ marginRight: '8px' }} /> Add to Bag
                </button>
              </div>
            </div>
            <hr />
            <div className="bhuvi-section">
              <h3>Select Delivery Location</h3>
              <p className="bhuvi-subtext">
                Enter the pincode of your area to check product availability and delivery options
              </p>
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
