using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int Rating { get; set; } // 1-5 stars
        public string Comment { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int BuyerId { get; set; }
        public int SellerId { get; set; }
        
        [ForeignKey("BuyerId")]
        public User Buyer { get; set; }
        
        [ForeignKey("SellerId")]
        public User Seller { get; set; }
    }
}