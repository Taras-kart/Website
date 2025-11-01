// src/pages/Home1.js
import React from 'react';
import './Home1.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import 'swiper/css';
import { Link } from 'react-router-dom';

export default function Home1() {
  return (
    <div className="home1-page-new-home">
      <Navbar />
      <div className="spacer-new-home">

        <section className="home1-hero-new-home">
          <div className="home1-hero-frame-new-home">
            <Swiper
              className="home1-hero-swiper-new-home"
              modules={[Autoplay]}
              loop
              slidesPerView={1}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              speed={900}
            >
              <SwiperSlide>
                <div className="home1-hero-slide-new-home">
                  <img src="/images/banners/main-banner2.jpg" alt="Main Banner" loading="eager" />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home">
                  <img src="/images/banners/mens-slide3.jpg" alt="Men Banner" loading="lazy" decoding="async" />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home">
                  <img src="/images/banners/womens-slide3.jpg" alt="Women Banner" loading="lazy" decoding="async" />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>

        <section className="cat-section-new-home">
          <div className="cat-inner-new-home">
            <div className="cat-head-new-home">
              <h2 className="cat-title-new-home">Category</h2>
              <Link to="/women" className="cat-view-new-home">View All</Link>
            </div>
            <div className="cat-row-new-home">
              <Link to="/women" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src="/images/banners/category1.avif" alt="Category 1" />
                </div>
              </Link>
              <Link to="/men" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src="/images/banners/category2.avif" alt="Category 2" />
                </div>
              </Link>
              <Link to="/women" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src="/images/banners/category3.avif" alt="Category 3" />
                </div>
              </Link>
              <Link to="/women" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src="/images/banners/category4.avif" alt="Category 4" />
                </div>
              </Link>
              <Link to="/kids" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src="/images/banners/category5.avif" alt="Category 5" />
                </div>
              </Link>
            </div>
          </div>
        </section>


        <section className="mosaic4-new-home">
          <div className="mosaic4-shell-new-home">
            <h2 className="mosaic4-title-new-home">Trending Now</h2>

            <div className="mosaic4-row-new-home">
              <div className="mosaic4-block-new-home">
                <div className="mosaic4-grid-new-home">
                  <a href="/women" className="mosaic4-promo-new-home">
                    <div className="mosaic4-promo-inner-new-home">
                      <span className="mosaic4-head-new-home">Tailored Trousers</span>
                      <span className="mosaic4-sub-new-home">Up to 65% Off</span>
                    </div>
                  </a>
                  <a href="/women" className="mosaic4-card-new-home">
                    <img src="/images/women/women11.jpeg" alt="Women 1" />
                  </a>
                  <a href="/women" className="mosaic4-card-new-home">
                    <img src="/images/women/women12.jpeg" alt="Women 2" />
                  </a>
                  <a href="/women" className="mosaic4-card-new-home mosaic4-cta-wrap-new-home">
                    <img src="/images/women/women13.jpeg" alt="Women 3" />
                    <span className="mosaic4-cta-new-home">Shop Now</span>
                  </a>
                </div>
              </div>

              <div className="mosaic4-block-new-home">
                <div className="mosaic4-grid-new-home">

                  <a href="/men" className="mosaic4-card-new-home">
                    <img src="/images/men/mens1.jpeg" alt="Men 1" />
                  </a>
                  <a href="/men" className="mosaic4-card-new-home">
                    <img src="/images/men/mens2.jpeg" alt="Men 2" />
                  </a>
                  <a href="/men" className="mosaic4-promo-new-home">
                    <div className="mosaic4-promo-inner-new-home">
                      <span className="mosaic4-head-new-home">Classic Polos</span>
                      <span className="mosaic4-sub-new-home">Min 40% Off</span>
                    </div>
                  </a>
                  <a href="/men" className="mosaic4-card-new-home mosaic4-cta-wrap-new-home">
                    <img src="/images/men/mens3.jpeg" alt="Men 3" />
                    <span className="mosaic4-cta-new-home">Shop Now</span>
                  </a>
                </div>
              </div>

              <div className="mosaic4-block-new-home">
                <div className="mosaic4-grid-new-home">

                  <a href="/kids" className="mosaic4-card-new-home">
                    <img src="/images/kids/kids-formal.jpg" alt="Kids 1" />
                  </a>
                  <a href="/kids" className="mosaic4-promo-new-home">
                    <div className="mosaic4-promo-inner-new-home">
                      <span className="mosaic4-head-new-home">Sneakers Edit</span>
                      <span className="mosaic4-sub-new-home">Up to 70% Off</span>
                    </div>
                  </a>
                  <a href="/kids" className="mosaic4-card-new-home">
                    <img src="/images/kids/kids16.jpeg" alt="Kids 2" />
                  </a>
                  <a href="/kids" className="mosaic4-card-new-home mosaic4-cta-wrap-new-home">
                    <img src="/images/kids/kids17.jpeg" alt="Kids 3" />
                    <span className="mosaic4-cta-new-home">Shop Now</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="home1-hero-new-home-2">
          <div className="home1-hero-frame-new-home-2">
            <Swiper
              className="home1-hero-swiper-new-home-2"
              modules={[Autoplay]}
              loop
              slidesPerView={1}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              speed={900}
            >
              <SwiperSlide>
                <div className="home1-hero-slide-new-home-2">
                  <img src="/images/banners/banner1.jpg" alt="Women Banner" loading="eager" />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home-2">
                  <img src="/images/banners/banner2.jpg" alt="Women Banner" loading="lazy" decoding="async" />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home-2">
                  <img src="/images/banners/banner3.jpg" alt="Women Banner" loading="lazy" decoding="async" />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>



        <section className="ai-cats-test">
          <div className="ai-cats-head-test">
            <h2 className="ai-cats-title-test">Women’s Categories</h2>
            <div className="ai-cats-underline-test">
              <span className="ac-test ac1-test"></span>
              <span className="ac-test ac2-test"></span>
              <span className="ac-test ac3-test"></span>
            </div>
          </div>
          <div className="ai-cats-shell-test">
            <div className="ai-cats-grid-test">
              <a href="/women" className="ai-cats-card-test">
                <div className="ai-cats-inner-test">
                  <img src="/images/ai/category1.png" alt="" loading="lazy" decoding="async" />
                </div>
              </a>
              <a href="/women" className="ai-cats-card-test">
                <div className="ai-cats-inner-test">
                  <img src="/images/ai/category2.png" alt="" loading="lazy" decoding="async" />
                </div>
              </a>
              <a href="/women" className="ai-cats-card-test">
                <div className="ai-cats-inner-test">
                  <img src="/images/ai/category3.png" alt="" loading="lazy" decoding="async" />
                </div>
              </a>
              <a href="/women" className="ai-cats-card-test">
                <div className="ai-cats-inner-test">
                  <img src="/images/ai/category4.png" alt="" loading="lazy" decoding="async" />
                </div>
              </a>
              <a href="/women" className="ai-cats-card-test">
                <div className="ai-cats-inner-test">
                  <img src="/images/ai/category5.png" alt="" loading="lazy" decoding="async" />
                </div>
              </a>
              <a href="/women" className="ai-cats-card-test">
                <div className="ai-cats-inner-test">
                  <img src="/images/ai/category6.png" alt="" loading="lazy" decoding="async" />
                </div>
              </a>
              <a href="/women" className="ai-cats-card-test">
                <div className="ai-cats-inner-test">
                  <img src="/images/ai/category7.png" alt="" loading="lazy" decoding="async" />
                </div>
              </a>
              <a href="/women" className="ai-cats-card-test">
                <div className="ai-cats-inner-test">
                  <img src="/images/ai/category8.png" alt="" loading="lazy" decoding="async" />
                </div>
              </a>
            </div>
          </div>
        </section>







      </div>
      <Footer />
    </div>
  );
}
