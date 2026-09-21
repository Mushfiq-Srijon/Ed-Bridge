namespace EdBridge.API.Models
{
    public class SavedListing
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int ListingId { get; set; }
        public Listing Listing { get; set; } = null!;
        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}
