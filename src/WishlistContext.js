import React, { createContext, useContext, useState } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const addToWishlist = (item) => {
    if (!wishlistItems.find(i => i.name === item.name)) {
      setWishlistItems([...wishlistItems, item]);
    }
  };

  const removeFromWishlist = (name) => {
    setWishlistItems(wishlistItems.filter(item => item.name !== name));
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
