using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class ReplyUpvote
    {
        public int Id { get; set; }
        public int ReplyId { get; set; }
        [ForeignKey("ReplyId")]
        public Reply Reply { get; set; }
        
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}