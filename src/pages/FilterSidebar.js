import React, { useState, useEffect, useRef } from 'react';
import './FilterSidebar.css';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const filterData = {
  gender: ['Men', 'Women', 'Kids'],
  category: ['Tops', 'Bottoms', 'Ethnic Wear', 'Footwear'],
  price: ['Under ₹500', '₹500 - ₹1000', '₹1000 - ₹2000', 'Above ₹2000'],
  brands: ['Nike', 'Adidas', 'Zara', 'H&M'],
  occasion: ['Casual', 'Formal', 'Party', 'Festive'],
  discount: ['10% or more', '30% or more', '50% or more'],
  colors: ['Black', 'White', 'Red', 'Blue'],
  'size & fit': ['S', 'M', 'L', 'XL'],
  tags: ['Trending', 'New Arrival', 'Best Seller'],
  rating: ['4★ & above', '3★ & above']
};

const API_BASE = 'http://localhost:5000';

const keyMap = {
  gender: 'category',
  brands: 'brand',
  colors: 'color',
  'size & fit': 'size'
};

const FilterSidebar = ({ onFilterChange }) => {
  const [openSection, setOpenSection] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showBar, setShowBar] = useState(true);
  const wrapRef = useRef(null);
  const lastY = useRef(0);
  const ticking = useRef(false);

  const toggleSection = (key) => {
    setOpenSection(openSection === key ? null : key);
  };

  const handleCheckbox = (category, value) => {
    const current = selectedFilters[category] || [];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    const newFilters = { ...selectedFilters, [category]: updated };
    setSelectedFilters(newFilters);
    sendFiltersToBackend(newFilters);
  };

  const handleReset = () => {
    setSelectedFilters({});
    setOpenSection(null);
    sendFiltersToBackend({});
  };

  const sendFiltersToBackend = (filters) => {
    const mapped = {};
    Object.entries(filters).forEach(([k, vals]) => {
      const bk = keyMap[k];
      if (bk && Array.isArray(vals) && vals.length) mapped[bk] = vals;
    });

    const onlyGender =
      mapped.category &&
      mapped.category.length === 1 &&
      Object.keys(mapped).length === 1;

    if (onlyGender) {
      fetch(`${API_BASE}/api/products/${encodeURIComponent(mapped.category[0])}`)
        .then((res) => res.json())
        .then((data) => onFilterChange(Array.isArray(data) ? data : []))
        .catch(() => onFilterChange([]));
      return;
    }

    const params = new URLSearchParams();
    Object.entries(mapped).forEach(([k, vals]) => {
      if (vals.length) params.append(k, vals.join(','));
    });

    const url = params.toString()
      ? `${API_BASE}/api/products/search?${params.toString()}`
      : `${API_BASE}/api/products/search`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => onFilterChange(Array.isArray(data) ? data : []))
      .catch(() => onFilterChange([]));
  };

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenSection(null);
    };
    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    lastY.current = window.scrollY || window.pageYOffset || 0;
    const threshold = 6;
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset || 0;
        const delta = y - lastY.current;
        if (y <= 0) {
          setShowBar(true);
        } else if (Math.abs(delta) > threshold) {
          setShowBar(delta < 0);
          lastY.current = y;
        }
        ticking.current = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionCount = (k) => (selectedFilters[k]?.length ? selectedFilters[k].length : 0);

  return (
    <>
      <div className={`filterbar-wrap ${showBar ? '' : 'hidden'}`} ref={wrapRef}>
        <div className="filter-bar">
          <div className="filter-left">
            <div className="filter-title-wrap">
              <FaFilter className="filter-icon" />
              <h4 className="filter-title">Filters</h4>
              <div className="title-glow"></div>
            </div>
          </div>

          <div className="chips" role="tablist">
            {Object.entries(filterData).map(([key]) => {
              const active = openSection === key;
              const count = sectionCount(key);
              return (
                <button
                  key={key}
                  className={`filter-chip ${active ? 'active' : ''}`}
                  aria-expanded={active}
                  onClick={() => toggleSection(key)}
                >
                  <span className="chip-label">{key}</span>
                  {count > 0 && <span className="count-badge">{count}</span>}
                  <span className="chip-chevron">{active ? <FaChevronUp /> : <FaChevronDown />}</span>
                </button>
              );
            })}
          </div>

          <div className="filter-actions">
            <button className="reset-btn" onClick={handleReset}>Reset</button>
          </div>
        </div>

        <div className={`filter-dropdown ${openSection ? 'open' : ''}`}>
          {openSection && (
            <ul className="filter-options horizontal">
              {filterData[openSection].map((item) => {
                const checked = selectedFilters[openSection]?.includes(item) || false;
                return (
                  <li key={item}>
                    <label className="chk">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckbox(openSection, item)}
                      />
                      <span className="box" />
                      <span className="txt">{item}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className={`filter-overlay ${openSection ? 'show' : ''}`} onClick={() => setOpenSection(null)} />
    </>
  );
};

export default FilterSidebar;
