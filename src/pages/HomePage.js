import React from 'react';
import Navbar from './Navbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import './HomePage.css';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';

const HomePage = () => {
    const slides = Array.from({ length: 11 }, (_, i) => `/images/slide${i + 1}.jpg`);
    const section3Images = Array.from({ length: 12 }, (_, i) => `/images/random${i + 1}.jpg`);

    return (
        <div className="home-section1-wrapper">
            <Navbar />
            {/*<FilterSidebar onFilterChange={(filters) => console.log(filters)} /> */}
            <div className="home-section1">
                <div className="home-section1-overlay">
                    <div className="home-section1-content">
                        <div className="home-section1-left">
                            <img src="/images/big-side1.jpg" alt="Big Side" />
                            <div className="home-section1-text">
                                <h1>Tars Kart</h1>
                                <p>Your one-stop shop for everything trendy and timeless.</p>
                            </div>
                        </div>
                        <div className="home-section1-right">
                            <img src="/images/small-side1.jpg" alt="Small Side 1" />
                            <img src="/images/small-side2.jpg" alt="Small Side 2" />
                            <img src="/images/small-side3.jpg" alt="Small Side 3" />
                        </div>
                    </div>
                </div>
            </div>

            <section className="home-section2">
                <h2 className="home-section2-title">
                    Boost your clothing sales with our fashion Varieties!
                </h2>

                <Swiper
                    className="home-section2-slider"
                    modules={[EffectCoverflow, Autoplay]}
                    effect="coverflow"
                    loop={true}
                    centeredSlides={true}
                    slidesPerView="auto"
                    coverflowEffect={{
                        rotate: 40,
                        depth: 200,
                        stretch: 0,
                        modifier: 1,
                        slideShadows: false
                    }}
                    autoplay={{
                        delay: 1700,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: false
                    }}
                    speed={1000}
                    allowTouchMove={false}
                >
                    {slides.map((src, index) => (
                        <SwiperSlide key={index}>
                            <img src={src} alt={`Slide ${index + 1}`} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                <h3 className="home-section2-subtitle">
                    From briefs to stunning images in seconds: save time, cut costs, and drive success!
                </h3>
            </section>

            <section className="home-section3">
                <div className="home-section3-grid">
                    {section3Images.map((src, i) => (
                        <div className="home-section3-item" key={i}>
                            <img src={src} alt={`Random ${i + 1}`} />
                        </div>
                    ))}
                </div>
                <div className="home-section3-overlay">
                    <div className="home-section3-center-text">
                        <h2 className="home-section3-style">Style</h2>
                        <h2 className="home-section3-count">100+</h2>
                        <h2 className="home-section3-varieties">Varieties</h2>
                    </div>
                </div>
            </section>



            <section className="home-section5">
                <div className="home-section5-heading">
                    <h2>Women's Collection</h2>
                    <div className="home-section5-underline">
                        <div className="line large"></div>
                        <div className="line medium"></div>
                        <div className="line small"></div>
                    </div>
                </div>
                <div className="home-section5-grid">
                    {[
                        { img: 'women-anarkali.jpg', title: 'Anarkali' },
                        { img: 'women-chudidar.jpg', title: 'Chudidar' },
                        { img: 'women-gowns.jpg', title: 'Gowns' },
                        { img: 'women-kurta.jpg', title: 'Kurta' },
                        { img: 'women-lehanga.jpeg', title: 'Lehanga' },
                        { img: 'women-palazzo.jpg', title: 'Palazzo' },
                        { img: 'women-salwar.jpg', title: 'Salwar' },
                        { img: 'women-sarees.jpg', title: 'Sarees' }
                    ].map((item, index) => (
                        <div className="home-section5-card" key={index}>
                            <img src={`/images/women/${item.img}`} alt={item.title} />
                            <h3>{item.title}</h3>
                            <button>Buy Now</button>
                        </div>
                    ))}
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







            <section className="home-section4">
                <h2 className="home-section4-title">Our Premium Collections</h2>
                <div className="home-section4-grid">
                    <div className="home-section4-card">
                        <div className="home-section4-text">
                            <h3>Mens <br />Fashions</h3>
                        </div>
                        <img src="/images/card1.jpg" alt="Mens Fashions" />
                    </div>
                    <div className="home-section4-card">
                        <div className="home-section4-text">
                            <h3>Wedding <br /> Varities</h3>

                        </div>
                        <img src="/images/card2.jpg" alt="Wedding Varities" />
                    </div>
                    <div className="home-section4-card">
                        <div className="home-section4-text">
                            <h3>Womens <br />Fashions</h3>

                        </div>
                        <img src="/images/card3.jpg" alt="WoMens Fashions" />
                    </div>
                    <div className="home-section4-card">
                        <div className="home-section4-text">
                            <h3>Kids <br />Fashions</h3>

                        </div>
                        <img src="/images/card4.jpg" alt="Kids Fashions" />
                    </div>
                </div>
            </section>




            <section className="home-section7">
                <h2 className="home-section7-title">Exclusive Waves of Fashion</h2>
                <div className="home-section7-row">
                    {Array.from({ length: 9 }, (_, i) => (
                        <div key={i} className={`home-section7-item item-${i + 1}`}>
                            <img src={`/images/wave${i + 1}.jpeg`} alt={`Wave ${i + 1}`} />
                            <div className="home-section7-text">
                                <h3>Brand Name {i + 1}</h3>
                                <p>Product Name {i + 1}</p>
                                <p><strong>50% OFF</strong></p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>






            <Footer />
        </div>
    );
};

export default HomePage;
