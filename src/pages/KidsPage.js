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
    fetch('http://localhost:5000/api/products/Kids - Boys')  // You can also use 'Kids - Girls' or combine both
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const toggleLike = (product) => {
    addToWishlist(product);
  };

  const handleProductClick = (product) => {
    const newTab = window.open('', '_blank');
    const stateString = JSON.stringify(product);
    newTab.name = stateString;
    newTab.location.href = `/checkout`;
  };

  return (
    <div className="kids-page">
      <Navbar />
      <div className="kids-test">
        <div className="kids-page-main">
          <FilterSidebar onFilterChange={(filters) => console.log(filters)} />
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

            <section className="kids-section4">
              <div className="kids-section4-grid">
                {products.map((product, index) => (
                  <div key={index} className="kids-section4-card" onClick={() => handleProductClick(product)}>
                    <div className="kids-section4-img">
                      <img src={product.imageUrl} alt={product.productName} />
                      <div
                        className="love-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product);
                        }}
                      >
                        {wishlistItems.find(item => item.productName === product.productName) ? (
                          <FaHeart style={{ color: 'yellow', fontSize: '18px' }} />
                        ) : (
                          <FaRegHeart style={{ color: 'yellow', fontSize: '24px' }} />
                        )}
                      </div>
                    </div>
                    <h4 className="brand-name">{product.brand}</h4>
                    <h5 className="product-name">{product.productName}</h5>
                    <div className="kids-section4-price">
                      <span className="offer-price">₹{product.finalPrice}</span>
                      <span className="original-price">₹{product.originalPrice}</span>
                      <span className="discount">
                        ({Math.round(((product.originalPrice - product.finalPrice) / product.originalPrice) * 100)}% OFF)
                      </span>
                    </div>
                  </div>
                ))}
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
