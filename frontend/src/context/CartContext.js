
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
const getCartStorageKey = (userId) =>
  userId ? `${CART_STORAGE_KEY}_${userId}` : `${CART_STORAGE_KEY}_guest`;

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const cartStorageKey = getCartStorageKey(user?.id);
  const [cartItems, setCartItems] = useState([]);
  const [loadedStorageKey, setLoadedStorageKey] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    let storedItems = [];
    try {
      const storedCart = localStorage.getItem(cartStorageKey);
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];
      if (Array.isArray(parsedCart)) {
        storedItems = parsedCart.filter(
          (item) => !user?.id || String(item.seller?.id) !== String(user.id)
        );
      }
    } catch {
      storedItems = [];
    }

    setCartItems(storedItems);
    setLoadedStorageKey(cartStorageKey);
  }, [authLoading, cartStorageKey, user?.id]);

  useEffect(() => {
    if (authLoading || loadedStorageKey !== cartStorageKey) return;

    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [authLoading, cartItems, cartStorageKey, loadedStorageKey]);

  const cartReady = !authLoading && loadedStorageKey === cartStorageKey;
  const visibleCartItems = cartReady ? cartItems : [];

  const addToCart = (listing) => {
    if (!listing?.id) {
      return { success: false, message: "Invalid listing." };
    }

    if (authLoading || loadedStorageKey !== cartStorageKey) {
      return { success: false, message: "Your cart is still loading. Please try again." };
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
    visibleCartItems.some((item) => item.id === listingId);

  const cartTotal = visibleCartItems.reduce(
    (total, item) => total + item.askingPrice,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems: visibleCartItems,
        cartCount: visibleCartItems.length,
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
