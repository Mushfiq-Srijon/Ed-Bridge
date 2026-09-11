using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class NoteComment
    {
        public int Id { get; set; }

        public string CommentText { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int NoteId { get; set; }

        public int UserId { get; set; }

        [ForeignKey("NoteId")]
        public Note Note { get; set; }

        [ForeignKey("UserId")]
        public User Author { get; set; }
    }
}