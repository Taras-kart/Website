import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { FiArrowLeft, FiBox, FiCheckCircle } from 'react-icons/fi';
import './B2BDashboard.css';

const DISTRIBUTORS = [
  {
    id: 'nihira',
    name: 'Nihira Distributors',
    brands: ['Twin Birds', 'Intimacy Lingerie', 'Brand 3']
  },
  {
    id: 'padmavathi',
    name: 'Padmavathi Agencies',
    brands: ['Aswati', 'Indian Flower', 'Cucumber', 'Dazzle Prime', 'Twin Birds Prime', 'Quick Dry', 'Selvas']
  },
  {
    id: 'mahalakshmi',
    name: 'Mahalakshmi Traders',
    brands: ['BodyCare', 'Twin Birds Bottom wear']
  }
];

export default function B2BDashboard() {
  const navigate = useNavigate();
  const [selectedDistributor, setSelectedDistributor] = useState(null);

  // Security Check: Kick out non-B2B users
  useEffect(() => {
    const userType = localStorage.getItem('userType') || sessionStorage.getItem('userType');
    if (String(userType).toUpperCase() !== 'B2B') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="b2b-page-wrapper">
      <Navbar />
      
      <main className="b2b-main-content">
        <div className="b2b-container">
          
          <header className="b2b-header">
            <h1 className="b2b-title">Wholesale Portal</h1>
            <p className="b2b-subtitle">Select a distributor to view available brands and start ordering.</p>
          </header>

          {/* Level 1: Show Distributors */}
          {!selectedDistributor && (
            <div className="b2b-grid">
              {DISTRIBUTORS.map((dist) => (
                <div 
                  key={dist.id} 
                  className="b2b-card dist-card"
                  onClick={() => setSelectedDistributor(dist)}
                >
                  <div className="b2b-card-icon">
                    <FiBox />
                  </div>
                  <h2 className="b2b-card-title">{dist.name}</h2>
                  <p className="b2b-card-meta">{dist.brands.length} Brands Available</p>
                  <span className="b2b-card-action">View Brands &rarr;</span>
                </div>
              ))}
            </div>
          )}

          {/* Level 2: Show Brands for Selected Distributor */}
          {selectedDistributor && (
            <div className="b2b-brands-view">
              <button 
                className="b2b-back-btn" 
                onClick={() => setSelectedDistributor(null)}
              >
                <FiArrowLeft /> Back to Distributors
              </button>
              
              <div className="b2b-brands-header">
                <h2>{selectedDistributor.name}</h2>
                <p>Select a brand to view the catalog</p>
              </div>

              <div className="b2b-grid brand-grid">
                {selectedDistributor.brands.map((brand, idx) => (
                  <Link 
                    key={idx} 
                    to={`/category-display?brand=${encodeURIComponent(brand)}`} 
                    className="b2b-card brand-card"
                  >
                    <div className="b2b-card-icon brand-icon">
                      <FiCheckCircle />
                    </div>
                    <h3 className="b2b-card-title">{brand}</h3>
                    <span className="b2b-card-action">Shop Catalog &rarr;</span>
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