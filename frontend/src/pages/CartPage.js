
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/CartPage.css';

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();

  const formatPrice = (price) =>
    `৳${Number(price || 0).toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>
            You haven't added any academic products to your cart yet.
            Explore the marketplace to find what you need.
          </p>

          <Link to="/marketplace" className="cart-primary-button">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <div>
            <h1>Shopping Cart</h1>
            <p>
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <Link to="/marketplace" className="cart-continue-link">
            ← Continue Shopping
          </Link>
        </div>

        <div className="cart-layout">
          <section className="cart-items-section">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                    />
                  ) : (
                    <div className="cart-image-placeholder">
                      📚
                    </div>
                  )}
                </div>

                <div className="cart-item-details">
                  <h3>{item.title}</h3>

                  <p className="cart-item-category">
                    {item.category || 'Academic Product'}
                  </p>

                  <div className="cart-item-meta">
                    {item.condition && (
                      <span>{item.condition}</span>
                    )}

                    {item.area && (
                      <span>{item.area}</span>
                    )}
                  </div>

                  {item.seller?.name && (
                    <p className="cart-item-seller">
                      Seller: {item.seller.name}
                    </p>
                  )}

                  <div className="cart-item-bottom">
                    <strong className="cart-item-price">
                      {formatPrice(item.askingPrice)}
                    </strong>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <Link
              to="/marketplace"
              className="cart-add-more-link"
            >
              + Add more products
            </Link>
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>
                Items ({cartCount})
              </span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Delivery</span>
              <span className="cart-delivery-note">
                To be confirmed
              </span>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>Total</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>

            <p className="cart-summary-note">
              Delivery charges, if applicable, will be confirmed
              during checkout.
            </p>

            <button
              type="button"
              className="cart-checkout-button"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout →
            </button>

            <div className="cart-payment-note">
              <span>🔒</span>
              <span>Secure checkout</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}