// D:\shopping\src\pages\CheckoutPage.js
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './CheckoutPage.css';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [lens, setLens] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [zoomStyles, setZoomStyles] = useState({ offsetX: 0, offsetY: 0, zoomLeft: false });
  const [isHovering, setIsHovering] = useState(false);

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [colorImages, setColorImages] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [popupMessage, setPopupMessage] = useState('');
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const userId = sessionStorage.getItem('userId');
  const zoomFactor = 3;

  useEffect(() => {
    const storedProduct = sessionStorage.getItem('selectedProduct');
    if (storedProduct) setProduct(JSON.parse(storedProduct));
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('selectedProduct');
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadVariants = async () => {
      if (!product) return;
      setIsLoading(true);
      try {
        const q = encodeURIComponent(product.product_name || '');
        const res = await fetch(`${API_BASE}/api/products?limit=300&hasImage=true&q=${q}`);
        const data = await res.json();
        const same = (Array.isArray(data) ? data : []).filter(
          (r) =>
            String(r.brand || r.brand_name || '').trim().toUpperCase() ===
              String(product.brand || '').trim().toUpperCase() &&
            String(r.product_name || r.name || '').trim().toUpperCase() ===
              String(product.product_name || '').trim().toUpperCase()
        );
        const mapped = same.map((r) => ({
          id: r.id,
          product_id: r.product_id,
          color: r.color || r.colour || '',
          size: r.size || '',
          image_url: r.image_url,
          ean_code: r.ean_code || ''
        }));
        setVariants(mapped);

        const byColor = {};
        mapped.forEach((v) => {
          const key = v.color || 'DEFAULT';
          if (!byColor[key]) byColor[key] = [];
          byColor[key].push(v.image_url);
        });
        Object.keys(byColor).forEach((k) => {
          const unique = Array.from(new Set(byColor[k].filter(Boolean)));
          byColor[k] = unique;
        });
        setColorImages(byColor);

        const initialColor = product.color || product.colour || mapped[0]?.color || null;
        setSelectedColor(initialColor);
        const sizesForInitial = Array.from(
          new Set(mapped.filter((v) => (initialColor ? v.color === initialColor : true)).map((v) => v.size).filter(Boolean))
        );
        const preferredSize =
          sizesForInitial.includes(product.size) ? product.size : sizesForInitial[0] || null;
        setSelectedSize(preferredSize);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    loadVariants();
  }, [product]);

  const sizesForColor = () => {
    if (!selectedColor) return Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
    return Array.from(new Set(variants.filter((v) => v.color === selectedColor).map((v) => v.size).filter(Boolean)));
  };

  const mainImage = () => {
    if (!product) return '';
    if (selectedColor) {
      const foundImage = colorImages[selectedColor]?.[0];
      if (foundImage) return foundImage;
    }
    return product.image_url;
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    const sizes = sizesForColor();
    const newSize = sizes.includes(selectedSize) ? selectedSize : sizes[0] || null;
    setSelectedSize(newSize);
  };

  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const handleAdd = async (type) => {
    if (!selectedColor || !selectedSize || !userId || !product?.id) {
      setPopupMessage('Please select color and size');
      setTimeout(() => setPopupMessage(''), 2000);
      return;
    }
    const chosenVariant =
      variants.find((v) => v.color === selectedColor && v.size === selectedSize) || null;

    const item = {
      ...product,
      id: chosenVariant?.id || product.id,
      product_id: chosenVariant?.product_id || product.product_id || null,
      image_url: mainImage(),
      selectedColor,
      selectedSize,
      quantity: 1
    };

    if (type === 'bag') {
      const resp = await fetch(`${API_BASE}/api/cart/tarascart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_id: item.id,
          selected_size: selectedSize,
          selected_color: selectedColor,
          quantity: 1
        })
      });
      if (resp.ok) {
        addToCart(item);
        window.scrollTo(0, 0);
        navigate('/cart');
      } else {
        setPopupMessage('Failed to add to bag');
        setTimeout(() => setPopupMessage(''), 2000);
      }
    } else {
      const resp = await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_id: item.product_id || product.product_id
        })
      });
      if (resp.ok) {
        addToWishlist(item);
        setPopupMessage('Added to wishlist successfully');
        setTimeout(() => setPopupMessage(''), 2000);
      } else {
        setPopupMessage('Failed to add to wishlist');
        setTimeout(() => setPopupMessage(''), 2000);
      }
    }
  };

  //const zoomFactor = 3;

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
    let containerWidth = window.innerWidth > 1024 ? 320 : width;
    let containerHeight = window.innerWidth > 1024 ? 320 : window.innerWidth > 768 ? 260 : window.innerWidth > 520 ? 220 : 180;
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

  const thumbList = selectedColor ? colorImages[selectedColor] || [] : [];

  return (
    <div className="co-wrap">
      <Navbar />
      <div className="co-container">
        <div className="co-left">
          <div className="co-media">
            <div
              className="co-image-zoom"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {product && (
                <img
                  src={mainImage()}
                  alt={product.product_name}
                  className="co-image"
                />
              )}
              {isHovering && product && (
                <>
                  <div
                    className="co-lens"
                    style={{
                      width: `${lens.w}px`,
                      height: `${lens.h}px`,
                      top: `${lens.y}px`,
                      left: `${lens.x}px`
                    }}
                  />
                  <div
                    className="co-zoomed"
                    style={{
                      top: window.innerWidth > 1024 ? 0 : `${lens.h * zoomFactor}px`,
                      left: zoomStyles.zoomLeft
                        ? `-${window.innerWidth > 1024 ? 320 : lens.w * zoomFactor}px`
                        : `${window.innerWidth > 1024 ? lens.w * zoomFactor : 0}px`
                    }}
                  >
                    <img
                      src={mainImage()}
                      alt="Zoomed"
                      className="co-zoomed-img"
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

            {thumbList.length > 0 && (
              <div className="co-thumbs">
                {thumbList.map((src, i) => (
                  <button
                    key={i}
                    className="co-thumb"
                    onClick={() => {
                      const c = selectedColor;
                      if (!c) return;
                      setColorImages((prev) => {
                        const copy = { ...prev };
                        const arr = copy[c] || [];
                        if (arr[0] !== src) {
                          const idx = arr.indexOf(src);
                          if (idx > -1) {
                            arr.splice(idx, 1);
                            arr.unshift(src);
                            copy[c] = [...arr];
                          }
                        }
                        return copy;
                      });
                    }}
                  >
                    <img src={src} alt={`thumb-${i}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="co-right">
          {isLoading ? (
            <div className="co-loader">
              <div className="spin"></div>
              <span>Loading options…</span>
            </div>
          ) : (
            <>
              <h1 className="co-brand">{product?.brand}</h1>
              <h2 className="co-name">{product?.product_name}</h2>

              <div className="co-price-row">
                <span className="co-price">₹{Number(product?.final_price_b2c || 0).toFixed(2)}</span>
                <span className="co-disc">{getDiscount()}% Off</span>
              </div>

              <div className="co-mrp">
                <span className="co-mrp-label">MRP:</span>
                <span className="co-mrp-strike">₹{Number(product?.original_price_b2c || 0).toFixed(2)}</span>
                <span className="co-tax">Inclusive of all taxes</span>
              </div>

              <div className="co-section">
                <div className="co-section-head">
                  <h3>Color</h3>
                  {selectedColor && <span className="co-chip">{selectedColor}</span>}
                </div>
                <div className="co-colors">
                  {Object.keys(colorImages).length === 0 && (
                    <span className="co-muted">No colors available</span>
                  )}
                  {Object.keys(colorImages).map((c) => (
                    <button
                      key={c}
                      className={`co-swatch ${selectedColor === c ? 'active' : ''}`}
                      onClick={() => handleColorClick(c)}
                      style={{
                        backgroundImage: colorImages[c]?.[0] ? `url(${colorImages[c][0]})` : 'none'
                      }}
                      title={c}
                    >
                      {!colorImages[c]?.[0] && <span className="co-swatch-fallback">{c[0] || '?'}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="co-section">
                <div className="co-section-head">
                  <h3>Size</h3>
                  {selectedSize && <span className="co-chip">{selectedSize}</span>}
                </div>
                <div className="co-sizes">
                  {sizesForColor().length === 0 && <span className="co-muted">No sizes available</span>}
                  {sizesForColor().map((s) => (
                    <button
                      key={s}
                      className={`co-size ${selectedSize === s ? 'selected' : ''}`}
                      onClick={() => handleSizeClick(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="co-actions">
                  <button className="btn gold ghost" onClick={() => handleAdd('wishlist')}>
                    <FaHeart style={{ marginRight: 8 }} /> Add to Wishlist
                  </button>
                  <button className="btn gold solid" onClick={() => handleAdd('bag')}>
                    <FaShoppingBag style={{ marginRight: 8 }} /> Add to Bag
                  </button>
                </div>
              </div>

              <div className="co-section">
                <h3>Delivery</h3>
                <p className="co-sub">Enter your pincode to check delivery options</p>
                <div className="co-pin">
                  <input
                    type="text"
                    maxLength="6"
                    value={pincode}
                    onChange={handlePincodeChange}
                    placeholder="Enter Pincode"
                  />
                  <button className="btn black">Apply</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {popupMessage && <div className="co-popup">{popupMessage}</div>}
      <Footer />
    </div>
  );
};

export default CheckoutPage;
