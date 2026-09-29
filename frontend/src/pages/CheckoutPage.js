import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { checkoutAPI } from "../services/api";
import "../styles/CheckoutPage.css";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [loadingMethod, setLoadingMethod] = useState("");
  const [invoiceOrderId, setInvoiceOrderId] = useState(searchParams.get("order_id"));
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const paymentResult = searchParams.get("payment");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (user?.email && !customerEmail) setCustomerEmail(user.email);
  }, [user, customerEmail]);

  useEffect(() => {
    if (paymentResult === "success") {
      clearCart();
      setMessage({
        type: "success",
        text: `Payment submitted successfully${orderId ? ` for order #${orderId}` : ""}. Stripe will confirm the order shortly.`,
      });
    }

    if (paymentResult === "cancelled") {
      setMessage({
        type: "info",
        text: "Payment was cancelled. Your cart is still available.",
      });
    }
  }, [paymentResult, orderId, clearCart]);

  const formatPrice = (price) =>
    `৳${Number(price || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const listingIds = useMemo(
    () => cartItems.map((item) => item.id),
    [cartItems]
  );

  const validateEmail = () => {
    if (!/^\S+@\S+\.\S+$/.test(customerEmail.trim())) {
      setMessage({ type: "error", text: "Please enter a valid customer email." });
      return false;
    }

    if (listingIds.length === 0) {
      setMessage({ type: "error", text: "Your cart is empty." });
      return false;
    }

    return true;
  };

  const handleStripeCheckout = async () => {
    if (!validateEmail()) return;

    try {
      setLoadingMethod("card");
      setMessage(null);
      const response = await checkoutAPI.createStripeSession({
        listingIds,
        customerEmail: customerEmail.trim(),
      });
      window.location.assign(response.checkoutUrl);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to start card checkout." });
      setLoadingMethod("");
    }
  };

  const handleCashOnDelivery = async () => {
    if (!validateEmail()) return;

    try {
      setLoadingMethod("cod");
      setMessage(null);
      const response = await checkoutAPI.createCashOnDeliveryOrder({
        listingIds,
        customerEmail: customerEmail.trim(),
      });
      clearCart();
      setInvoiceOrderId(response.orderId);
      setMessage({
        type: "success",
        text: `${response.message} Order #${response.orderId} is pending payment.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to place COD order." });
    } finally {
      setLoadingMethod("");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceOrderId) return;

    try {
      setInvoiceLoading(true);
      const pdf = await checkoutAPI.downloadInvoice(invoiceOrderId);
      const url = window.URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `EDB-INV-${String(invoiceOrderId).padStart(6, "0")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to download the invoice." });
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (paymentResult === "success" || paymentResult === "cancelled" || cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-result-card">
          <div className="checkout-result-icon">
            {paymentResult === "success" ? "✓" : paymentResult === "cancelled" ? "!" : "🛒"}
          </div>
          <h1>{paymentResult === "success" ? "Thank you for your order" : "Checkout"}</h1>
          {message ? <p className={`checkout-message ${message.type}`}>{message.text}</p> : <p>Your cart is empty.</p>}
          {invoiceOrderId && paymentResult !== "cancelled" && (
            <button
              type="button"
              className="checkout-invoice-button"
              onClick={handleDownloadInvoice}
              disabled={invoiceLoading}
            >
              {invoiceLoading ? "Preparing invoice..." : "Download invoice PDF"}
            </button>
          )}
          <Link className="checkout-secondary-button" to="/marketplace">Continue shopping</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-heading">
          <div>
            <span className="checkout-eyebrow">SECURE CHECKOUT</span>
            <h1>Complete your order</h1>
            <p>Your card details will be entered only on Stripe's hosted payment page.</p>
          </div>
          <Link to="/cart" className="checkout-back-link">← Back to cart</Link>
        </div>

        {message && <p className={`checkout-message ${message.type}`}>{message.text}</p>}

        <div className="checkout-layout">
          <section className="checkout-card checkout-items-card">
            <h2>Order items</h2>
            {cartItems.map((item) => (
              <article className="checkout-item" key={item.id}>
                <div className="checkout-item-image">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : "📚"}
                </div>
                <div className="checkout-item-info">
                  <h3>{item.title}</h3>
                  <p>{item.seller?.name || "Academic seller"}</p>
                </div>
                <strong>{formatPrice(item.askingPrice)}</strong>
              </article>
            ))}
          </section>

          <aside className="checkout-card checkout-summary-card">
            <h2>Payment details</h2>
            <label htmlFor="customer-email">Customer email</label>
            <input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <div className="checkout-total-row">
              <span>Total</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>

            <button
              type="button"
              className="checkout-primary-button"
              onClick={handleStripeCheckout}
              disabled={Boolean(loadingMethod)}
            >
              {loadingMethod === "card" ? "Opening Stripe..." : "Pay with Card"}
            </button>

            <button
              type="button"
              className="checkout-cod-button"
              onClick={handleCashOnDelivery}
              disabled={Boolean(loadingMethod)}
            >
              {loadingMethod === "cod" ? "Placing order..." : "Cash on Delivery"}
            </button>

            <p className="checkout-security-note">🔒 Prices are verified by the server before an order is created.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
