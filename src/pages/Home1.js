// src/pages/Home1.js
import { useEffect, useRef, useState } from 'react'
import './Home1.css'
import Navbar from './Navbar'
import Footer from './Footer'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper'
import 'swiper/css'
import { Link } from 'react-router-dom'

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://taras-kart-backend.vercel.app'

export default function Home1() {
  const railRef = useRef(null)
  const [imageMap, setImageMap] = useState({})

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/homepage-images`)
        if (!res.ok) return
        const data = await res.json()
        const map = {}
        data.forEach(item => {
          if (item.id && item.imageUrl) {
            map[item.id] = item.imageUrl
          }
        })
        setImageMap(map)
      } catch (e) {}
    }
    run()
  }, [])

  const getImage = path => {
    return imageMap[path] || path
  }

  const scrollLeft = () => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

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
                  <img src={getImage('/images/banners/main-banner2.jpg')} alt="Main Banner" loading="eager" />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home">
                  <img
                    src={getImage('/images/banners/mens-slide3.jpg')}
                    alt="Men Banner"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home">
                  <img
                    src={getImage('/images/banners/womens-slide3.jpg')}
                    alt="Women Banner"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>

        <section className="cat-section-new-home">
          <div className="cat-inner-new-home">
            <div className="cat-head-new-home">
              <h2 className="cat-title-new-home">Category</h2>
              <Link to="/women" className="cat-view-new-home">
                View All
              </Link>
            </div>
            <div className="cat-row-new-home">
              <Link to="/women" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src={getImage('/images/banners/category1.avif')} alt="Category 1" />
                </div>
              </Link>
              <Link to="/men" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src={getImage('/images/banners/category2.avif')} alt="Category 2" />
                </div>
              </Link>
              <Link to="/women" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src={getImage('/images/banners/category3.avif')} alt="Category 3" />
                </div>
              </Link>
              <Link to="/women" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src={getImage('/images/banners/category4.avif')} alt="Category 4" />
                </div>
              </Link>
              <Link to="/kids" className="cat-card-new-home">
                <div className="cat-media-new-home">
                  <img src={getImage('/images/banners/category5.avif')} alt="Category 5" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="wcat-home1">
          <div className="wcat-head-home1">
            <h2 className="wcat-title-home1">Shop by Category</h2>
            <div className="wcat-underline-home1">
              <span className="wl-home1 w1-home1"></span>
              <span className="wl-home1 w2-home1"></span>
              <span className="wl-home1 w3-home1"></span>
            </div>
          </div>

          <div className="wcat-grid-home1">
            <div className="wcat-card-home1">
              <Link to="/women" className="wcat-media-home1">
                <img
                  src={getImage('/images/banners/women-category-anarkali.png')}
                  alt="Anarkali"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="wcat-info-home1">
                <h3 className="wcat-brand-home1">Tara Anarkali</h3>
                <div className="wcat-price-home1">
                  <span className="wcat-mrp-home1">₹3,499</span>
                  <span className="wcat-off-home1">₹4,499</span>
                </div>
                <Link to="/women" className="wcat-buy-home1">
                  Buy Now
                </Link>
              </div>
            </div>

            <div className="wcat-card-home1">
              <Link to="/women" className="wcat-media-home1">
                <img
                  src={getImage('/images/banners/women-category-halfsaree.png')}
                  alt="Half Saree"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="wcat-info-home1">
                <h3 className="wcat-brand-home1">Tara Half Saree</h3>
                <div className="wcat-price-home1">
                  <span className="wcat-mrp-home1">₹5,299</span>
                  <span className="wcat-off-home1">₹6,499</span>
                </div>
                <Link to="/women" className="wcat-buy-home1">
                  Buy Now
                </Link>
              </div>
            </div>

            <div className="wcat-card-home1">
              <Link to="/women" className="wcat-media-home1">
                <img
                  src={getImage('/images/banners/women-category-punjabi.png')}
                  alt="Punjabi Suit"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="wcat-info-home1">
                <h3 className="wcat-brand-home1">Tara Punjabi</h3>
                <div className="wcat-price-home1">
                  <span className="wcat-mrp-home1">₹2,799</span>
                  <span className="wcat-off-home1">₹3,499</span>
                </div>
                <Link to="/women" className="wcat-buy-home1">
                  Buy Now
                </Link>
              </div>
            </div>

            <div className="wcat-card-home1">
              <Link to="/women" className="wcat-media-home1">
                <img
                  src={getImage('/images/banners/women-category-saree.png')}
                  alt="Saree"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="wcat-info-home1">
                <h3 className="wcat-brand-home1">Tara Saree</h3>
                <div className="wcat-price-home1">
                  <span className="wcat-mrp-home1">₹4,199</span>
                  <span className="wcat-off-home1">₹5,299</span>
                </div>
                <Link to="/women" className="wcat-buy-home1">
                  Buy Now
                </Link>
              </div>
            </div>
          </div>

          <div className="wcat-more-home1">
            <Link to="/women" className="wcat-view-home1">
              View More
            </Link>
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
                    <img src={getImage('/images/women/women11.jpeg')} alt="Women 1" />
                  </a>
                  <a href="/women" className="mosaic4-card-new-home">
                    <img src={getImage('/images/women/women12.jpeg')} alt="Women 2" />
                  </a>
                  <a href="/women" className="mosaic4-card-new-home mosaic4-cta-wrap-new-home">
                    <img src={getImage('/images/women/women13.jpeg')} alt="Women 3" />
                    <span className="mosaic4-cta-new-home">Shop Now</span>
                  </a>
                </div>
              </div>

              <div className="mosaic4-block-new-home">
                <div className="mosaic4-grid-new-home">
                  <a href="/men" className="mosaic4-card-new-home">
                    <img src={getImage('/images/men/mens1.jpeg')} alt="Men 1" />
                  </a>
                  <a href="/men" className="mosaic4-card-new-home">
                    <img src={getImage('/images/men/mens2.jpeg')} alt="Men 2" />
                  </a>
                  <a href="/men" className="mosaic4-promo-new-home">
                    <div className="mosaic4-promo-inner-new-home">
                      <span className="mosaic4-head-new-home">Classic Polos</span>
                      <span className="mosaic4-sub-new-home">Min 40% Off</span>
                    </div>
                  </a>
                  <a href="/men" className="mosaic4-card-new-home mosaic4-cta-wrap-new-home">
                    <img src={getImage('/images/men/mens3.jpeg')} alt="Men 3" />
                    <span className="mosaic4-cta-new-home">Shop Now</span>
                  </a>
                </div>
              </div>

              <div className="mosaic4-block-new-home">
                <div className="mosaic4-grid-new-home">
                  <a href="/kids" className="mosaic4-card-new-home">
                    <img src={getImage('/images/kids/kids-formal.jpg')} alt="Kids 1" />
                  </a>
                  <a href="/kids" className="mosaic4-promo-new-home">
                    <div className="mosaic4-promo-inner-new-home">
                      <span className="mosaic4-head-new-home">Sneakers Edit</span>
                      <span className="mosaic4-sub-new-home">Up to 70% Off</span>
                    </div>
                  </a>
                  <a href="/kids" className="mosaic4-card-new-home">
                    <img src={getImage('/images/kids/kids16.jpeg')} alt="Kids 2" />
                  </a>
                  <a href="/kids" className="mosaic4-card-new-home mosaic4-cta-wrap-new-home">
                    <img src={getImage('/images/kids/kids17.jpeg')} alt="Kids 3" />
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
                  <img src={getImage('/images/banners/banner1.jpg')} alt="Women Banner" loading="eager" />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home-2">
                  <img
                    src={getImage('/images/banners/banner2.jpg')}
                    alt="Women Banner"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home-2">
                  <img
                    src={getImage('/images/banners/banner3.jpg')}
                    alt="Women Banner"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>

        <section className="aurum-women">
          <div className="aurum-shell">
            <div className="aurum-head">
              <h2 className="aurum-title">Women’s Categories</h2>
              <a className="aurum-viewall" href="/women">
                View all
              </a>
            </div>

            <div className="aurum-grid">
              <a href="/women" className="aurum-card">
                <div className="aurum-imgwrap">
                  <img
                    src={getImage('/images/women/new/category12.png')}
                    alt="Twin Birds Leggings"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="aurum-info">
                  <div className="aurum-row">
                    <span className="aurum-brand">Twin Birds</span>
                    <span className="aurum-offer">25% OFF</span>
                  </div>
                  <div className="aurum-row">
                    <span className="aurum-cat">Leggings • Viscose</span>
                    <span className="aurum-price">
                      <span className="aurum-strike">₹1,299</span> ₹999
                    </span>
                  </div>
                </div>
              </a>

              <a href="/women" className="aurum-card">
                <div className="aurum-imgwrap">
                  <img
                    src={getImage('/images/women/new/category9.png')}
                    alt="Indian Flower Tops"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="aurum-info">
                  <div className="aurum-row">
                    <span className="aurum-brand">Indian Flower</span>
                    <span className="aurum-offer">30% OFF</span>
                  </div>
                  <div className="aurum-row">
                    <span className="aurum-cat">Tops • Hoodies</span>
                    <span className="aurum-price">
                      <span className="aurum-strike">₹1,799</span> ₹1,259
                    </span>
                  </div>
                </div>
              </a>

              <a href="/women" className="aurum-card">
                <div className="aurum-imgwrap">
                  <img
                    src={getImage('/images/women/new/category10.png')}
                    alt="Twin Birds Kurti Pant"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="aurum-info">
                  <div className="aurum-row">
                    <span className="aurum-brand">Twin Birds</span>
                    <span className="aurum-offer">20% OFF</span>
                  </div>
                  <div className="aurum-row">
                    <span className="aurum-cat">Kurti Pant • Cotton</span>
                    <span className="aurum-price">
                      <span className="aurum-strike">₹1,499</span> ₹1,199
                    </span>
                  </div>
                </div>
              </a>

              <a href="/women" className="aurum-card">
                <div className="aurum-imgwrap">
                  <img
                    src={getImage('/images/women/new/category11.png')}
                    alt="Intimacy Inner Wear"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="aurum-info">
                  <div className="aurum-row">
                    <span className="aurum-brand">Intimacy</span>
                    <span className="aurum-offer">15% OFF</span>
                  </div>
                  <div className="aurum-row">
                    <span className="aurum-cat">Inner Wear</span>
                    <span className="aurum-price">
                      <span className="aurum-strike">₹999</span> ₹849
                    </span>
                  </div>
                </div>
              </a>

              <a href="/women" className="aurum-card">
                <div className="aurum-imgwrap">
                  <img
                    src={getImage('/images/women/new/category13.png')}
                    alt="Naidu Hall Inner Wear"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="aurum-info">
                  <div className="aurum-row">
                    <span className="aurum-brand">Naidu Hall</span>
                    <span className="aurum-offer">35% OFF</span>
                  </div>
                  <div className="aurum-row">
                    <span className="aurum-cat">Inner Wear</span>
                    <span className="aurum-price">
                      <span className="aurum-strike">₹1,399</span> ₹909
                    </span>
                  </div>
                </div>
              </a>

              <a href="/women" className="aurum-card">
                <div className="aurum-imgwrap">
                  <img
                    src={getImage('/images/women/new/category14.png')}
                    alt="Aswathi Inner Wear"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="aurum-info">
                  <div className="aurum-row">
                    <span className="aurum-brand">Aswathi</span>
                    <span className="aurum-offer">22% OFF</span>
                  </div>
                  <div className="aurum-row">
                    <span className="aurum-cat">Inner Wear</span>
                    <span className="aurum-price">
                      <span className="aurum-strike">₹1,199</span> ₹935
                    </span>
                  </div>
                </div>
              </a>

              <a href="/women" className="aurum-card">
                <div className="aurum-imgwrap">
                  <img
                    src={getImage('/images/women/new/category15.png')}
                    alt="Twin Birds T-shirts"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="aurum-info">
                  <div className="aurum-row">
                    <span className="aurum-brand">Twin Birds</span>
                    <span className="aurum-offer">18% OFF</span>
                  </div>
                  <div className="aurum-row">
                    <span className="aurum-cat">T-Shirts • Slim Fit</span>
                    <span className="aurum-price">
                      <span className="aurum-strike">₹1,099</span> ₹901
                    </span>
                  </div>
                </div>
              </a>

              <a href="/women" className="aurum-card">
                <div className="aurum-imgwrap">
                  <img
                    src={getImage('/images/women/new/category16.png')}
                    alt="Indian Flower Lounge Wear"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="aurum-info">
                  <div className="aurum-row">
                    <span className="aurum-brand">Indian Flower</span>
                    <span className="aurum-offer">28% OFF</span>
                  </div>
                  <div className="aurum-row">
                    <span className="aurum-cat">Lounge Wear • Co-ord</span>
                    <span className="aurum-price">
                      <span className="aurum-strike">₹1,899</span> ₹1,367
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        <section className="wb2-sec-home1">
          <div className="wb2-head-home1">
            <h2 className="wb2-title-home1">Women • Twin Birds</h2>
            <Link to="/women?brand=Twin%20Birds" className="wb2-view-home1">
              View All
            </Link>
          </div>

          <div className="wb2-grid-home1">
            <Link to="/women" className="wb2-card-home1">
              <img
                src={getImage('/images/women/new/category-1.png')}
                alt="Kurti Pants"
                className="wb2-img-home1"
              />
              <span className="wb2-tag-home1">Kurti Pants</span>
            </Link>

            <Link to="/women" className="wb2-card-home1">
              <img
                src={getImage('/images/women/new/category-2.png')}
                alt="Leggings"
                className="wb2-img-home1"
              />
              <span className="wb2-tag-home1">Leggings</span>
            </Link>

            <Link to="/women" className="wb2-card-home1">
              <img
                src={getImage('/images/women/new/category-3.png')}
                alt="Lounge Wear"
                className="wb2-img-home1"
              />
              <span className="wb2-tag-home1">Lounge Wear</span>
            </Link>

            <Link to="/women" className="wb2-card-home1">
              <img
                src={getImage('/images/women/new/category-4.png')}
                alt="Shapers"
                className="wb2-img-home1"
              />
              <span className="wb2-tag-home1">Shapers</span>
            </Link>

            <Link to="/women" className="wb2-card-home1">
              <img
                src={getImage('/images/women/new/category-5.png')}
                alt="Straight Pants"
                className="wb2-img-home1"
              />
              <span className="wb2-tag-home1">Straight Pants</span>
            </Link>

            <Link to="/women" className="wb2-card-home1">
              <img
                src={getImage('/images/women/new/category-6.png')}
                alt="T-Shirts"
                className="wb2-img-home1"
              />
              <span className="wb2-tag-home1">T-Shirts</span>
            </Link>

            <Link to="/women" className="wb2-card-home1">
              <img
                src={getImage('/images/women/new/category-7.png')}
                alt="Tops"
                className="wb2-img-home1"
              />
              <span className="wb2-tag-home1">Tops</span>
            </Link>

            <Link to="/women" className="wb2-card-home1">
              <img
                src={getImage('/images/women/new/category-8.png')}
                alt="Kids"
                className="wb2-img-home1"
              />
              <span className="wb2-tag-home1">Kids</span>
            </Link>
          </div>

          <div className="wb2-pills-home1">
            <Link to="/women" className="wb2-pill-home1">
              Cotton Kurti
            </Link>
            <Link to="/women" className="wb2-pill-home1">
              Flexi Kurti Pant
            </Link>
            <Link to="/women" className="wb2-pill-home1">
              Sleek Kurti Pant
            </Link>
            <Link to="/women" className="wb2-pill-home1">
              Viscose Kurti Pant
            </Link>
          </div>
        </section>

        <section className="wb3-sec">
          <div className="wb3-head">
            <h2>Women • Twin Birds</h2>
            <Link to="/women?brand=Twin%20Birds" className="wb3-view">
              View All
            </Link>
          </div>

          <div className="wb3-belt">
            <div className="wb3-track">
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category9.png')} alt="Kurti Pants" />
                <span className="wb3-tag">Kurti Pants</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category10.png')} alt="Leggings" />
                <span className="wb3-tag">Leggings</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category11.png')} alt="Lounge Wear" />
                <span className="wb3-tag">Lounge Wear</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category12.png')} alt="Shapers" />
                <span className="wb3-tag">Shapers</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category13.png')} alt="Straight Pants" />
                <span className="wb3-tag">Straight Pants</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category14.png')} alt="T-Shirts" />
                <span className="wb3-tag">T-Shirts</span>
              </Link>
            </div>

            <div className="wb3-track wb3-track-rev">
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category-1.png')} alt="Tops" />
                <span className="wb3-tag">Tops</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category-2.png')} alt="Kids" />
                <span className="wb3-tag">Kids</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category-3.png')} alt="Viscose Kurti Pant" />
                <span className="wb3-tag">Viscose Kurti Pant</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category-4.png')} alt="Viscose Leggings" />
                <span className="wb3-tag">Viscose Leggings</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category-5.png')} alt="Co-Ord Sets" />
                <span className="wb3-tag">Co-Ord Sets</span>
              </Link>
              <Link to="/women" className="wb3-item">
                <img src={getImage('/images/women/new/category-6.png')} alt="Saree Shaper" />
                <span className="wb3-tag">Saree Shaper</span>
              </Link>
            </div>
          </div>

          <div className="wb3-actions">
            <Link to="/women" className="wb3-pill">
              Cotton Kurti
            </Link>
            <Link to="/women" className="wb3-pill">
              Flexi Kurti Pant
            </Link>
            <Link to="/women" className="wb3-pill">
              Sleek Kurti Pant
            </Link>
            <Link to="/women" className="wb3-pill">
              Viscose Kurti Pant
            </Link>
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
                  <img src={getImage('/images/banners/banner4.png')} alt="Women Banner" loading="eager" />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home-2">
                  <img
                    src={getImage('/images/banners/banner5.png')}
                    alt="Women Banner"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home-2">
                  <img
                    src={getImage('/images/banners/banner6.png')}
                    alt="Women Banner"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>

        <section className="wb4-sec">
          <div className="wb4-head">
            <h2>Women • Indian Flower</h2>
            <Link to="/women" className="wb4-view">
              View All
            </Link>
          </div>

          <div className="wb4-mag">
            <div className="wb4-col">
              <Link to="/women" className="wb4-card">
                <img src={getImage('/images/women/new/zig-zag1.png')} alt="Tops" />
                <span className="wb4-label">Tops</span>
              </Link>
              <Link to="/women" className="wb4-card">
                <img src={getImage('/images/women/new/zig-zag2.png')} alt="Leggings" />
                <span className="wb4-label">Leggings</span>
              </Link>
            </div>

            <div className="wb4-col wb4-col-center">
              <Link to="/women" className="wb4-card wb4-card-tall">
                <img src={getImage('/images/women/new/zig-zag3.png')} alt="Kurti Pants" />
                <span className="wb4-badge">Kurti Pants</span>
              </Link>
            </div>

            <div className="wb4-col">
              <Link to="/women" className="wb4-card">
                <img src={getImage('/images/women/new/zig-zag4.png')} alt="Lounge Wear" />
                <span className="wb4-label">Lounge Wear</span>
              </Link>
              <Link to="/women" className="wb4-card">
                <img src={getImage('/images/women/new/zig-zag5.png')} alt="Straight Pants" />
                <span className="wb4-label">Straight Pants</span>
              </Link>
            </div>
          </div>

          <div className="wb4-chips">
            <Link to="/women" className="wb4-chip">
              T-Shirts
            </Link>
            <Link to="/women" className="wb4-chip">
              Casual Shirt
            </Link>
            <Link to="/women" className="wb4-chip">
              Viscose Leggings
            </Link>
            <Link to="/women" className="wb4-chip">
              Cotton Kurti
            </Link>
          </div>
        </section>

        <section className="wb5-sec">
          <div className="wb5-head">
            <h2 className="wb5-title">Women • Innerwear</h2>
            <Link to="/women" className="wb5-view">
              View All
            </Link>
          </div>

          <div className="wb5-legend">
            <span className="wb5-chip">Intimacy</span>
            <span className="wb5-dot"></span>
            <span className="wb5-chip">Naidu Hall</span>
            <span className="wb5-dot"></span>
            <span className="wb5-chip">Aswathi</span>
          </div>

          <div className="wb5-grid">
            <Link to="/women" className="wb5-card wb5-tall">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/roll1.png')} alt="Intimacy" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Intimacy</span>
                  <span className="wb5-offer">20% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Intimates</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹1,299</span> ₹1,039
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/women" className="wb5-card">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/roll2.png')} alt="Naidu Hall" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Naidu Hall</span>
                  <span className="wb5-offer">30% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Everyday Comfort</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹1,499</span> ₹1,049
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/women" className="wb5-card">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/roll3.png')} alt="Aswathi" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Aswathi</span>
                  <span className="wb5-offer">18% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Soft Touch</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹1,199</span> ₹983
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/women" className="wb5-card">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/roll4.png')} alt="Co-ord Sets" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Intimacy</span>
                  <span className="wb5-offer">25% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Co-ord Sets</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹1,799</span> ₹1,349
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/women" className="wb5-card wb5-wide">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/main-card.png')} alt="Shapers" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Naidu Hall</span>
                  <span className="wb5-offer">28% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Shapers</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹1,999</span> ₹1,439
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/women" className="wb5-card">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/roll5.png')} alt="Comfort" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Aswathi</span>
                  <span className="wb5-offer">22% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Comfort</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹1,099</span> ₹857
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/women" className="wb5-card">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/roll6.png')} alt="Basics" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Intimacy</span>
                  <span className="wb5-offer">15% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Basics</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹899</span> ₹764
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/women" className="wb5-card">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/pin1.jpg')} alt="Premium" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Naidu Hall</span>
                  <span className="wb5-offer">32% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Premium</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹2,199</span> ₹1,495
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/women" className="wb5-card">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/roll8.jpg')} alt="Basics" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Intimacy</span>
                  <span className="wb5-offer">15% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Basics</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹899</span> ₹764
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/women" className="wb5-card">
              <div className="wb5-imgwrap">
                <img src={getImage('/images/women/new/roll1.png')} alt="Premium" />
              </div>
              <div className="wb5-info">
                <div className="wb5-row">
                  <span className="wb5-brand">Naidu Hall</span>
                  <span className="wb5-offer">32% OFF</span>
                </div>
                <div className="wb5-row">
                  <span className="wb5-tag">Premium</span>
                  <span className="wb5-price">
                    <span className="wb5-strike">₹2,199</span> ₹1,495
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="mb1-sec">
          <div className="mb1-head">
            <h2>Men • Collections</h2>
            <Link to="/men" className="mb1-view">
              View All
            </Link>
          </div>

          <div className="mb1-circles">
            <Link to="/men" className="mb1-item">
              <span className="mb1-ring"></span>
              <img src={getImage('/images/men/men-ct-1.png')} alt="Shirts" />
              <span className="mb1-cap">Shirts</span>
            </Link>

            <Link to="/men" className="mb1-item">
              <span className="mb1-ring"></span>
              <img src={getImage('/images/men/men-ct-2.png')} alt="T-Shirts" />
              <span className="mb1-cap">T-Shirts</span>
            </Link>

            <Link to="/men" className="mb1-item">
              <span className="mb1-ring"></span>
              <img src={getImage('/images/men/men-ct-3.png')} alt="Trousers" />
              <span className="mb1-cap">Trousers</span>
            </Link>

            <Link to="/men" className="mb1-item">
              <span className="mb1-ring"></span>
              <img src={getImage('/images/men/men-ct-4.png')} alt="Denim" />
              <span className="mb1-cap">Denim</span>
            </Link>

            <Link to="/men" className="mb1-item">
              <span className="mb1-ring"></span>
              <img src={getImage('/images/men/men-ct-5.png')} alt="Ethnic Wear" />
              <span className="mb1-cap">Ethnic Wear</span>
            </Link>

            <Link to="/men" className="mb1-item">
              <span className="mb1-ring"></span>
              <img src={getImage('/images/men/men-ct-6.png')} alt="Winter" />
              <span className="mb1-cap">Winter</span>
            </Link>

            <Link to="/men" className="mb1-item">
              <span className="mb1-ring"></span>
              <img src={getImage('/images/men/men-ct-7.png')} alt="Footwear" />
              <span className="mb1-cap">Footwear</span>
            </Link>

            <Link to="/men" className="mb1-item">
              <span className="mb1-ring"></span>
              <img src={getImage('/images/men/men-ct-5.png')} alt="Accessories" />
              <span className="mb1-cap">Accessories</span>
            </Link>
          </div>
        </section>

        <section className="mb3-sec">
          <div className="mb3-head">
            <h2>Men • Featured Styles</h2>
            <Link to="/men" className="mb3-view">
              View All
            </Link>
          </div>

          <div className="mb3-carousel">
            <button className="mb3-arrow left" id="mb3-left">
              ‹
            </button>

            <div className="mb3-track" id="mb3-track">
              <Link to="/men/jackets" className="mb3-card">
                <img src={getImage('/images/women/new/roll1.png')} alt="Jackets" />
                <span className="mb3-tag">Jackets</span>
              </Link>
              <Link to="/men/shirts" className="mb3-card">
                <img src={getImage('/images/men/mens1.jpeg')} alt="Shirts" />
                <span className="mb3-tag">Shirts</span>
              </Link>
              <Link to="/men/polos" className="mb3-card">
                <img src={getImage('/images/men/mens2.jpeg')} alt="Polos" />
                <span className="mb3-tag">Polos</span>
              </Link>
              <Link to="/men/trousers" className="mb3-card">
                <img src={getImage('/images/men/mens3.jpeg')} alt="Trousers" />
                <span className="mb3-tag">Trousers</span>
              </Link>
              <Link to="/men/denim" className="mb3-card">
                <img src={getImage('/images/women/new/roll2.png')} alt="Denim" />
                <span className="mb3-tag">Denim</span>
              </Link>
              <Link to="/men/ethnic" className="mb3-card">
                <img src={getImage('/images/women/new/roll3.png')} alt="Ethnic" />
                <span className="mb3-tag">Ethnic</span>
              </Link>
              <Link to="/men/footwear" className="mb3-card">
                <img src={getImage('/images/women/new/roll4.png')} alt="Footwear" />
                <span className="mb3-tag">Footwear</span>
              </Link>
            </div>

            <button className="mb3-arrow right" id="mb3-right">
              ›
            </button>
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
                  <img src={getImage('/images/banners/banner7.png')} alt="Women Banner" loading="eager" />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home-2">
                  <img
                    src={getImage('/images/banners/banner8.png')}
                    alt="Women Banner"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="home1-hero-slide-new-home-2">
                  <img
                    src={getImage('/images/banners/banner9.png')}
                    alt="Women Banner"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>

        <section className="mb4-sec">
          <div className="mb4-head">
            <h2>Men • Essentials Grid</h2>
            <Link to="/men" className="mb4-view">
              View All
            </Link>
          </div>

          <div className="mb4-grid">
            <Link to="/men/shirts" className="mb4-tile mb4-a">
              <img src={getImage('/images/men/mens1.jpeg')} alt="Shirts" />
              <span className="mb4-tag">Shirts</span>
            </Link>

            <Link to="/men/t-shirts" className="mb4-tile mb4-b">
              <img src={getImage('/images/men/mens2.jpeg')} alt="T-Shirts" />
              <span className="mb4-cap">T-Shirts</span>
            </Link>

            <Link to="/men/trousers" className="mb4-tile mb4-c">
              <img src={getImage('/images/men/mens3.jpeg')} alt="Trousers" />
              <span className="mb4-cap">Trousers</span>
            </Link>

            <Link to="/men/denim" className="mb4-tile mb4-d">
              <img src={getImage('/images/women/new/roll2.png')} alt="Denim" />
              <span className="mb4-cap">Denim</span>
            </Link>

            <Link to="/men/jackets" className="mb4-tile mb4-e">
              <img src={getImage('/images/women/new/roll1.png')} alt="Jackets" />
              <span className="mb4-cap">Jackets</span>
            </Link>

            <Link to="/men/ethnic" className="mb4-tile mb4-f">
              <img src={getImage('/images/women/new/roll4.png')} alt="Ethnic" />
              <span className="mb4-cap">Ethnic</span>
            </Link>

            <Link to="/men/footwear" className="mb4-tile mb4-g">
              <img src={getImage('/images/women/new/roll5.png')} alt="Footwear" />
              <span className="mb4-cap">Footwear</span>
            </Link>
          </div>

          <div className="mb4-pills">
            <Link to="/men/shirts/formal" className="mb4-pill">
              Formal
            </Link>
            <Link to="/men/t-shirts/slim-fit" className="mb4-pill">
              Slim Fit
            </Link>
            <Link to="/men/denim/straight" className="mb4-pill">
              Straight Denim
            </Link>
            <Link to="/men/jackets/winter" className="mb4-pill">
              Winter Layer
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
