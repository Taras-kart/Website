import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './WomenPage.css';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../WishlistContext';

const WomenPage = () => {
  /*const [likedProducts, setLikedProducts] = useState({}); */
  const [filters, setFilters] = useState({});
  const [allProducts, setAllProducts] = useState([]);




  const navigate = useNavigate();

  {/*const products = [
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
  ]; */}

  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/products/Women')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const storedProduct = localStorage.getItem('selectedProduct');
    if (storedProduct) {
      setProduct(JSON.parse(storedProduct));
    }
  }, []);

  /* for filtering products by brand and price range and so on ikkada */
  useEffect(() => {
    fetch('http://localhost:5000/api/products/Women')
      .then(response => response.json())
      .then(data => {
        setAllProducts(data);
        setProducts(data);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  useEffect(() => {
    let filtered = [...allProducts];

    if (filters.brand) {
      filtered = filtered.filter(p => p.brand === filters.brand);
    }
    if (filters.priceRange) {
      filtered = filtered.filter(p =>
        p.final_price_b2c >= filters.priceRange.min &&
        p.final_price_b2c <= filters.priceRange.max
      );
    }

    setProducts(filtered);
  }, [filters, allProducts]);
  /* code completed for filters */


  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const storedType = sessionStorage.getItem('userType');
    setUserType(storedType);
  }, []);

  /*const toggleLike = (productId) => {
    setLikedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  }; */

  const { addToWishlist, wishlistItems } = useWishlist();

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


  const handleAddToCart = async (product, selectedSize, selectedColor) => {
    try {
      await fetch('http://localhost:5000/api/cart/tarascart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          selected_size: selectedSize,
          selected_color: selectedColor
        })
      });

      console.log("Added to cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };


  /*const handleProductClick = (product) => {
    navigate('/checkout', { state: { product } });
  }; */
  const handleProductClick = (product) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product)); // Save the selected product in sessionStorage
    const newTab = window.open('/checkout', '_blank');
    newTab.onload = () => {
      newTab.sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    };
  };






  return (
    <div className="women-page">
      <Navbar />
      <div className='filter-bar-class'>
      <FilterSidebar onFilterChange={(filters) => setFilters(filters)} />
      <div className="women-page-main">

        <div className="women-page-content">
          <section className="mens-section1">
            <div className="mens-section1-bg">
              <img src="/images/womens-bg.jpg" alt="Womens Fashion Background" />
              <div className="mens-section1-overlay">
                <div className="mens-section1-text">
                  {/*<h1>Tars</h1>
                  <h1>Kart</h1>  */}
                  <h1>Womens</h1>
                  <h1>Fashion</h1>
                </div>
              </div>
            </div>
          </section>

          {/*<section className="womens-section4">
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
          </section> */}

          <section className="womens-section4">
            <div className="womens-section4-grid">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="womens-section4-card"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="womens-section4-img">
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
                        <FaHeart style={{ color: 'yellow', fontSize: '20px' }} />
                      ) : (
                        <FaRegHeart style={{ color: 'yellow', fontSize: '20px' }} />
                      )}
                    </div>
                  </div>
                  <h4 className="brand-name">{product.brand}</h4>
                  <h5 className="product-name">{product.product_name}</h5>
                  <div className="womens-section4-price">
                    <span className="offer-price">
                      ₹
                      {userType === 'B2B'
                        ? product.final_price_b2b
                        : product.final_price_b2c}
                    </span>
                    <span className="original-price">
                      ₹
                      {userType === 'B2B'
                        ? product.original_price_b2b
                        : product.original_price_b2c}
                    </span>
                    <span className="discount">
                      (
                      {Math.round(
                        ((userType === 'B2B'
                          ? product.original_price_b2b - product.final_price_b2b
                          : product.original_price_b2c - product.final_price_b2c) /
                          (userType === 'B2B'
                            ? product.original_price_b2b
                            : product.original_price_b2c)) *
                        100
                      )}
                      % OFF)
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
      </div>
      <Footer />
    </div>
  );
};

export default WomenPage;
