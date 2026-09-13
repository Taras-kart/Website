import React, { createContext, useContext, useState } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const addToWishlist = (item) => {
    setWishlistItems(rows => {
      const id = String(item.product_id || item.productId || item.id)
      return rows.some(row => String(row.product_id || row.productId || row.id) === id) ? rows : [...rows, item]
    })
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(rows => rows.filter(item => String(item.product_id || item.productId || item.id) !== String(productId)))
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        setWishlistItems,  
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
