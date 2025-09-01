import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './KidsPage.css';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../WishlistContext';

const KidsPage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { addToWishlist, wishlistItems } = useWishlist();

  useEffect(() => {
    const fetchKids = async () => {
      try {
        const boys = await fetch(`http://localhost:5000/api/products/${encodeURIComponent('Kids - Boys')}`).then(r => r.json());
        const girls = await fetch(`http://localhost:5000/api/products/${encodeURIComponent('Kids - Girls')}`).then(r => r.json());
        const merged = [...(Array.isArray(boys) ? boys : []), ...(Array.isArray(girls) ? girls : [])];
        setProducts(merged);
      } catch {
        setProducts([]);
      }
    };
    fetchKids();
  }, []);

  const userId = sessionStorage.getItem('userId');

  const toggleLike = async (product) => {
    const alreadyInWishlist = wishlistItems.some(
      (item) => item.product_name === product.product_name
    );

    if (alreadyInWishlist) {
      await fetch('http://localhost:5000/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: product.id }),
      });
    } else {
      await fetch('http://localhost:5000/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: product.id }),
      });

      addToWishlist(product);
    }
  };

  const handleProductClick = (product) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product)); // Save the selected product in sessionStorage
     const newTab = window.open('/checkout', '_blank');
  newTab.onload = () => {
    newTab.sessionStorage.setItem('selectedProduct', JSON.stringify(product));
  };
  };

  return (
    <div className="kids-page">
      <Navbar />
      <div className="kids-test">
        <FilterSidebar onFilterChange={() => {}} />
        <div className="kids-page-main">
          <div className="kids-page-content">
            <section className="kids-section1">
              <div className="kids-section1-bg">
                <img src="/images/kids-bg.jpg" alt="Kids Fashion Background" />
                <div className="kids-section1-overlay">
                  <div className="kids-section1-text">
                    <h1>Kids</h1>
                    <h1>Fashion</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="kids-section4">
              <div className="kids-section4-grid">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="kids-section4-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="kids-section4-img">
                      <img src={product.image_url} alt={product.product_name} />
                      <div
                        className="love-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product);
                        }}
                      >
                        {wishlistItems.find(
                          (item) => item.product_name === product.product_name
                        ) ? (
                          <FaHeart style={{ color: 'yellow', fontSize: 18 }} />
                        ) : (
                          <FaRegHeart style={{ color: 'yellow', fontSize: 24 }} />
                        )}
                      </div>
                    </div>
                    <h4 className="brand-name">{product.brand}</h4>
                    <h5 className="product-name">{product.product_name}</h5>
                    <div className="kids-section4-price">
                      <span className="offer-price">₹{product.final_price_b2c}</span>
                      <span className="original-price">₹{product.original_price_b2c}</span>
                      <span className="discount">
                        (
                        {Math.round(
                          ((Number(product.original_price_b2c) - Number(product.final_price_b2c)) / 
                            Number(product.original_price_b2c)) *
                            100
                        )}
                        % OFF)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="kids-section2">
              <div className="kids-section2-bg">
                <img src="/images/mens-bg1.jpg" alt="Kids Style Background" />
                <div className="kids-section2-overlay">
                  <div className="kids-section2-text">
                    <h1>Style Up</h1>
                    <h1>Your</h1>
                    <h1>Wardrobe</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="kids-section3">
              <div className="kids-section3-left">
                <img src="/images/mens-part1.jpg" alt="Left Fashion" />
              </div>
              <div className="kids-section3-center">
                <h2>Exclusive offers</h2>
                <div className="kids-section3-discount">
                  <span className="line"></span>
                  <h1>50% OFF</h1>
                  <span className="line"></span>
                </div>
                <h3>Just for you</h3>
              </div>
              <div className="kids-section3-right">
                <img src="/images/mens-part2.jpg" alt="Right Fashion" />
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default KidsPage;
