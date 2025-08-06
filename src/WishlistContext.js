import React, { createContext, useContext, useState } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const addToWishlist = (item) => {
    if (!wishlistItems.find(i => i.id === item.id)) {
      setWishlistItems([...wishlistItems, item]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
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
