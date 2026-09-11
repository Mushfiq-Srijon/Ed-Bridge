using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class Note
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Content { get; set; }
        public string Subject { get; set; }
        public string CourseCode { get; set; }

        // File uploads
        public string? PdfPath { get; set; }
        public string? ThumbnailPath { get; set; }

        // Education information
        public string? EducationLevel { get; set; }
        public string? ClassName { get; set; }
        public string? Group { get; set; }
        public string? Department { get; set; }
        public string? CourseTitle { get; set; }
        public string? YearSemester { get; set; }

        public int ViewCount { get; set; } = 0;
        public int DownloadCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User Author { get; set; }

        public ICollection<NoteSubjectTag> NoteSubjectTags { get; set; } = new List<NoteSubjectTag>();

        public ICollection<NoteComment> Comments { get; set; } = new List<NoteComment>();

        public ICollection<NoteRating> Ratings { get; set; } = new List<NoteRating>();
    }
}