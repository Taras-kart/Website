import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import './HomePage.css';
import Footer from './Footer';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
    DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

function withWidth(url, w) {
    try {
        const u = new URL(url, window.location.origin);
        if (!u.hostname.includes('res.cloudinary.com')) return url;
        u.pathname = u.pathname.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
        return u.toString();
    } catch {
        return url;
    }
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const FALLBACK_WOMEN = [
    { img: '/images/women/women-anarkali.jpg', title: 'Anarkali' },
    { img: '/images/women/women-chudidar.jpg', title: 'Chudidar' },
    { img: '/images/women/women-gowns.jpg', title: 'Gowns' },
    { img: '/images/women/women-kurta.jpg', title: 'Kurta' },
    { img: '/images/women/women-lehanga.jpeg', title: 'Lehanga' },
    { img: '/images/women/women-palazzo.jpg', title: 'Palazzo' },
    { img: '/images/women/women-salwar.jpg', title: 'Salwar' },
    { img: '/images/women/women-sarees.jpg', title: 'Sarees' }
];

const FALLBACK_MEN = [
    { img: '/images/men/mens-casuals.jpg', title: 'Casuals' },
    { img: '/images/men/mens-ethinic.jpg', title: 'Ethnic' },
    { img: '/images/men/mens-formals.jpg', title: 'Formals' },
    { img: '/images/men/mens-party-wear.jpg', title: 'Party Wear' },
    { img: '/images/men/mens-semi-formals.jpg', title: 'Semi Formals' },
    { img: '/images/men/mens-street-wear.jpg', title: 'Street Wear' },
    { img: '/images/men/mens-suits.jpg', title: 'Suits' },
    { img: '/images/men/mens-wedding-wear.jpg', title: 'Wedding Wear' }
];

const FALLBACK_KIDS = [
    { img: '/images/kids/kids-boys-casual-wear.jpg', title: 'Boys Casual Wear' },
    { img: '/images/kids/kids-boys-kurta-paijama.jpg', title: 'Boys Kurta Paijama' },
    { img: '/images/kids/kids-boys-sherwani.jpg', title: 'Boys Sherwani' },
    { img: '/images/kids/kids-formal.jpg', title: 'Formal' },
    { img: '/images/kids/kids-girls-frock.jpg', title: 'Girls Frock' },
    { img: '/images/kids/kids-girls-gown.jpg', title: 'Girls Gown' },
    { img: '/images/kids/kids-girls-lehenga-choli.jpg', title: 'Girls Lehenga Choli' },
    { img: '/images/kids/kids-girls-salwar.jpg', title: 'Girls Salwar' }
];

export default function HomePage() {
    const FALLBACK_SLIDES = Array.from({ length: 11 }, (_, i) => `/images/slide${i + 1}.jpg`);
    const [slides, setSlides] = useState(FALLBACK_SLIDES);
    const [isLoadingSlides, setIsLoadingSlides] = useState(true);
    const [womenItems, setWomenItems] = useState(FALLBACK_WOMEN);
    const [menItems, setMenItems] = useState(FALLBACK_MEN);
    const [kidsItems, setKidsItems] = useState(FALLBACK_KIDS);
    const section3Images = Array.from({ length: 12 }, (_, i) => `/images/random${i + 1}.jpg`);
    const womenRef = useRef(null);
    const menRef = useRef(null);
    const kidsRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        async function fetchAll() {
            setIsLoadingSlides(true);
            const t = Date.now();
            const url = `${API_BASE}/api/products/section-images?limitHero=30&limitGender=40&_t=${t}`;
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (mounted && data && Array.isArray(data.hero)) {
                        const heroUrls = data.hero.map(x => x.image_url).filter(u => u && typeof u === 'string' && !/^\/images\//.test(u));
                        if (heroUrls.length) setSlides(shuffle(heroUrls).slice(0, 30));
                    }
                    if (mounted && data && Array.isArray(data.women) && data.women.length) {
                        setWomenItems(
                            shuffle(
                                data.women
                                    .filter(x => x.image_url && typeof x.image_url === 'string' && !/^\/images\//.test(x.image_url))
                                    .map(x => ({ img: x.image_url, title: x.product_name || x.brand || 'Women' }))
                            ).slice(0, 20)
                        );
                    }
                    if (mounted && data && Array.isArray(data.men) && data.men.length) {
                        setMenItems(
                            shuffle(
                                data.men
                                    .filter(x => x.image_url && typeof x.image_url === 'string' && !/^\/images\//.test(x.image_url))
                                    .map(x => ({ img: x.image_url, title: x.product_name || x.brand || 'Men' }))
                            ).slice(0, 20)
                        );
                    }
                    if (mounted && data && Array.isArray(data.kids) && data.kids.length) {
                        setKidsItems(
                            shuffle(
                                data.kids
                                    .filter(x => x.image_url && typeof x.image_url === 'string' && !/^\/images\//.test(x.image_url))
                                    .map(x => ({ img: x.image_url, title: x.product_name || x.brand || 'Kids' }))
                            ).slice(0, 20)
                        );
                    }
                }
            } catch { }
            if (mounted) setIsLoadingSlides(false);
        }
        fetchAll();
        return () => {
            mounted = false;
        };
    }, []);

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
        const womenInterval = scrollForward(womenRef.current?.querySelector('.home-section5-slider'));
        const menInterval = scrollBackward(menRef.current?.querySelector('.home-section5-slider'));
        const kidsInterval = scrollForward(kidsRef.current?.querySelector('.home-section5-slider'));
        return () => {
            clearInterval(womenInterval);
            clearInterval(menInterval);
            clearInterval(kidsInterval);
        };
    }, []);

    return (
        <div className="home-section1-wrapper">
            <Navbar />
            <div className="home-section1">
                <div className="home-section1-overlay">
                    <div className="home-section1-content">
                        <div className="home-section1-left">
                            <video className="home-section1-video" autoPlay muted loop>
                                <source src="/images/logo-video.mp4" type="video/mp4" />
                            </video>
                            <div className="home-section1-full-text">
                                <h1>Taras Kart</h1>
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
                <h2 className="home-section2-title">Boost your clothing sales with our fashion varieties!</h2>
                <div className="home-section2-frame">
                    <div className="home-section2-glow" />
                    <Swiper
                        className={`home-section2-slider ${isLoadingSlides ? 'is-loading' : ''}`}
                        modules={[EffectCoverflow, Autoplay]}
                        effect="coverflow"
                        loop={true}
                        centeredSlides={true}
                        slidesPerView="auto"
                        coverflowEffect={{ rotate: 40, depth: 220, stretch: 0, modifier: 1, slideShadows: false }}
                        autoplay={{ delay: 1700, disableOnInteraction: false, pauseOnMouseEnter: false }}
                        speed={1000}
                        allowTouchMove={false}
                    >
                        {slides.map((src, index) => {
                            const w400 = withWidth(src, 400);
                            const w800 = withWidth(src, 800);
                            const w1200 = withWidth(src, 1200);
                            return (
                                <SwiperSlide key={index}>
                                    <img
                                        src={w800}
                                        srcSet={`${w400} 400w, ${w800} 800w, ${w1200} 1200w`}
                                        sizes="(max-width: 600px) 60vw, 40vw"
                                        alt={`Featured ${index + 1}`}
                                        loading="lazy"
                                    />
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                    <div className="home-section2-stars" />
                </div>
                <h3 className="home-section2-subtitle">From briefs to stunning images in seconds — save time, cut costs, and drive success!</h3>
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

            <section className="home-section5 galaxy" ref={womenRef}>
                <div className="galaxy-layer stars-1"></div>
                <div className="galaxy-layer stars-2"></div>
                <div className="galaxy-layer dust"></div>

                <div className="home-section5-heading">
                    <h2 className="galaxy-title">Women's Collection</h2>
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
                                <div className="card-frame">
                                    <img
                                        src={withWidth(item.img, 600)}
                                        alt={item.title}
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.src = '/images/women/women20.jpeg'; }}
                                    />
                                </div>
                                <h3>{item.title}</h3>
                                <button className="gold-btn">Buy Now</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="home-section5 galaxy" ref={menRef}>
                <div className="galaxy-layer stars-1"></div>
                <div className="galaxy-layer stars-2"></div>
                <div className="galaxy-layer dust"></div>

                <div className="home-section5-heading">
                    <h2 className="galaxy-title">Men's Collection</h2>
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
                                <div className="card-frame">
                                    <img
                                        src={withWidth(item.img, 600)}
                                        alt={item.title}
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.src = '/images/men/default.jpg'; }}
                                    />
                                </div>
                                <h3>{item.title}</h3>
                                <button className="gold-btn">Buy Now</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="home-section5 galaxy" ref={kidsRef}>
                <div className="galaxy-layer stars-1"></div>
                <div className="galaxy-layer stars-2"></div>
                <div className="galaxy-layer dust"></div>

                <div className="home-section5-heading">
                    <h2 className="galaxy-title">Kid's Collection</h2>
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
                                <div className="card-frame">
                                    <img
                                        src={withWidth(item.img, 600)}
                                        alt={item.title}
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.src = '/images/kids/default.jpg'; }}
                                    />
                                </div>
                                <h3>{item.title}</h3>
                                <button className="gold-btn">Buy Now</button>
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
                <div className="home7-stars layer1"></div>
                <div className="home7-stars layer2"></div>
                <div className="home7-glow"></div>

                <h2 className="home-section7-title">Exclusive Waves of Fashion</h2>
                <div className="home-section7-row">
                    {Array.from({ length: 9 }, (_, i) => (
                        <div key={i} className={`home-section7-item item-${i + 1}`}>
                            <img src={`/images/wave${i + 1}.jpeg`} alt={`Wave ${i + 1}`} />
                        </div>
                    ))}
                </div>
            </section>


            <Footer />
        </div>
    );
}
