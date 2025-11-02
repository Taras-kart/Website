// src/pages/Home1.js
import { useRef } from 'react';
import './Home1.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import 'swiper/css';
import { Link } from 'react-router-dom';

export default function Home1() {


  const railRef = useRef(null);

  const scrollLeft = () => {
    railRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };
  const scrollRight = () => {
    railRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };


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





<section className="wb2-sec">
  <div className="wb2-head">
    <h2>Women • Twin Birds</h2>
    <Link to="/women?brand=Twin%20Birds" className="wb2-view">View All</Link>
  </div>
  <div className="wb2-grid">
    <Link to="/women/twin-birds/kurti-pant" className="wb2-card">
      <img src="/images/women/new/category1.png" alt="Kurti Pants" />
      <span className="wb2-tag">Kurti Pants</span>
    </Link>
    <Link to="/women/twin-birds/leggings" className="wb2-card">
      <img src="/images/women/new/category2.png" alt="Leggings" />
      <span className="wb2-tag">Leggings</span>
    </Link>
    <Link to="/women/twin-birds/lounge-wear" className="wb2-card">
      <img src="/images/women/new/category3.png" alt="Lounge Wear" />
      <span className="wb2-tag">Lounge Wear</span>
    </Link>
    <Link to="/women/twin-birds/shapers" className="wb2-card">
      <img src="/images/women/new/category4.png" alt="Shapers" />
      <span className="wb2-tag">Shapers</span>
    </Link>
    <Link to="/women/twin-birds/straight-pant" className="wb2-card">
      <img src="/images/women/new/category5.png" alt="Straight Pants" />
      <span className="wb2-tag">Straight Pants</span>
    </Link>
    <Link to="/women/twin-birds/t-shirts" className="wb2-card">
      <img src="/images/women/new/category6.png" alt="T-Shirts" />
      <span className="wb2-tag">T-Shirts</span>
    </Link>
    <Link to="/women/twin-birds/tops" className="wb2-card">
      <img src="/images/women/new/category7.png" alt="Tops" />
      <span className="wb2-tag">Tops</span>
    </Link>
    <Link to="/women/twin-birds/kids" className="wb2-card">
      <img src="/images/women/new/category8.png" alt="Kids" />
      <span className="wb2-tag">Kids</span>
    </Link>
  </div>
  <div className="wb2-pills">
    <Link to="/women/twin-birds/kurti-pant/cotton-kurti" className="wb2-pill">Cotton Kurti</Link>
    <Link to="/women/twin-birds/kurti-pant/flexi-kurti-pant" className="wb2-pill">Flexi Kurti Pant</Link>
    <Link to="/women/twin-birds/kurti-pant/sleek-kurti-pant" className="wb2-pill">Sleek Kurti Pant</Link>
    <Link to="/women/twin-birds/kurti-pant/viscose-kurti-pant" className="wb2-pill">Viscose Kurti Pant</Link>
  </div>
</section>



<section className="wb3-sec">
  <div className="wb3-head">
    <h2>Women • Twin Birds</h2>
    <Link to="/women?brand=Twin%20Birds" className="wb3-view">View All</Link>
  </div>

  <div className="wb3-belt">
    <div className="wb3-track">
      <Link to="/women/twin-birds/kurti-pant" className="wb3-item">
        <img src="/images/women/new/category1.png" alt="Kurti Pants" />
        <span className="wb3-tag">Kurti Pants</span>
      </Link>
      <Link to="/women/twin-birds/leggings" className="wb3-item">
        <img src="/images/women/new/category2.png" alt="Leggings" />
        <span className="wb3-tag">Leggings</span>
      </Link>
      <Link to="/women/twin-birds/lounge-wear" className="wb3-item">
        <img src="/images/women/new/category3.png" alt="Lounge Wear" />
        <span className="wb3-tag">Lounge Wear</span>
      </Link>
      <Link to="/women/twin-birds/shapers" className="wb3-item">
        <img src="/images/women/new/category4.png" alt="Shapers" />
        <span className="wb3-tag">Shapers</span>
      </Link>
      <Link to="/women/twin-birds/straight-pant" className="wb3-item">
        <img src="/images/women/new/category5.png" alt="Straight Pants" />
        <span className="wb3-tag">Straight Pants</span>
      </Link>
      <Link to="/women/twin-birds/t-shirts" className="wb3-item">
        <img src="/images/women/new/category6.png" alt="T-Shirts" />
        <span className="wb3-tag">T-Shirts</span>
      </Link>
    </div>

    <div className="wb3-track wb3-track-rev">
      <Link to="/women/twin-birds/tops" className="wb3-item">
        <img src="/images/women/new/category7.png" alt="Tops" />
        <span className="wb3-tag">Tops</span>
      </Link>
      <Link to="/women/twin-birds/kids" className="wb3-item">
        <img src="/images/women/new/category8.png" alt="Kids" />
        <span className="wb3-tag">Kids</span>
      </Link>
      <Link to="/women/twin-birds/kurti-pant/viscose-kurti-pant" className="wb3-item">
        <img src="/images/women/new/main-card1.png" alt="Viscose Kurti Pant" />
        <span className="wb3-tag">Viscose Kurti Pant</span>
      </Link>
      <Link to="/women/twin-birds/leggings/viscose" className="wb3-item">
        <img src="/images/women/new/ai-sub-slide2.png" alt="Viscose Leggings" />
        <span className="wb3-tag">Viscose Leggings</span>
      </Link>
      <Link to="/women/twin-birds/lounge-wear/co-order" className="wb3-item">
        <img src="/images/women/new/ai-sub-slide3.png" alt="Co-Ord Sets" />
        <span className="wb3-tag">Co-Ord Sets</span>
      </Link>
      <Link to="/women/twin-birds/shapers/saree-shaper" className="wb3-item">
        <img src="/images/women/new/main-card.png" alt="Saree Shaper" />
        <span className="wb3-tag">Saree Shaper</span>
      </Link>
    </div>
  </div>

  <div className="wb3-actions">
    <Link to="/women/twin-birds/kurti-pant/cotton-kurti" className="wb3-pill">Cotton Kurti</Link>
    <Link to="/women/twin-birds/kurti-pant/flexi-kurti-pant" className="wb3-pill">Flexi Kurti Pant</Link>
    <Link to="/women/twin-birds/kurti-pant/sleek-kurti-pant" className="wb3-pill">Sleek Kurti Pant</Link>
    <Link to="/women/twin-birds/kurti-pant/viscose-kurti-pant" className="wb3-pill">Viscose Kurti Pant</Link>
  </div>
</section>








<section className="wb4-sec">
  <div className="wb4-head">
    <h2>Women • Indian Flower</h2>
    <Link to="/women?brand=Indian%20Flower" className="wb4-view">View All</Link>
  </div>

  <div className="wb4-mag">
    <div className="wb4-col">
      <Link to="/women/indian-flower/tops" className="wb4-card">
        <img src="/images/women/new/category7.png" alt="Tops" />
        <span className="wb4-label">Tops</span>
      </Link>
      <Link to="/women/indian-flower/leggings" className="wb4-card">
        <img src="/images/women/new/category2.png" alt="Leggings" />
        <span className="wb4-label">Leggings</span>
      </Link>
    </div>

    <div className="wb4-col wb4-col-center">
      <Link to="/women/indian-flower/kurti-pant" className="wb4-card wb4-card-tall">
        <img src="/images/women/new/main-card1.png" alt="Kurti Pants" />
        <span className="wb4-badge">Kurti Pants</span>
      </Link>
    </div>

    <div className="wb4-col">
      <Link to="/women/indian-flower/lounge-wear" className="wb4-card">
        <img src="/images/women/new/category3.png" alt="Lounge Wear" />
        <span className="wb4-label">Lounge Wear</span>
      </Link>
      <Link to="/women/indian-flower/straight-pant" className="wb4-card">
        <img src="/images/women/new/category5.png" alt="Straight Pants" />
        <span className="wb4-label">Straight Pants</span>
      </Link>
    </div>
  </div>

  <div className="wb4-chips">
    <Link to="/women/indian-flower/t-shirts" className="wb4-chip">T-Shirts</Link>
    <Link to="/women/indian-flower/tops/casual-shirt" className="wb4-chip">Casual Shirt</Link>
    <Link to="/women/indian-flower/leggings/viscose" className="wb4-chip">Viscose Leggings</Link>
    <Link to="/women/indian-flower/kurti-pant/cotton-kurti" className="wb4-chip">Cotton Kurti</Link>
  </div>
</section>








<section className="wb5-sec">
  <div className="wb5-head">
    <h2>Women • Innerwear Edit</h2>
    <Link to="/women?category=innerwear" className="wb5-view">View All</Link>
  </div>

  <div className="wb5-legend">
    <span className="wb5-chip">Intimacy</span>
    <span className="wb5-dot"></span>
    <span className="wb5-chip">Naidu Hall</span>
    <span className="wb5-dot"></span>
    <span className="wb5-chip">Aswathi</span>
  </div>

  <div className="wb5-grid">
    <Link to="/women/innerwear/intimacy" className="wb5-card wb5-tall">
      <img src="/images/women/new/roll1.png" alt="Intimacy" />
      <span className="wb5-tag">Intimacy</span>
    </Link>
    <Link to="/women/innerwear/naidu-hall" className="wb5-card">
      <img src="/images/women/new/roll2.png" alt="Naidu Hall" />
      <span className="wb5-tag">Naidu Hall</span>
    </Link>
    <Link to="/women/innerwear/aswathi" className="wb5-card">
      <img src="/images/women/new/roll3.png" alt="Aswathi" />
      <span className="wb5-tag">Aswathi</span>
    </Link>
    <Link to="/women/innerwear/sets" className="wb5-card">
      <img src="/images/women/new/roll4.png" alt="Sets" />
      <span className="wb5-tag">Co-ord Sets</span>
    </Link>
    <Link to="/women/innerwear/shapers" className="wb5-card wb5-wide">
      <img src="/images/women/new/main-card.png" alt="Shapers" />
      <span className="wb5-tag">Shapers</span>
    </Link>
    <Link to="/women/innerwear/comfort" className="wb5-card">
      <img src="/images/women/new/roll5.png" alt="Comfort" />
      <span className="wb5-tag">Comfort</span>
    </Link>
    <Link to="/women/innerwear/basics" className="wb5-card">
      <img src="/images/women/new/roll6.png" alt="Basics" />
      <span className="wb5-tag">Basics</span>
    </Link>
    <Link to="/women/innerwear/premium" className="wb5-card">
      <img src="/images/women/new/roll7.png" alt="Premium" />
      <span className="wb5-tag">Premium</span>
    </Link>
  </div>
</section>












<section className="mb1-sec">
  <div className="mb1-head">
    <h2>Men • Collections</h2>
    <Link to="/men" className="mb1-view">View All</Link>
  </div>

  <div className="mb1-circles">
    <Link to="/men/shirts" className="mb1-item">
      <span className="mb1-ring"></span>
      <img src="/images/men/mens1.jpeg" alt="Shirts" />
      <span className="mb1-cap">Shirts</span>
    </Link>

    <Link to="/men/t-shirts" className="mb1-item">
      <span className="mb1-ring"></span>
      <img src="/images/men/mens2.jpeg" alt="T-Shirts" />
      <span className="mb1-cap">T-Shirts</span>
    </Link>

    <Link to="/men/trousers" className="mb1-item">
      <span className="mb1-ring"></span>
      <img src="/images/men/mens3.jpeg" alt="Trousers" />
      <span className="mb1-cap">Trousers</span>
    </Link>

    <Link to="/men/denim" className="mb1-item">
      <span className="mb1-ring"></span>
      <img src="/images/women/new/roll1.png" alt="Denim" />
      <span className="mb1-cap">Denim</span>
    </Link>

    <Link to="/men/ethnic" className="mb1-item">
      <span className="mb1-ring"></span>
      <img src="/images/women/new/roll2.png" alt="Ethnic Wear" />
      <span className="mb1-cap">Ethnic Wear</span>
    </Link>

    <Link to="/men/winter" className="mb1-item">
      <span className="mb1-ring"></span>
      <img src="/images/women/new/roll3.png" alt="Winter" />
      <span className="mb1-cap">Winter</span>
    </Link>

    <Link to="/men/footwear" className="mb1-item">
      <span className="mb1-ring"></span>
      <img src="/images/women/new/roll4.png" alt="Footwear" />
      <span className="mb1-cap">Footwear</span>
    </Link>

    <Link to="/men/accessories" className="mb1-item">
      <span className="mb1-ring"></span>
      <img src="/images/women/new/roll5.png" alt="Accessories" />
      <span className="mb1-cap">Accessories</span>
    </Link>
  </div>
</section>












<section className="mb3-sec">
  <div className="mb3-head">
    <h2>Men • Featured Styles</h2>
    <Link to="/men" className="mb3-view">View All</Link>
  </div>

  <div className="mb3-carousel">
    <button className="mb3-arrow left" id="mb3-left">‹</button>

    <div className="mb3-track" id="mb3-track">
      <Link to="/men/jackets" className="mb3-card">
        <img src="/images/women/new/roll1.png" alt="Jackets" />
        <span className="mb3-tag">Jackets</span>
      </Link>
      <Link to="/men/shirts" className="mb3-card">
        <img src="/images/men/mens1.jpeg" alt="Shirts" />
        <span className="mb3-tag">Shirts</span>
      </Link>
      <Link to="/men/polos" className="mb3-card">
        <img src="/images/men/mens2.jpeg" alt="Polos" />
        <span className="mb3-tag">Polos</span>
      </Link>
      <Link to="/men/trousers" className="mb3-card">
        <img src="/images/men/mens3.jpeg" alt="Trousers" />
        <span className="mb3-tag">Trousers</span>
      </Link>
      <Link to="/men/denim" className="mb3-card">
        <img src="/images/women/new/roll2.png" alt="Denim" />
        <span className="mb3-tag">Denim</span>
      </Link>
      <Link to="/men/ethnic" className="mb3-card">
        <img src="/images/women/new/roll3.png" alt="Ethnic" />
        <span className="mb3-tag">Ethnic</span>
      </Link>
      <Link to="/men/footwear" className="mb3-card">
        <img src="/images/women/new/roll4.png" alt="Footwear" />
        <span className="mb3-tag">Footwear</span>
      </Link>
    </div>

    <button className="mb3-arrow right" id="mb3-right">›</button>
  </div>
</section>






<section className="mb4-sec">
  <div className="mb4-head">
    <h2>Men • Essentials Grid</h2>
    <Link to="/men" className="mb4-view">View All</Link>
  </div>

  <div className="mb4-grid">
    <Link to="/men/shirts" className="mb4-tile mb4-a">
      <img src="/images/men/mens1.jpeg" alt="Shirts" />
      <span className="mb4-tag">Shirts</span>
    </Link>

    <Link to="/men/t-shirts" className="mb4-tile mb4-b">
      <img src="/images/men/mens2.jpeg" alt="T-Shirts" />
      <span className="mb4-cap">T-Shirts</span>
    </Link>

    <Link to="/men/trousers" className="mb4-tile mb4-c">
      <img src="/images/men/mens3.jpeg" alt="Trousers" />
      <span className="mb4-cap">Trousers</span>
    </Link>

    <Link to="/men/denim" className="mb4-tile mb4-d">
      <img src="/images/women/new/roll2.png" alt="Denim" />
      <span className="mb4-cap">Denim</span>
    </Link>

    <Link to="/men/jackets" className="mb4-tile mb4-e">
      <img src="/images/women/new/roll1.png" alt="Jackets" />
      <span className="mb4-cap">Jackets</span>
    </Link>

    <Link to="/men/ethnic" className="mb4-tile mb4-f">
      <img src="/images/women/new/roll4.png" alt="Ethnic" />
      <span className="mb4-cap">Ethnic</span>
    </Link>

    <Link to="/men/footwear" className="mb4-tile mb4-g">
      <img src="/images/women/new/roll5.png" alt="Footwear" />
      <span className="mb4-cap">Footwear</span>
    </Link>
  </div>

  <div className="mb4-pills">
    <Link to="/men/shirts/formal" className="mb4-pill">Formal</Link>
    <Link to="/men/t-shirts/slim-fit" className="mb4-pill">Slim Fit</Link>
    <Link to="/men/denim/straight" className="mb4-pill">Straight Denim</Link>
    <Link to="/men/jackets/winter" className="mb4-pill">Winter Layer</Link>
  </div>
</section>






      </div>
      <Footer />
    </div>
  );
}
