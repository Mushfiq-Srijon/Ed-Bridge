using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsAnonymous { get; set; } = false;
        
        public int ViewCount { get; set; } = 0;
        public int UpvoteCount { get; set; } = 0;
        public int DownvoteCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User? Author { get; set; }
        
        public ICollection<PostSubjectTag> PostSubjectTags { get; set; } = new List<PostSubjectTag>();
        public ICollection<Reply> Replies { get; set; } = new List<Reply>();
        public ICollection<PostUpvote> Upvotes { get; set; } = new List<PostUpvote>();
        public ICollection<PostFollow> Followers { get; set; } = new List<PostFollow>();
    }
}