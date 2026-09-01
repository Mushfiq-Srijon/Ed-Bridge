using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class Reply
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public bool IsAnonymous { get; set; } = false;
        public bool IsBestAnswer { get; set; } = false;
        
        public int UpvoteCount { get; set; } = 0;
        public int DownvoteCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        public int PostId { get; set; }
        [ForeignKey("PostId")]
        public Post Post { get; set; }
        
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User Author { get; set; }
        
        public ICollection<ReplyUpvote> Upvotes { get; set; } = new List<ReplyUpvote>();
    }
}