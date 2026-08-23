using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class Note
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Subject { get; set; } // "Physics", "Mathematics"
        public string CourseCode { get; set; } // "PHY101"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User Author { get; set; }
        
        public ICollection<NoteSubjectTag> NoteSubjectTags { get; set; } = new List<NoteSubjectTag>();
    }
}