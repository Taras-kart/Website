/*import React, { useState, useEffect, useRef } from 'react';
import './FilterSidebar.css';

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

const FilterSidebar = ({ onFilterChange }) => {
  const [openSection, setOpenSection] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const sidebarRef = useRef(null);

  const toggleSection = (key) => {
    setOpenSection(openSection === key ? null : key);
  };

  const handleCheckbox = (category, value) => {
    const current = selectedFilters[category] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const newFilters = { ...selectedFilters, [category]: updated };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClickOutside = (e) => {
    if (
      isSidebarOpen &&
      sidebarRef.current &&
      !sidebarRef.current.contains(e.target) &&
      !e.target.closest('.filter-final-float-button')
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  return (
    <>
      <div
        ref={sidebarRef}
        className={`filter-final-sidebar ${isSidebarOpen ? 'open' : ''}`}
      >
        <div className="filter-final-header">
          <h3>Filter</h3>
          <span className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            &times;
          </span>
        </div>
        {Object.entries(filterData).map(([key, values]) => (
          <div key={key} className="filter-final-section">
            <div
              className="filter-final-section-header"
              onClick={() => toggleSection(key)}
            >
              <h4>{key}</h4>
              <span>{openSection === key ? '-' : '+'}</span>
            </div>
            {openSection === key && (
              <ul className="filter-final-options">
                {values.map((item) => (
                  <li key={item}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedFilters[key]?.includes(item) || false}
                        onChange={() => handleCheckbox(key, item)}
                      />
                      {item}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div
        className="filter-final-float-button"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <div className="filter-final-waves"></div>
        <div className="filter-final-waves delay1"></div>
        <div className="filter-final-waves delay2"></div>
        <i className="fa fa-filter"></i>
      </div>
    </>
  );
};

export default FilterSidebar;
*/









































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

const FilterSidebar = ({ onFilterChange }) => {
  const [openSection, setOpenSection] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarFixed, setIsSidebarFixed] = useState(true);
  const observerRef = useRef(null);
  const sidebarRef=useRef(null);

  const toggleSection = (key) => {
    setOpenSection(openSection === key ? null : key);
  };

  const handleCheckbox = (category, value) => {
    const current = selectedFilters[category] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const newFilters = { ...selectedFilters, [category]: updated };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setSelectedFilters({});
    onFilterChange({});
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSidebarFixed(!entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: '0px' }
    );
    const footer = document.querySelector('.footer');
    if (footer) observer.observe(footer);
    observerRef.current = observer;
    return () => {
      if (footer) observer.unobserve(footer);
    };
  }, []);

   useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.filter-icon')) {
        setIsMobileOpen(false); // Close the sidebar if clicking outside
      }
    };

    if (isMobileOpen) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isMobileOpen]);

  return (
    <>
      <div
        className={`filter-sidebar ${isSidebarFixed ? 'fixed' : 'absolute'} ${isMobileOpen ? 'open' : ''}`}
      >
        <div className="filter-top">
          <h4 className="filter-title">Filters</h4>
          <button className="reset-btn" onClick={handleReset}>Reset</button>
        </div>
        {Object.entries(filterData).map(([key, values]) => (
          <div key={key} className="filter-section">
            <div className="filter-header" onClick={() => toggleSection(key)}>
              <h4>{key}</h4>
              <span>{openSection === key ? <FaChevronUp /> : <FaChevronDown />}</span>
            </div>
            {openSection === key && (
              <ul className="filter-options">
                {values.map((item) => (
                  <li key={item}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedFilters[key]?.includes(item) || false}
                        onChange={() => handleCheckbox(key, item)}
                      />
                      {item}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="filter-icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        <FaFilter />
      </div>
    </>
  );
};

export default FilterSidebar;
