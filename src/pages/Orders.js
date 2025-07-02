// Orders.js
import React from 'react';
import './Orders.css';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Orders = ({ orders = [] }) => {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    navigate('/');
  };

  const handleViewProduct = (product) => {
    navigate('/checkout', { state: { product } });
  };

  return (
    <div className="orders-container">
      {orders.length === 0 ? (
        <div className="orders-empty">
          <img src="/images/no-order.svg" alt="No Orders" className="orders-empty-img" />
          <h2 className="orders-empty-title">No Recent Orders</h2>
          <p className="orders-empty-subtitle">Looks like you haven’t made any order yet</p>
          <button className="orders-start-button" onClick={handleStartShopping}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => (
            <div key={index} className="orders-item">
              <div className="orders-image">
                <img src={order.image} alt={order.name} />
              </div>
              <div className="orders-info">
                <h4 className="orders-status">Delivered</h4>
                <p className="orders-date">{order.date}</p>
              </div>
              <div
                className="orders-arrow"
                onClick={() => handleViewProduct(order)}
              >
                <FaArrowRight />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
