using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class NoteRating
    {
        public int Id { get; set; }

        public int Rating { get; set; } // 1-5

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public int NoteId { get; set; }

        public int UserId { get; set; }

        [ForeignKey("NoteId")]
        public Note Note { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}