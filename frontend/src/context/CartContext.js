
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const CART_STORAGE_KEY = "edbridge_cart";

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // A cart can survive a browser refresh. Remove any old item belonging to
  // the currently signed-in user before it can reach checkout.
  useEffect(() => {
    if (!user?.id) return;

    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => String(item.seller?.id) !== String(user.id)
      )
    );
  }, [user]);

  const addToCart = (listing) => {
    if (!listing?.id) {
      return { success: false, message: "Invalid listing." };
    }

    if (user?.id && listing.seller?.id &&
        String(user.id) === String(listing.seller.id)) {
      return {
        success: false,
        message: "You cannot add your own listing to the cart.",
      };
    }

    const existingItem = cartItems.find(
      (item) => item.id === listing.id
    );

    if (existingItem) {
      return {
        success: false,
        message: "This item is already in your cart.",
      };
    }

    setCartItems((currentItems) => [
      ...currentItems,
      {
        id: listing.id,
        title: listing.title,
        askingPrice: Number(listing.askingPrice),
        originalPrice: Number(listing.originalPrice),
        imageUrl: listing.imageUrl || "",
        condition: listing.condition,
        category: listing.category,
        area: listing.area,
        seller: listing.seller
          ? {
              id: listing.seller.id,
              name: listing.seller.name,
            }
          : null,
      },
    ]);

    return { success: true, message: "Added to cart." };
  };

  const removeFromCart = (listingId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== listingId)
    );
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isInCart = (listingId) =>
    cartItems.some((item) => item.id === listingId);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.askingPrice,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.length,
        cartTotal,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}
