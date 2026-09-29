namespace EdBridge.API.Models
{
    public class Order
    {
        public int Id { get; set; }

        public int BuyerId { get; set; }
        public User Buyer { get; set; } = null!;

        public string CustomerEmail { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "bdt";

        // Card or CashOnDelivery
        public string PaymentMethod { get; set; } = string.Empty;

        // Pending, Paid, Failed
        public string PaymentStatus { get; set; } = "Pending";

        // Pending, Confirmed, Cancelled
        public string OrderStatus { get; set; } = "Pending";

        public string? StripeCheckoutSessionId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
