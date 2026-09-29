namespace EdBridge.API.Models
{
    public class OrderItem
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        // Nullable so an old order remains readable if its listing is deleted.
        public int? ListingId { get; set; }
        public Listing? Listing { get; set; }

        // These values are snapshots. They must not be recalculated from the
        // current listing after checkout.
        public int SellerId { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
    }
}
