using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public bool IsAnonymous { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User Author { get; set; }
        
        public ICollection<PostSubjectTag> PostSubjectTags { get; set; } = new List<PostSubjectTag>();
    }
}