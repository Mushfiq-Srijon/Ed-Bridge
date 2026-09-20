namespace EdBridge.API.Models
{
    public class SavedNote
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int NoteId { get; set; }
        public Note Note { get; set; } = null!;

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}
