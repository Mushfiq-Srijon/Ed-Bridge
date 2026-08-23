using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class Message
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        
        public int SenderId { get; set; }
        public int ListingId { get; set; }
        
        [ForeignKey("SenderId")]
        public User Sender { get; set; }
        
        [ForeignKey("ListingId")]
        public Listing Listing { get; set; }
    }
}