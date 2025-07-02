import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    if (!cartItems.find(i => i.name === item.name)) {
      setCartItems([...cartItems, item]);
    }
  };

  const removeFromCart = (name) => {
    setCartItems(cartItems.filter(item => item.name !== name));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
