import React from 'react';
import './Orders.css';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Orders = ({ orders = [] }) => {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    navigate('/');
  };

  const handleViewProduct = (product) => {
    navigate('/checkout', { state: { product } });
  };

  const formatPrice = (v) =>
    typeof v === 'number'
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
      : v;

  return (
    <div className="orders-container">
      {orders.length === 0 ? (
        <div className="orders-empty-card">
          <div className="empty-orb"></div>
          <img src="/images/no-order.svg" alt="No Orders" className="orders-empty-img" />
          <h2 className="orders-empty-title">No Recent Orders</h2>
          <p className="orders-empty-subtitle">Looks like you haven’t made any order yet</p>
          <button className="orders-start-button" onClick={handleStartShopping}>
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="orders-header">
            <h3>Your Orders</h3>
            <span className="orders-count">{orders.length}</span>
          </div>
          <div className="orders-list">
            {orders.map((order, index) => (
              <div
                key={index}
                className="orders-item"
                onClick={() => handleViewProduct(order)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleViewProduct(order)}
              >
                <span className="orders-glow"></span>
                <div className="orders-badge">
                  <FaCheckCircle />
                  <span>Delivered</span>
                </div>

                <div className="orders-image">
                  <img src={order.image} alt={order.name} />
                </div>

                <div className="orders-info">
                  <div className="orders-top">
                    <h4 className="orders-name">{order.name}</h4>
                    <div className="orders-brand">{order.brand}</div>
                  </div>

                  <div className="orders-meta">
                    <div className="orders-price">
                      <span className="price-current">{formatPrice(order.offerPrice)}</span>
                      {order.originalPrice && (
                        <span className="price-original">{formatPrice(order.originalPrice)}</span>
                      )}
                    </div>
                    <p className="orders-date">{order.date}</p>
                  </div>
                </div>

                <div className="orders-arrow" onClick={(e) => { e.stopPropagation(); handleViewProduct(order); }}>
                  <FaArrowRight />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
