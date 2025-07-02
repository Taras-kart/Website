import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './WomenPage.css';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../WishlistContext';

const WomenPage = () => {
  /*const [likedProducts, setLikedProducts] = useState({}); */

  const navigate = useNavigate();

  const products = [
    { image: '/images/women/women1.jpeg', brand: 'Nike', name: 'Running Shoes', originalPrice: 3000, offerPrice: 1500 },
    { image: '/images/women/women2.jpeg', brand: 'Adidas', name: 'Sporty T-shirt', originalPrice: 1500, offerPrice: 799 },
    { image: '/images/women/women3.jpeg', brand: 'Puma', name: 'Casual Jeans', originalPrice: 2200, offerPrice: 999 },
    { image: '/images/women/women4.jpeg', brand: 'Zara', name: 'Jacket', originalPrice: 4500, offerPrice: 1999 },
    { image: '/images/women/women5.jpeg', brand: 'H&M', name: 'Slim Fit Shirt', originalPrice: 1200, offerPrice: 599 },
    { image: '/images/women/women6.jpeg', brand: 'Adidas', name: 'Track Pants', originalPrice: 2200, offerPrice: 1099 },
    { image: '/images/women/women7.jpeg', brand: 'Nike', name: 'Sports Cap', originalPrice: 700, offerPrice: 399 },
    { image: '/images/women/women8.jpeg', brand: 'Puma', name: 'Sneakers', originalPrice: 3500, offerPrice: 1999 },
    { image: '/images/women/women9.jpeg', brand: 'Reebok', name: 'Fitness Shoes', originalPrice: 4000, offerPrice: 2499 },
    { image: '/images/women/women10.jpeg', brand: 'H&M', name: 'Trousers', originalPrice: 1500, offerPrice: 799 },
    { image: '/images/women/women11.jpeg', brand: 'Zara', name: 'Denim Jacket', originalPrice: 3500, offerPrice: 1799 },
    { image: '/images/women/women12.jpeg', brand: 'Nike', name: 'Sports Watch', originalPrice: 2000, offerPrice: 999 },
    { image: '/images/women/women13.jpeg', brand: 'Adidas', name: 'Hoodie', originalPrice: 2800, offerPrice: 1399 },
    { image: '/images/women/women14.jpeg', brand: 'Puma', name: 'Casual Sneakers', originalPrice: 3200, offerPrice: 1499 },
    { image: '/images/women/women15.jpeg', brand: 'Reebok', name: 'Running Shoes', originalPrice: 4000, offerPrice: 1999 },
    { image: '/images/women/women16.jpeg', brand: 'H&M', name: 'Hooded Sweatshirt', originalPrice: 1200, offerPrice: 699 },
    { image: '/images/women/women17.jpeg', brand: 'Zara', name: 'Chinos', originalPrice: 1800, offerPrice: 899 },
    { image: '/images/women/women18.jpeg', brand: 'Adidas', name: 'Gym Shorts', originalPrice: 1000, offerPrice: 499 },
    { image: '/images/women/women19.jpeg', brand: 'Nike', name: 'Cap', originalPrice: 800, offerPrice: 399 },
    { image: '/images/women/women20.jpeg', brand: 'Puma', name: 'Sweatshirt', originalPrice: 2200, offerPrice: 1099 }
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
    <div className="women-page">
      <Navbar />
      <div className="wpmen-page-main">
        <FilterSidebar onFilterChange={(filters) => console.log(filters)} />
        <div className="women-page-content">
          <section className="mens-section1">
            <div className="mens-section1-bg">
              <img src="/images/womens-bg.jpg" alt="Womens Fashion Background" />
              <div className="mens-section1-overlay">
                <div className="mens-section1-text">
                  <h1>Tars</h1>
                  <h1>Kart</h1>
                  <h1>Womens</h1>
                  <h1>Fashion</h1>
                </div>
              </div>
            </div>
          </section>

          <section className="womens-section4">
            <div className="womens-section4-grid">
              {products.map((product, index) => (
                <div key={index} className="womens-section4-card" onClick={() => handleProductClick(product)}>
                  <div className="womens-section4-img">
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
                  <div className="womens-section4-price">
                    <span className="offer-price">₹{product.offerPrice}</span>
                    <span className="original-price">₹{product.originalPrice}</span>
                    <span className="discount">
                      ({Math.round(((product.originalPrice - product.offerPrice) / product.originalPrice) * 100)}% OFF)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>


          <section className="home-section6">
                <h2 className="home-section6-title">Trending Now....</h2>
                <div className="home-section6-grid">
                    {/* Part 1 */}
                    <div className="home-section6-item">
                        <div className="home-section6-left">
                            <img src="/images/trending-part1-big1.jpeg" alt="Printed Sarees" />
                        </div>
                        <div className="home-section6-right">
                            <h3>Printed Sarees...</h3>
                            <div className="home-section6-small-images">
                                <img src="/images/trending-part1-small1.jpeg" alt="Saree 1" />
                                <img src="/images/trending-part1-small2.jpeg" alt="Saree 2" />
                            </div>
                        </div>
                    </div>

                    {/* Part 2 */}
                    <div className="home-section6-item">
                        <div className="home-section6-left">
                            <img src="/images/trending-part2-big1.jpeg" alt="Lehanga" />
                        </div>
                        <div className="home-section6-right">
                            <h3> Printed Lehanga...</h3>
                            <div className="home-section6-small-images">
                                <img src="/images/trending-part2-small1.jpeg" alt="Lehanga 1" />
                                <img src="/images/trending-part2-small2.jpeg" alt="Lehanga 2" />
                            </div>
                        </div>
                    </div>

                    {/* Part 3 */}
                    <div className="home-section6-item">
                        <div className="home-section6-left">
                            <img src="/images/trending-part3-big1.jpeg" alt="Wedding Sarees" />
                        </div>
                        <div className="home-section6-right">
                            <h3>Wedding Sarees...</h3>
                            <div className="home-section6-small-images">
                                <img src="/images/trending-part3-small1.jpeg" alt="Saree 1" />
                                <img src="/images/trending-part3-small2.jpeg" alt="Saree 2" />
                            </div>
                        </div>
                    </div>

                    {/* Part 4 */}
                    <div className="home-section6-item">
                        <div className="home-section6-left">
                            <img src="/images/trending-part4-big1.jpeg" alt="Printed Sarees" />
                        </div>
                        <div className="home-section6-right">
                            <h3>Printed Chudidars...</h3>
                            <div className="home-section6-small-images">
                                <img src="/images/trending-part4-small1.jpeg" alt="Saree 1" />
                                <img src="/images/trending-part4-small2.jpeg" alt="Saree 2" />
                            </div>
                        </div>
                    </div>

                    {/* Part 5 */}
                    <div className="home-section6-item">
                        <div className="home-section6-left">
                            <img src="/images/trending-part5-big1.jpeg" alt="Lehanga" />
                        </div>
                        <div className="home-section6-right">
                            <h3> Printed Gowns...</h3>
                            <div className="home-section6-small-images">
                                <img src="/images/trending-part5-small1.jpeg" alt="Lehanga 1" />
                                <img src="/images/trending-part5-small2.jpeg" alt="Lehanga 2" />
                            </div>
                        </div>
                    </div>

                    {/* Part 6 */}
                    <div className="home-section6-item">
                        <div className="home-section6-left">
                            <img src="/images/trending-part6-big1.jpeg" alt="Wedding Sarees" />
                        </div>
                        <div className="home-section6-right">
                            <h3>Half Sarees...</h3>
                            <div className="home-section6-small-images">
                                <img src="/images/trending-part6-small1.jpeg" alt="Saree 1" />
                                <img src="/images/trending-part6-small2.jpeg" alt="Saree 2" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WomenPage;
