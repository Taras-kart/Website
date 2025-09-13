import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import './HomePage.css';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';

const womenItems = [
    { img: 'women-anarkali.jpg', title: 'Anarkali' },
    { img: 'women-chudidar.jpg', title: 'Chudidar' },
    { img: 'women-gowns.jpg', title: 'Gowns' },
    { img: 'women-kurta.jpg', title: 'Kurta' },
    { img: 'women-lehanga.jpeg', title: 'Lehanga' },
    { img: 'women-palazzo.jpg', title: 'Palazzo' },
    { img: 'women-salwar.jpg', title: 'Salwar' },
    { img: 'women-sarees.jpg', title: 'Sarees' }
];

const menItems = [
    { img: 'mens-casuals.jpg', title: 'Casuals' },
    { img: 'mens-ethinic.jpg', title: 'Ethnic' },
    { img: 'mens-formals.jpg', title: 'Formals' },
    { img: 'mens-party-wear.jpg', title: 'Party Wear' },
    { img: 'mens-semi-formals.jpg', title: 'Semi Formals' },
    { img: 'mens-street-wear.jpg', title: 'Street Wear' },
    { img: 'mens-suits.jpg', title: 'Suits' },
    { img: 'mens-wedding-wear.jpg', title: 'Wedding Wear' }
];

const kidsItems = [
    { img: 'kids-boys-casual-wear.jpg', title: 'Boys Casual Wear' },
    { img: 'kids-boys-kurta-paijama.jpg', title: 'Boys Kurta Paijama' },
    { img: 'kids-boys-sherwani.jpg', title: 'Boys Sherwani' },
    { img: 'kids-formal.jpg', title: 'Formal' },
    { img: 'kids-girls-frock.jpg', title: 'Girls Frock' },
    { img: 'kids-girls-gown.jpg', title: 'Girls Gown' },
    { img: 'kids-girls-lehenga-choli.jpg', title: 'Girls Lehenga Choli' },
    { img: 'kids-girls-salwar.jpg', title: 'Girls Salwar' }
];

const HomePage = () => {
    const slides = Array.from({ length: 11 }, (_, i) => `/images/slide${i + 1}.jpg`);
    const section3Images = Array.from({ length: 12 }, (_, i) => `/images/random${i + 1}.jpg`);

    const womenRef = useRef(null);
    const menRef = useRef(null);
    const kidsRef = useRef(null);

    useEffect(() => {
        const scrollForward = (el) => {
            let scrollAmount = 0;
            return setInterval(() => {
                if (el) {
                    scrollAmount += 1;
                    if (scrollAmount >= el.scrollWidth / 2) scrollAmount = 0;
                    el.scrollLeft = scrollAmount;
                }
            }, 20);
        };

        const scrollBackward = (el) => {
            let scrollAmount = el ? el.scrollWidth / 2 : 0;
            return setInterval(() => {
                if (el) {
                    scrollAmount -= 1;
                    if (scrollAmount <= 0) scrollAmount = el.scrollWidth / 2;
                    el.scrollLeft = scrollAmount;
                }
            }, 20);
        };

        const womenInterval = scrollForward(womenRef.current?.querySelector(".home-section5-slider"));
        const menInterval = scrollBackward(menRef.current?.querySelector(".home-section5-slider"));
        const kidsInterval = scrollForward(kidsRef.current?.querySelector(".home-section5-slider"));

        return () => {
            clearInterval(womenInterval);
            clearInterval(menInterval);
            clearInterval(kidsInterval);
        };
    }, []);


    return (
        <div className="home-section1-wrapper">
            <Navbar />
            {/*<FilterSidebar onFilterChange={(filters) => console.log(filters)} /> */}
            <div className="home-section1">
                <div className="home-section1-overlay">
                    <div className="home-section1-content">
                        <div className="home-section1-left">
                            <video className="home-section1-video" autoPlay muted loop>
                                <source src="/images/logo-video.mp4" type="video/mp4" />
                            </video>
                            <div className="home-section1-full-text">
                                <h1>Taras Kart</h1>
                                {/*<p>Style for Every Story: Men, Women & Kids.</p>
                                <button className="home-section1-button">Shop Now</button> */}
                            </div>
                        </div>
                        <div className="home-section1-right">
                            <div className="category-block">
                                <img src="/images/home4.jpg" alt="Men" />
                                <span>Men</span>
                            </div>
                            <div className="category-block">
                                <img src="/images/home5.jpg" alt="Women" />
                                <span>Women</span>
                            </div>
                            <div className="category-block">
                                <img src="/images/kids-bg.jpg" alt="Kids" />
                                <span>Kids</span>
                            </div>
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



            <section className="home-section5" ref={womenRef}>
                <div className="home-section5-heading">
                    <h2>Women's Collection</h2>
                    <div className="home-section5-underline">
                        <div className="line1 large1"></div>
                        <div className="line1 medium1"></div>
                        <div className="line1 small1"></div>
                    </div>
                </div>
                <div className="home-section5-slider">
                    <div className="home-section5-slider-track">
                        {[...womenItems, ...womenItems].map((item, index) => (
                            <div className="home-section5-card" key={index}>
                                <img src={`/images/women/${item.img}`} alt={item.title} />
                                <h3>{item.title}</h3>
                                <button>Buy Now</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            <section className="home-section5" ref={menRef}>
                <div className="home-section5-heading">
                    <h2>Men's Collection</h2>
                    <div className="home-section5-underline">
                        <div className="line1 large1"></div>
                        <div className="line1 medium1"></div>
                        <div className="line1 small1"></div>
                    </div>
                </div>
                <div className="home-section5-slider">
                    <div className="home-section5-slider-track">
                        {[...menItems, ...menItems].map((item, index) => (
                            <div className="home-section5-card" key={index}>
                                <img src={`/images/men/${item.img}`} alt={item.title} />
                                <h3>{item.title}</h3>
                                <button>Buy Now</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            <section className="home-section5" ref={kidsRef}>
                <div className="home-section5-heading">
                    <h2>Kid's Collection</h2>
                    <div className="home-section5-underline">
                        <div className="line1 large1"></div>
                        <div className="line1 medium1"></div>
                        <div className="line1 small1"></div>
                    </div>
                </div>
                <div className="home-section5-slider">
                    <div className="home-section5-slider-track">
                        {[...kidsItems, ...kidsItems].map((item, index) => (
                            <div className="home-section5-card" key={index}>
                                <img src={`/images/kids/${item.img}`} alt={item.title} />
                                <h3>{item.title}</h3>
                                <button>Buy Now</button>
                            </div>
                        ))}
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


            <section className="mens-sectionh">
                <div className="mens-sectionh-left">
                    <img src="/images/mens-part1.jpg" alt="Left Fashion" />
                </div>
                <div className="mens-sectionh-center">
                    <h2>Exclusive offers</h2>
                    <div className="mens-sectionh-discount">
                        <span className="line"></span>
                        <h1>50% OFF</h1>
                        <span className="line"></span>
                    </div>
                    <h3>Just for you</h3>
                </div>
                <div className="mens-sectionh-right">
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
                <div className="home-section4-underline">
                    <div className="line2 large2"></div>
                    <div className="line2 medium2"></div>
                    <div className="line2 small2"></div>
                </div>
                <div className="home-section4-grid">
                    <a href="/men" className="home-section4-card">
                        <div className="home-section4-text">
                            <h3>Mens <br />Fashions</h3>
                        </div>
                        <img src="/images/card1.jpg" alt="Mens Fashions" />
                    </a>
                    <a href="/women" className="home-section4-card">
                        <div className="home-section4-text">
                            <h3>Womens <br />Fashions</h3>
                        </div>
                        <img src="/images/card3.jpg" alt="Womens Fashions" />
                    </a>
                    <a href="/kids" className="home-section4-card">
                        <div className="home-section4-text">
                            <h3>Kids <br />Fashions</h3>
                        </div>
                        <img src="/images/card4.jpg" alt="Kids Fashions" />
                    </a>
                </div>
            </section>




            <section className="home-section7">
                <h2 className="home-section7-title">Exclusive Waves of Fashion</h2>
                <div className="home-section7-row">
                    {Array.from({ length: 9 }, (_, i) => (
                        <div key={i} className={`home-section7-item item-${i + 1}`}>
                            <img src={`/images/wave${i + 1}.jpeg`} alt={`Wave ${i + 1}`} />
                            {/*<div className="home-section-text">
                                <h3>Brand Name {i + 1}</h3>
                                <p>Product Name {i + 1}</p>
                                <p><strong>50% OFF</strong></p>
                            </div> */}
                        </div>
                    ))}
                </div>
            </section>






            <Footer />
        </div>
    );
};

export default HomePage;
