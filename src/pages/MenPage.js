import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './MenPage.css';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';
import { useWishlist } from '../WishlistContext';
import { FaHeart, FaRegHeart, FaShoppingBag } from 'react-icons/fa';

const MenPage = () => {
  //const [likedProducts, setLikedProducts] = useState({});
  const navigate = useNavigate();

  const products = [
    { image: '/images/men/mens1.jpeg', brand: 'Nike', name: 'Running Shoes', originalPrice: 3000, offerPrice: 1500 },
    { image: '/images/men/mens2.jpeg', brand: 'Adidas', name: 'Sporty T-shirt', originalPrice: 1500, offerPrice: 799 },
    { image: '/images/men/mens3.jpeg', brand: 'Puma', name: 'Casual Jeans', originalPrice: 2200, offerPrice: 999 },
    { image: '/images/men/mens4.jpeg', brand: 'Zara', name: 'Jacket', originalPrice: 4500, offerPrice: 1999 },
    { image: '/images/men/mens5.jpeg', brand: 'H&M', name: 'Slim Fit Shirt', originalPrice: 1200, offerPrice: 599 },
    { image: '/images/men/mens6.jpeg', brand: 'Adidas', name: 'Track Pants', originalPrice: 2200, offerPrice: 1099 },
    { image: '/images/men/mens7.jpeg', brand: 'Nike', name: 'Sports Cap', originalPrice: 700, offerPrice: 399 },
    { image: '/images/men/mens8.jpeg', brand: 'Puma', name: 'Sneakers', originalPrice: 3500, offerPrice: 1999 },
    { image: '/images/men/mens9.jpeg', brand: 'Reebok', name: 'Fitness Shoes', originalPrice: 4000, offerPrice: 2499 },
    { image: '/images/men/mens10.jpeg', brand: 'H&M', name: 'Trousers', originalPrice: 1500, offerPrice: 799 },
    { image: '/images/men/mens11.jpeg', brand: 'Zara', name: 'Denim Jacket', originalPrice: 3500, offerPrice: 1799 },
    { image: '/images/men/mens12.jpeg', brand: 'Nike', name: 'Sports Watch', originalPrice: 2000, offerPrice: 999 },
    { image: '/images/men/mens13.jpeg', brand: 'Adidas', name: 'Hoodie', originalPrice: 2800, offerPrice: 1399 },
    { image: '/images/men/mens14.jpeg', brand: 'Puma', name: 'Casual Sneakers', originalPrice: 3200, offerPrice: 1499 },
    { image: '/images/men/mens15.jpeg', brand: 'Reebok', name: 'Running Shoes', originalPrice: 4000, offerPrice: 1999 },
    { image: '/images/men/mens16.jpeg', brand: 'H&M', name: 'Hooded Sweatshirt', originalPrice: 1200, offerPrice: 699 },
    { image: '/images/men/mens17.jpeg', brand: 'Zara', name: 'Chinos', originalPrice: 1800, offerPrice: 899 },
    { image: '/images/men/mens18.jpeg', brand: 'Adidas', name: 'Gym Shorts', originalPrice: 1000, offerPrice: 499 },
    { image: '/images/men/mens19.jpeg', brand: 'Nike', name: 'Cap', originalPrice: 800, offerPrice: 399 },
    { image: '/images/men/mens20.jpeg', brand: 'Puma', name: 'Sweatshirt', originalPrice: 2200, offerPrice: 1099 }
  ];

  /*const toggleLike = (productId) => {
    setLikedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  }; */
  const { addToWishlist, wishlistItems } = useWishlist();

  const toggleLike = (product) => {
    addToWishlist(product);
  };


  /*const handleProductClick = (product) => {
    navigate('/checkout', { state: { product } });
  }; */

  const handleProductClick = (product) => {
  const newTab = window.open('', '_blank');
  const stateString = JSON.stringify(product);
  newTab.name = stateString;
  newTab.location.href = `/checkout`;
};


  return (
    <div className="men-page">
      <Navbar />
      <div className="test">
        <div className="men-page-main">
          <FilterSidebar onFilterChange={(filters) => console.log(filters)} />
          <div className="men-page-content">
            <section className="mens-section1">
              <div className="mens-section1-bg">
                <img src="/images/up1.jpg" alt="Mens Fashion Background" />
                <div className="mens-section1-overlay">
                  <div className="mens-section1-text">
                    {/*<h1>Tars</h1>
                    <h1>Kart</h1> */}
                    <h1>Mens </h1>
                    <h1>Fashion</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="mens-section2">
              <div className="mens-section2-bg">
                <img src="/images/mens-bg1.jpg" alt="Mens Style Background" />
                <div className="mens-section2-overlay">
                  <div className="mens-section2-text">
                    <h1>Style Up</h1>
                    <h1>Your</h1>
                    <h1>Wardrobe</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="mens-section3">
              <div className="mens-section3-left">
                <img src="/images/mens-part1.jpg" alt="Left Fashion" />
              </div>
              <div className="mens-section3-center">
                <h2>Exclusive offers</h2>
                <div className="mens-section3-discount">
                  <span className="line"></span>
                  <h1>50% OFF</h1>
                  <span className="line"></span>
                </div>
                <h3>Just for you</h3>
              </div>
              <div className="mens-section3-right">
                <img src="/images/mens-part2.jpg" alt="Right Fashion" />
              </div>
            </section>

            <section className="mens-section4">
              <div className="mens-section4-grid">
                {products.map((product, index) => (
                  <div key={index} className="mens-section4-card" onClick={() => handleProductClick(product)}>
                    <div className="mens-section4-img">
                      <img src={product.image} alt={product.name} />
                      <div
                        className="love-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product);
                        }}
                      >
                        {wishlistItems.find(item => item.name === product.name) ? (
                          <FaHeart style={{ color: 'yellow', fontSize: '20px' }} />
                        ) : (
                          <FaRegHeart style={{ color: 'yellow', fontSize: '20px' }} />
                        )}
                      </div>
                    </div>
                    <h4 className="brand-name">{product.brand}</h4>
                    <h5 className="product-name">{product.name}</h5>
                    <div className="mens-section4-price">
                      <span className="offer-price">₹{product.offerPrice}</span>
                      <span className="original-price">₹{product.originalPrice}</span>
                      <span className="discount">({Math.round(((product.originalPrice - product.offerPrice) / product.originalPrice) * 100)}% OFF)</span>
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

export default MenPage;
