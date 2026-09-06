using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class PostView
    {
        public int PostId { get; set; }
        [ForeignKey("PostId")]
        public Post Post { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

        // Composite key
    }
}