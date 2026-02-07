// src/pages/Home1.js
import { useEffect, useState } from 'react'
import './Home1.css'
import Navbar from './Navbar'
import Footer from './Footer'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper'
import 'swiper/css'
import { Link } from 'react-router-dom'
import Divider from './Divider'

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://taras-kart-backend.vercel.app'

export default function Home1() {
  //const railRef = useRef(null)
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
      } catch (e) { }
    }
    run()
  }, [])

  const getImage = path => {
    return imageMap[path] || path
  }

  const [coolTab, setCoolTab] = useState('plazzo')

  const coolImages = {
    plazzo: [
      '/images/updated/plazzo1.webp',
      '/images/updated/plazzo2.webp',
      '/images/updated/plazzo3.webp',
      '/images/updated/plazzo4.webp'
    ],
    jeggings: [
      '/images/updated/jeggings1.webp',
      '/images/updated/jeggings2.webp',
      '/images/updated/jeggings3.webp',
      '/images/updated/jeggings4.webp'
    ],
    nightPants: [
      '/images/updated/night-pants1.webp',
      '/images/updated/night-pants4.webp',
      '/images/updated/night-pants4.webp',
      '/images/updated/night-pants4.webp'
    ],
    tshirts: [
      '/images/updated/t-shirt1.webp',
      '/images/updated/t-shirt2.webp',
      '/images/updated/t-shirt3.webp',
      '/images/updated/t-shirt4.webp'
    ]
  }

  //const scrollLeft = () => {
  //  if (railRef.current) {
  //    railRef.current.scrollBy({ left: -300, behavior: 'smooth' })
  //  }
  //}

  //const scrollRight = () => {
  //  if (railRef.current) {
  //   railRef.current.scrollBy({ left: 300, behavior: 'smooth' })
  // }
  // } 

  return (
    <div className="home1-page-new-home">
      <Navbar />
      <div className="spacer-new-home">
        <section className="home1-hero-new-home">
          <div className="home1-hero-frame-new-home">
            <img src={getImage('/images/home-screen-main.png')} alt="Home Banner" loading="eager" />
          </div>
        </section>

        <Divider label="Women" direction="ltr" />


        <section className="fc-section">
  <div className="fc-inner">
    <div className="fc-head">
      <h2 className="fc-title">Featured Collections</h2>
    </div>

    <div className="fc-grid">
      <Link to="/category-display?brand=Twin%20Birds" className="fc-card">
        <div className="fc-media">
          <img src={getImage('/images/updated/category-kurti-pant.webp')} alt="Kurti Pant" />

          <div className="fc-brandBadge" aria-label="Twin Birds">
            <img
              src={getImage('/images/brands/twin-birds-brand.jpeg')}
              alt="Twin Birds"
              loading="lazy"
            />
          </div>
        </div>
      </Link>

      <Link to="/category-display?brand=Indian%20Flower" className="fc-card">
        <div className="fc-media">
          <img src={getImage('/images/updated/category-leggin.webp')} alt="Leggin" />

          <div className="fc-brandBadge" aria-label="Indian Flower">
            <img
              src={getImage('/images/brands/indian-flower-brand.jpeg')}
              alt="Indian Flower"
              loading="lazy"
            />
          </div>
        </div>
      </Link>

      <Link to="/category-display?brand=Intimacy" className="fc-card">
        <div className="fc-media">
          <img src={getImage('/images/updated/category-metallic-pant.webp')} alt="Metallic Pant" />

          <div className="fc-brandBadge" aria-label="Intimacy">
            <img
              src={getImage('/images/brands/intimacy-brand.jpeg')}
              alt="Intimacy"
              loading="lazy"
            />
          </div>
        </div>
      </Link>

      <Link to="/category-display?brand=Naidu%20Hall" className="fc-card">
        <div className="fc-media">
          <img src={getImage('/images/updated/category-plazzo-pant.webp')} alt="Plazzo Pant" />

          <div className="fc-brandBadge" aria-label="Naidu Hall">
            <img
              src={getImage('/images/brands/naidu-hall-brand.avif')}
              alt="Naidu Hall"
              loading="lazy"
            />
          </div>
        </div>
      </Link>

      <Link to="/category-display?brand=Aswathi" className="fc-card">
        <div className="fc-media">
          <img src={getImage('/images/updated/category-saree-shaper.webp')} alt="Saree Shaper" />

          <div className="fc-brandBadge" aria-label="Aswathi">
            <img
              src={getImage('/images/brands/aswathi-brand.jpeg')}
              alt="Aswathi"
              loading="lazy"
            />
          </div>
        </div>
      </Link>

      <Link to="/category-display" className="fc-card fc-viewall">
        <div className="fc-media fc-viewall-media">
          <div className="fc-viewall-content">
            <span className="fc-viewall-title">View All</span>
            <span className="fc-viewall-sub">Women’s Collection</span>
          </div>
        </div>
      </Link>
    </div>
  </div>
</section>

        <Divider label="Women" direction="ltr" />

        <section className="home-part-grid">
          <div className="home-part-inner">
            <div className="home-part-card">
              <img src={getImage('/images/updated/grid1.jpg')} alt="Women Tops" className="home-part-img" />
            </div>

            <div className="home-part-text">
              <h3 className="home-part-title">Women Tops</h3>
              <p className="home-part-sub">Fresh fits for everyday styling</p>
              <Link to="/women" className="home-part-btn">Shop Now →</Link>
            </div>

            <div className="home-part-card">
              <img src={getImage('/images/updated/grid2.jpg')} alt="Plazzo Pants" className="home-part-img" />
            </div>

            <div className="home-part-text">
              <h3 className="home-part-title">Plazzo Pants</h3>
              <p className="home-part-sub">Flowy comfort, clean look</p>
              <Link to="/women" className="home-part-btn">Explore →</Link>
            </div>

            <div className="home-part-text">
              <h3 className="home-part-title">Kurtis</h3>
              <p className="home-part-sub">Classic prints and easy silhouettes</p>
              <Link to="/women" className="home-part-btn">View Styles →</Link>
            </div>

            <div className="home-part-card">
              <img src={getImage('/images/updated/grid3.jpg')} alt="Women Kurtis" className="home-part-img" />
            </div>

            <div className="home-part-text">
              <h3 className="home-part-title">Leggings</h3>
              <p className="home-part-sub">Stretch, support, all day comfort</p>
              <Link to="/women" className="home-part-btn">Shop Leggings →</Link>
            </div>

            <div className="home-part-card">
              <img src={getImage('/images/updated/grid4.jpg')} alt="Women Leggings" className="home-part-img" />
            </div>
          </div>
        </section>

        <Divider label="Women" direction="ltr" />

        <section className="cool4-sec">
          <div className="cool4-shell">
            <h2 className="cool4-title">Stay Cool in Style</h2>

            <div className="cool4-tabs" role="tablist" aria-label="Stay Cool in Style">
              <button
                type="button"
                className={`cool4-tab ${coolTab === 'plazzo' ? 'is-active' : ''}`}
                onClick={() => setCoolTab('plazzo')}
                role="tab"
                aria-selected={coolTab === 'plazzo'}
              >
                Plazzo
              </button>
              <button
                type="button"
                className={`cool4-tab ${coolTab === 'jeggings' ? 'is-active' : ''}`}
                onClick={() => setCoolTab('jeggings')}
                role="tab"
                aria-selected={coolTab === 'jeggings'}
              >
                Jeggings
              </button>
              <button
                type="button"
                className={`cool4-tab ${coolTab === 'nightPants' ? 'is-active' : ''}`}
                onClick={() => setCoolTab('nightPants')}
                role="tab"
                aria-selected={coolTab === 'nightPants'}
              >
                Night Pants
              </button>
              <button
                type="button"
                className={`cool4-tab ${coolTab === 'tshirts' ? 'is-active' : ''}`}
                onClick={() => setCoolTab('tshirts')}
                role="tab"
                aria-selected={coolTab === 'tshirts'}
              >
                T-Shirts
              </button>
            </div>

            <div className="cool4-grid" role="tabpanel">
              {coolImages[coolTab].map((src, idx) => (
                <Link to="/women" className="cool4-card" key={`${coolTab}-${idx}`}>
                  <div className="cool4-media">
                    <img src={getImage(src)} alt="" loading="lazy" decoding="async" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Divider label="Women" direction="ltr" />

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

        <section className="aurum2-sec">
          <div className="aurum2-shell">
            <div className="aurum2-head">
              <div className="aurum2-kicker">Explore</div>
              <h2 className="aurum2-title">Women’s Categories</h2>
              <p className="aurum2-sub">Handpicked picks to refresh your wardrobe, in one glance.</p>
              <a className="aurum2-view" href="/women">View all</a>
            </div>

            <div className="aurum2-grid">
              <a href="/women" className="aurum2-card">
                <div className="aurum2-media">
                  <img src={getImage('/images/women/new/category12.png')} alt="Twin Birds Leggings" loading="lazy" decoding="async" />
                  <div className="aurum2-badge">Twin Birds</div>
                </div>
                <div className="aurum2-meta">
                  <div className="aurum2-cat">Salwar Kameez</div>
                  <div className="aurum2-cta">Shop</div>
                </div>
              </a>

              <a href="/women" className="aurum2-card">
                <div className="aurum2-media">
                  <img src={getImage('/images/women/new/category9.png')} alt="Indian Flower Tops" loading="lazy" decoding="async" />
                  <div className="aurum2-badge">Indian Flower</div>
                </div>
                <div className="aurum2-meta">
                  <div className="aurum2-cat">Punjabi Suits</div>
                  <div className="aurum2-cta">Shop</div>
                </div>
              </a>

              <a href="/women" className="aurum2-card">
                <div className="aurum2-media">
                  <img src={getImage('/images/women/new/category10.png')} alt="Twin Birds Kurti Pant" loading="lazy" decoding="async" />
                  <div className="aurum2-badge">Twin Birds</div>
                </div>
                <div className="aurum2-meta">
                  <div className="aurum2-cat">Anarkali Suits</div>
                  <div className="aurum2-cta">Shop</div>
                </div>
              </a>

              <a href="/women" className="aurum2-card">
                <div className="aurum2-media">
                  <img src={getImage('/images/women/new/category11.png')} alt="Intimacy Inner Wear" loading="lazy" decoding="async" />
                  <div className="aurum2-badge">Intimacy</div>
                </div>
                <div className="aurum2-meta">
                  <div className="aurum2-cat">Half Saree</div>
                  <div className="aurum2-cta">Shop</div>
                </div>
              </a>

              <a href="/women" className="aurum2-card">
                <div className="aurum2-media">
                  <img src={getImage('/images/women/new/category13.png')} alt="Naidu Hall Inner Wear" loading="lazy" decoding="async" />
                  <div className="aurum2-badge">Naidu Hall</div>
                </div>
                <div className="aurum2-meta">
                  <div className="aurum2-cat">Gowns</div>
                  <div className="aurum2-cta">Shop</div>
                </div>
              </a>

              <a href="/women" className="aurum2-card">
                <div className="aurum2-media">
                  <img src={getImage('/images/women/new/category14.png')} alt="Aswathi Inner Wear" loading="lazy" decoding="async" />
                  <div className="aurum2-badge">Aswathi</div>
                </div>
                <div className="aurum2-meta">
                  <div className="aurum2-cat">Sharara Suits</div>
                  <div className="aurum2-cta">Shop</div>
                </div>
              </a>

              <a href="/women" className="aurum2-card">
                <div className="aurum2-media">
                  <img src={getImage('/images/women/new/category15.png')} alt="Twin Birds T-shirts" loading="lazy" decoding="async" />
                  <div className="aurum2-badge">Twin Birds</div>
                </div>
                <div className="aurum2-meta">
                  <div className="aurum2-cat">Lehenga Choli</div>
                  <div className="aurum2-cta">Shop</div>
                </div>
              </a>

              <a href="/women" className="aurum2-card">
                <div className="aurum2-media">
                  <img src={getImage('/images/women/new/category16.png')} alt="Indian Flower Lounge Wear" loading="lazy" decoding="async" />
                  <div className="aurum2-badge">Indian Flower</div>
                </div>
                <div className="aurum2-meta">
                  <div className="aurum2-cat">Palazzo Suits</div>
                  <div className="aurum2-cta">Shop</div>
                </div>
              </a>
            </div>
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

        <Divider label="Women" direction="ltr" />

        <section className="wb3x-sec">
          <div className="wb3x-shell">
            <div className="wb3x-head">
              <h2 className="wb3x-title">Our Popular Brands</h2>
            </div>

            <div className="wb3x-body">
              <div className="wb3x-left">
                <div className="wb3x-leftTop">
                  <div className="wb3x-kicker">Shop by brand</div>
                  <div className="wb3x-note">Pick a brand and explore women’s collections.</div>
                </div>

                <div className="wb3x-brandGrid">
                  <Link to="/women?brand=Twin%20Birds" className="wb3x-brand">Twin Birds</Link>
                  <Link to="/women?brand=Naidu%20Hall" className="wb3x-brand">Naidu Hall</Link>
                  <Link to="/women?brand=Intimacy" className="wb3x-brand">Intimacy</Link>
                  <Link to="/women?brand=Aswathi" className="wb3x-brand">Aswathi</Link>
                  <Link to="/women?brand=Indian%20Flower" className="wb3x-brand">Indian Flower</Link>
                  <Link to="/women?brand=Jockey" className="wb3x-brand">Jockey</Link>
                  <Link to="/women?brand=Enamor" className="wb3x-brand">Enamor</Link>
                  <Link to="/women?brand=Amante" className="wb3x-brand">Amante</Link>
                  <Link to="/women?brand=Triumph" className="wb3x-brand">Triumph</Link>
                  <Link to="/women?brand=Lovable" className="wb3x-brand">Lovable</Link>

                  <Link to="/women?brand=Zivame" className="wb3x-brand">Zivame</Link>
                  <Link to="/women?brand=Clovia" className="wb3x-brand">Clovia</Link>
                  <Link to="/women?brand=PrettySecrets" className="wb3x-brand">PrettySecrets</Link>
                  <Link to="/women?brand=Van%20Heusen" className="wb3x-brand">Van Heusen</Link>
                  <Link to="/women?brand=Hanes" className="wb3x-brand">Hanes</Link>
                  <Link to="/women?brand=Rupa" className="wb3x-brand">Rupa</Link>
                  <Link to="/women?brand=Dixcy%20Scott" className="wb3x-brand">Dixcy Scott</Link>
                  <Link to="/women?brand=Lux" className="wb3x-brand">Lux</Link>
                  <Link to="/women?brand=Dollar" className="wb3x-brand">Dollar</Link>
                  <Link to="/women?brand=VIP" className="wb3x-brand">VIP</Link>
                </div>

                <div className="wb3x-actions">
                  <Link to="/women" className="wb3x-cta">Explore Women’s Store</Link>
                </div>
              </div>

              <div className="wb3x-right" aria-hidden="true">
                <div className="wb3x-photo">
                  <img src={getImage('/images/contact-side.jpg')} alt="" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Divider label="Women" direction="ltr" />


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
        <Divider label="Women" direction="ltr" />

        <section className="three-clock-section">
          <div className="three-clock-grid">
            <div className="three-clock-card">
              <img src={getImage('/images/updated/left.jpg')} alt="Women styling collection" className="three-clock-img" />
              <div className="three-clock-overlay" />
              <div className="three-clock-content">
                <h3 className="three-clock-title">Everyday Essentials</h3>
                <p className="three-clock-desc">
                  Clean, comfortable picks for workdays and weekends, made to keep you looking sharp with zero effort.
                </p>
                <Link to="/women" className="three-clock-btn">Shop Women →</Link>
              </div>
            </div>

            <div className="three-clock-card three-clock-center">
              <img src={getImage('/images/updated/center.jpg')} alt="New arrivals highlight" className="three-clock-img" />
              <div className="three-clock-overlay" />
            </div>

            <div className="three-clock-card">
              <img src={getImage('/images/updated/right.jpg')} alt="Women seasonal edits" className="three-clock-img" />
              <div className="three-clock-overlay" />
              <div className="three-clock-content">
                <h3 className="three-clock-title">Dress Up Edit</h3>
                <p className="three-clock-desc">
                  Polished styles for outings and occasions, with standout fits that instantly elevate your look.
                </p>
                <Link to="/women" className="three-clock-btn">Explore Looks →</Link>
              </div>
            </div>
          </div>
        </section>


        <section className="wb4n-sec">
          <div className="wb4n-shell">
            <div className="wb4n-head">
              <h2 className="wb4n-title">Indian Flower Picks</h2>
              <Link to="/women" className="wb4n-view">View All</Link>
            </div>

            <div className="wb4n-grid">
              <Link to="/women" className="wb4n-card wb4n-hero">
                <img src={getImage('/images/women/new/zig-zag3.png')} alt="Kurti Pants" />
                <div className="wb4n-overlay"></div>
                <div className="wb4n-meta">
                  <span className="wb4n-name">Kurti Pants</span>
                  <span className="wb4n-sub">Effortless everyday comfort</span>
                </div>
                <span className="wb4n-cta">Shop</span>
              </Link>

              <Link to="/women" className="wb4n-card">
                <img src={getImage('/images/women/new/zig-zag1.png')} alt="Tops" />
                <div className="wb4n-overlay"></div>
                <div className="wb4n-mini">Tops</div>
              </Link>

              <Link to="/women" className="wb4n-card">
                <img src={getImage('/images/women/new/zig-zag2.png')} alt="Leggings" />
                <div className="wb4n-overlay"></div>
                <div className="wb4n-mini">Leggings</div>
              </Link>

              <Link to="/women" className="wb4n-card">
                <img src={getImage('/images/women/new/zig-zag4.png')} alt="Lounge Wear" />
                <div className="wb4n-overlay"></div>
                <div className="wb4n-mini">Lounge Wear</div>
              </Link>

              <Link to="/women" className="wb4n-card">
                <img src={getImage('/images/women/new/zig-zag5.png')} alt="Straight Pants" />
                <div className="wb4n-overlay"></div>
                <div className="wb4n-mini">Straight Pants</div>
              </Link>
            </div>

            <div className="wb4n-chips">
              <Link to="/women" className="wb4n-chip">T-Shirts</Link>
              <Link to="/women" className="wb4n-chip">Casual Shirt</Link>
              <Link to="/women" className="wb4n-chip">Viscose Leggings</Link>
              <Link to="/women" className="wb4n-chip">Cotton Kurti</Link>
            </div>
          </div>
        </section>

        <Divider label="Women" direction="ltr" />






        <section className="iwx-sec">
          <div className="iwx-shell">
            <div className="iwx-head">
              <div>
                <h2 className="iwx-title">Innerwear Essentials</h2>
                <p className="iwx-sub">Comfort-first picks for everyday wear</p>
              </div>
              <Link to="/women" className="iwx-view">View All</Link>
            </div>

            <div className="iwx-grid">
              <Link to="/women" className="iwx-card iwx-card-hero">
                <img src={getImage('/images/updated/inner1.jpg')} alt="Saree Shaper" className="iwx-img" />
                <div className="iwx-shade" />
                <div className="iwx-meta">
                  <span className="iwx-kicker">Shape & Support</span>
                  <h3 className="iwx-name">Saree Shaper</h3>
                  <span className="iwx-cta">Shop Now →</span>
                </div>
              </Link>

              <Link to="/women" className="iwx-card">
                <img src={getImage('/images/updated/inner2.jpg')} alt="Underwear" className="iwx-img" />
                <div className="iwx-shade" />
                <div className="iwx-meta">
                  <span className="iwx-kicker">Everyday Basics</span>
                  <h3 className="iwx-name">Underwear</h3>
                  <span className="iwx-cta">Explore →</span>
                </div>
              </Link>

              <Link to="/women" className="iwx-card">
                <img src={getImage('/images/updated/inner3.jpg')} alt="Bras" className="iwx-img" />
                <div className="iwx-shade" />
                <div className="iwx-meta">
                  <span className="iwx-kicker">Fit Matters</span>
                  <h3 className="iwx-name">Bras</h3>
                  <span className="iwx-cta">View Styles →</span>
                </div>
              </Link>

              <Link to="/women" className="iwx-card iwx-card-wide">
                <img src={getImage('/images/updated/inner5.jpg')} alt="Shorts" className="iwx-img" />
                <div className="iwx-shade" />
                <div className="iwx-meta">
                  <span className="iwx-kicker">Soft & Easy</span>
                  <h3 className="iwx-name">Shorts</h3>
                  <span className="iwx-cta">Shop Comfort →</span>
                </div>
              </Link>
            </div>

            <div className="iwx-tags">
              <Link to="/women" className="iwx-pill">Daily Wear</Link>
              <Link to="/women" className="iwx-pill">Seamless</Link>
              <Link to="/women" className="iwx-pill">Breathable Cotton</Link>
              <Link to="/women" className="iwx-pill">Shapewear</Link>
            </div>
          </div>
        </section>
        <Divider label="Women" direction="ltr" />

        <section className="mb1x-sec">
          <div className="mb1x-shell">
            <div className="mb1x-head">
              <h2 className="mb1x-title">Men’s Essentials</h2>
              <Link to="/men" className="mb1x-view">View All</Link>
            </div>

            <div className="mb1x-circles">
              <Link to="/men" className="mb1x-item">
                <div className="mb1x-photo">
                  <img src={getImage('/images/home/jockey3.webp')} alt="Briefs" />
                </div>
                <span className="mb1x-cap">Briefs</span>
              </Link>

              <Link to="/men" className="mb1x-item">
                <div className="mb1x-photo">
                  <img src={getImage('/images/home/jockey2.webp')} alt="T-Shirts" />
                </div>
                <span className="mb1x-cap">T-Shirts</span>
              </Link>

              <Link to="/men" className="mb1x-item">
                <div className="mb1x-photo">
                  <img src={getImage('/images/home/jockey4.webp')} alt="Vests" />
                </div>
                <span className="mb1x-cap">Vests</span>
              </Link>

              <Link to="/men" className="mb1x-item">
                <div className="mb1x-photo">
                  <img src={getImage('/images/home/jockey5.webp')} alt="Trunks" />
                </div>
                <span className="mb1x-cap">Trunks</span>
              </Link>

              <Link to="/men" className="mb1x-item">
                <div className="mb1x-photo">
                  <img src={getImage('/images/home/jockey6.webp')} alt="Knit Shirts" />
                </div>
                <span className="mb1x-cap">Knit Shirts</span>
              </Link>

              <Link to="/men" className="mb1x-item">
                <div className="mb1x-photo">
                  <img src={getImage('/images/home/jockey7.webp')} alt="Polos" />
                </div>
                <span className="mb1x-cap">Polos</span>
              </Link>

              <Link to="/men" className="mb1x-item">
                <div className="mb1x-photo">
                  <img src={getImage('/images/home/jockey8.webp')} alt="Boxers" />
                </div>
                <span className="mb1x-cap">Boxers</span>
              </Link>

              <Link to="/men" className="mb1x-item">
                <div className="mb1x-photo">
                  <img src={getImage('/images/home/jockey9.webp')} alt="Gym Vests" />
                </div>
                <span className="mb1x-cap">Gym Vests</span>
              </Link>
            </div>
          </div>
        </section>

        <Divider label="Women" direction="ltr" />

        <section className="mb3x-sec">
          <div className="mb3x-shell">
            <div className="mb3x-head">
              <h2 className="mb3x-title">Men’s Picks</h2>
              <Link to="/men" className="mb3x-view">View All</Link>
            </div>

            <div className="mb3x-row">
              <Link to="/men/jackets" className="mb3x-card">
                <div className="mb3x-media">
                  <img src={getImage('/images/home/jockey7.webp')} alt="Jackets" />
                </div>
                <div className="mb3x-meta">
                  <div className="mb3x-name">Jackets</div>
                  <div className="mb3x-sub">Layer up in style</div>
                </div>
              </Link>

              <Link to="/men/shirts" className="mb3x-card">
                <div className="mb3x-media">
                  <img src={getImage('/images/home/jockey6.webp')} alt="Shirts" />
                </div>
                <div className="mb3x-meta">
                  <div className="mb3x-name">Shirts</div>
                  <div className="mb3x-sub">Everyday essentials</div>
                </div>
              </Link>

              <Link to="/men/polos" className="mb3x-card">
                <div className="mb3x-media">
                  <img src={getImage('/images/home/jockey2.webp')} alt="Polos" />
                </div>
                <div className="mb3x-meta">
                  <div className="mb3x-name">Polos</div>
                  <div className="mb3x-sub">Smart and casual</div>
                </div>
              </Link>

              <Link to="/men/trousers" className="mb3x-card">
                <div className="mb3x-media">
                  <img src={getImage('/images/home/jockey3.webp')} alt="Trousers" />
                </div>
                <div className="mb3x-meta">
                  <div className="mb3x-name">Trousers</div>
                  <div className="mb3x-sub">Clean fits</div>
                </div>
              </Link>

              <Link to="/men/denim" className="mb3x-card">
                <div className="mb3x-media">
                  <img src={getImage('/images/home/jockey4.webp')} alt="Denim" />
                </div>
                <div className="mb3x-meta">
                  <div className="mb3x-name">Denim</div>
                  <div className="mb3x-sub">Classic looks</div>
                </div>
              </Link>

              <Link to="/men/ethnic" className="mb3x-card">
                <div className="mb3x-media">
                  <img src={getImage('/images/home/jockey5.webp')} alt="Ethnic" />
                </div>
                <div className="mb3x-meta">
                  <div className="mb3x-name">Ethnic</div>
                  <div className="mb3x-sub">Festive ready</div>
                </div>
              </Link>

              <Link to="/men/footwear" className="mb3x-card">
                <div className="mb3x-media">
                  <img src={getImage('/images/home/jockey6.webp')} alt="Footwear" />
                </div>
                <div className="mb3x-meta">
                  <div className="mb3x-name">Footwear</div>
                  <div className="mb3x-sub">Finish the fit</div>
                </div>
              </Link>
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

        <section className="mb4x-sec">
          <div className="mb4x-shell">
            <div className="mb4x-head">
              <h2 className="mb4x-title">Men’s Daily Essentials</h2>
              <Link to="/men" className="mb4x-view">View All</Link>
            </div>

            <div className="mb4x-layout">
              <Link to="/men/shirts" className="mb4x-hero">
                <img src={getImage('/images/updated/men1.jpg')} alt="Shirts" />
                <div className="mb4x-heroOverlay" />
                <div className="mb4x-heroContent">
                  <div className="mb4x-heroKicker">Featured</div>
                  <div className="mb4x-heroTitle">Shirts</div>
                  <div className="mb4x-heroSub">Sharp fits for work and weekends</div>
                  <span className="mb4x-heroCta">Shop Now</span>
                </div>
              </Link>

              <div className="mb4x-grid">
                <Link to="/men/t-shirts" className="mb4x-card">
                  <div className="mb4x-media">
                    <img src={getImage('/images/updated/men2.jpg')} alt="T-Shirts" />
                  </div>
                  <div className="mb4x-meta">
                    <div className="mb4x-name">T-Shirts</div>
                    <div className="mb4x-sub">Everyday comfort</div>
                  </div>
                </Link>

                <Link to="/men/trousers" className="mb4x-card">
                  <div className="mb4x-media">
                    <img src={getImage('/images/updated/men3.jpg')} alt="Trousers" />
                  </div>
                  <div className="mb4x-meta">
                    <div className="mb4x-name">Trousers</div>
                    <div className="mb4x-sub">Clean silhouettes</div>
                  </div>
                </Link>

                <Link to="/men/denim" className="mb4x-card">
                  <div className="mb4x-media">
                    <img src={getImage('/images/updated/men4.jpg')} alt="Denim" />
                  </div>
                  <div className="mb4x-meta">
                    <div className="mb4x-name">Denim</div>
                    <div className="mb4x-sub">Classic staples</div>
                  </div>
                </Link>

                <Link to="/men/jackets" className="mb4x-card">
                  <div className="mb4x-media">
                    <img src={getImage('/images/updated/men5.jpg')} alt="Jackets" />
                  </div>
                  <div className="mb4x-meta">
                    <div className="mb4x-name">Jackets</div>
                    <div className="mb4x-sub">Layer in style</div>
                  </div>
                </Link>

                <Link to="/men/ethnic" className="mb4x-card">
                  <div className="mb4x-media">
                    <img src={getImage('/images/updated/men6.jpg')} alt="Ethnic" />
                  </div>
                  <div className="mb4x-meta">
                    <div className="mb4x-name">Ethnic</div>
                    <div className="mb4x-sub">Festive ready</div>
                  </div>
                </Link>

                <Link to="/men/footwear" className="mb4x-card">
                  <div className="mb4x-media">
                    <img src={getImage('/images/updated/men7.jpg')} alt="Footwear" />
                  </div>
                  <div className="mb4x-meta">
                    <div className="mb4x-name">Footwear</div>
                    <div className="mb4x-sub">Finish your look</div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="mb4x-pills">
              <Link to="/men/shirts/formal" className="mb4x-pill">Formal</Link>
              <Link to="/men/t-shirts/slim-fit" className="mb4x-pill">Slim Fit</Link>
              <Link to="/men/denim/straight" className="mb4x-pill">Straight Denim</Link>
              <Link to="/men/jackets/winter" className="mb4x-pill">Winter Layer</Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
