import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './KidsPage.css';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../WishlistContext';


const KidsPage = () => {
 /* const [likedProducts, setLikedProducts] = useState({}); */
  const navigate = useNavigate();

  const products = [
    { image: '/images/kids/kids1.jpeg', brand: 'Nike', name: 'Running Shoes', originalPrice: 3000, offerPrice: 1500 },
    { image: '/images/kids/kids2.jpeg', brand: 'Adidas', name: 'Sporty T-shirt', originalPrice: 1500, offerPrice: 799 },
    { image: '/images/kids/kids3.jpeg', brand: 'Puma', name: 'Casual Jeans', originalPrice: 2200, offerPrice: 999 },
    { image: '/images/kids/kids4.jpeg', brand: 'Zara', name: 'Jacket', originalPrice: 4500, offerPrice: 1999 },
    { image: '/images/kids/kids5.jpeg', brand: 'H&M', name: 'Slim Fit Shirt', originalPrice: 1200, offerPrice: 599 },
    { image: '/images/kids/kids6.jpeg', brand: 'Adidas', name: 'Track Pants', originalPrice: 2200, offerPrice: 1099 },
    { image: '/images/kids/kids7.jpeg', brand: 'Nike', name: 'Sports Cap', originalPrice: 700, offerPrice: 399 },
    { image: '/images/kids/kids8.jpeg', brand: 'Puma', name: 'Sneakers', originalPrice: 3500, offerPrice: 1999 },
    { image: '/images/kids/kids9.jpeg', brand: 'Reebok', name: 'Fitness Shoes', originalPrice: 4000, offerPrice: 2499 },
    { image: '/images/kids/kids10.jpeg', brand: 'H&M', name: 'Trousers', originalPrice: 1500, offerPrice: 799 },
    { image: '/images/kids/kids11.jpeg', brand: 'Zara', name: 'Denim Jacket', originalPrice: 3500, offerPrice: 1799 },
    { image: '/images/kids/kids12.jpeg', brand: 'Nike', name: 'Sports Watch', originalPrice: 2000, offerPrice: 999 },
    { image: '/images/kids/kids13.jpeg', brand: 'Adidas', name: 'Hoodie', originalPrice: 2800, offerPrice: 1399 },
    { image: '/images/kids/kids14.jpeg', brand: 'Puma', name: 'Casual Sneakers', originalPrice: 3200, offerPrice: 1499 },
    { image: '/images/kids/kids15.jpeg', brand: 'Reebok', name: 'Running Shoes', originalPrice: 4000, offerPrice: 1999 },
    { image: '/images/kids/kids16.jpeg', brand: 'H&M', name: 'Hooded Sweatshirt', originalPrice: 1200, offerPrice: 699 },
    { image: '/images/kids/kids17.jpeg', brand: 'Zara', name: 'Chinos', originalPrice: 1800, offerPrice: 899 },
    { image: '/images/kids/kids18.jpeg', brand: 'Adidas', name: 'Gym Shorts', originalPrice: 1000, offerPrice: 499 },
    { image: '/images/kids/kids19.jpeg', brand: 'Nike', name: 'Cap', originalPrice: 800, offerPrice: 399 },
    { image: '/images/kids/kids20.jpeg', brand: 'Puma', name: 'Sweatshirt', originalPrice: 2200, offerPrice: 1099 }
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
                    {/*<h1>Tars</h1>
                    <h1>Kart</h1> */}
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
                      <img src={product.image} alt={product.name} />
                      <div
                        className="love-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product);
                        }}
                      >
                        {wishlistItems.find(item => item.name === product.name) ? (
                          <FaHeart style={{ color: 'yellow', fontSize: '18px !important' }} />
                        ) : (
                          <FaRegHeart style={{ color: 'yellow', fontSize: '24px' }} />
                        )}
                      </div>
                    </div>
                    <h4 className="brand-name">{product.brand}</h4>
                    <h5 className="product-name">{product.name}</h5>
                    <div className="kids-section4-price">
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

export default KidsPage;
