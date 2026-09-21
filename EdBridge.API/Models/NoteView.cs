using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    /// <summary>One unique view per authenticated user and note.</summary>
    public class NoteView
    {
        public int NoteId { get; set; }
        [ForeignKey("NoteId")]
        public Note Note { get; set; } = null!;

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    }
}
