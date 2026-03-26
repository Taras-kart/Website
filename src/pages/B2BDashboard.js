import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { FiBriefcase, FiArrowRight, FiPackage, FiGrid } from 'react-icons/fi';
import './B2BDashboard.css';

const DISTRIBUTORS = [
  {
    id: 'nihira',
    name: 'Nihira Distributors',
    tagline: 'Premium innerwear & wellness brands',
    brands: ['Twin Birds', 'Intimacy Lingerie', 'Charak']
  },
  {
    id: 'padmavathi',
    name: 'Padmavathi Agencies',
    tagline: 'Diverse portfolio of leading labels',
    brands: ['Aswati', 'Indian Flower', 'Cucumber', 'Dazzle Prime', 'Twin Birds Prime', 'Quick Dry', 'Selvas']
  },
  {
    id: 'mahalakshmi',
    name: 'Mahalakshmi Traders',
    tagline: 'Bodywear & comfort essentials',
    brands: ['BodyCare', 'Twin Birds Bottom wear']
  }
];

const BRAND_LOGOS = {
  'Twin Birds':             '/images/brands/twin-birds-brand.jpeg',
  'Twin Birds Prime':       '/images/brands/twin-birds-brand.jpeg',
  'Twin Birds Bottom wear': '/images/brands/twin-birds-brand.jpeg',
  'Intimacy Lingerie':      '/images/brands/intimacy-brand.jpeg',
  'Aswati':                 '/images/brands/aswathi-brand.jpeg',
  'Indian Flower':          '/images/brands/indian-flower-brand.jpeg',
  'Cucumber':               '/images/brands/cucumber-brand.jpg',
  'Dazzle Prime':           '/images/brands/dazzle-brand.jpg',
  'Quick Dry':              '/images/brands/quickdry-brand.jpg',
  'BodyCare':               '/images/brands/body-care.jpg',
  'Charak':                 '/images/brands/charak-brand.jpg',
  'Selvas':                 '/images/brands/selvas-brand.jpg',
};

const DEFAULT_LOGO = '/images/women/women20.jpeg';

export default function B2BDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [animKey, setAnimKey] = useState(0);
  const selectedId = searchParams.get('dist');
  const selectedDistributor = DISTRIBUTORS.find(d => d.id === selectedId) || null;

  useEffect(() => {
    const userType = localStorage.getItem('userType') || sessionStorage.getItem('userType');
    if (String(userType).toUpperCase() !== 'B2B') {
      navigate('/');
    }
  }, [navigate]);

  const selectDistributor = (dist) => {
    setSearchParams({ dist: dist.id });
    setAnimKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="b2b-page-wrapper">
      <Navbar />

      <main className="b2b-main-content">
        <div className="b2b-container">

          {/* ── Page Header ── */}
          <header className="b2b-header">
            <div className="b2b-header-badge">
              <FiGrid size={12} />
              <span>Wholesale Portal</span>
            </div>
            <h1 className="b2b-title">
              {selectedDistributor ? selectedDistributor.name : 'Choose Your Distributor'}
            </h1>
            <p className="b2b-subtitle">
              {selectedDistributor
                ? selectedDistributor.tagline
                : 'Access exclusive wholesale catalogs from our trusted distribution partners.'}
            </p>
            <div className="b2b-header-divider" />
          </header>

          {/* ── Level 1: Distributor Cards ── */}
          {!selectedDistributor && (
            <div className="b2b-grid">
              {DISTRIBUTORS.map((dist, i) => (
                <div
                  key={dist.id}
                  className="dist-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  onClick={() => selectDistributor(dist)}
                >
                  <div className="b2b-card-icon">
                    <FiBriefcase />
                  </div>
                  <h2 className="b2b-card-title">{dist.name}</h2>
                  <p className="b2b-card-meta">{dist.brands.length} Brands</p>
                  <div className="b2b-card-action">
                    <span>Access Catalog</span>
                    <FiArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Level 2: Brand Cards ── */}
          {selectedDistributor && (
            <div className="b2b-brands-view" key={animKey}>

              {/* Stats strip */}
              <div className="b2b-stats-strip">
                <FiPackage size={14} />
                <span><strong>{selectedDistributor.brands.length}</strong> brands available</span>
              </div>

              {/* Brand grid */}
              <div className="brand-grid">
                {selectedDistributor.brands.map((brand, idx) => (
                  <Link
                    key={idx}
                    to={`/category-display?brand=${encodeURIComponent(brand)}`}
                    className="brand-card"
                    style={{ animationDelay: `${idx * 0.07}s` }}
                  >
                    {/* Logo zone */}
                    <div className="brand-media">
                      <div className="brand-media-inner">
                        <img
                          src={BRAND_LOGOS[brand] || DEFAULT_LOGO}
                          alt={`${brand} logo`}
                          onError={(e) => { e.currentTarget.src = DEFAULT_LOGO; }}
                        />
                      </div>
                      <div className="brand-hover-overlay">
                        <span className="brand-hover-cta">
                          Shop Wholesale <FiArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Info strip */}
                    <div className="brand-info">
                      <h3 className="brand-title">{brand}</h3>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}