namespace EdBridge.API.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class NoteDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string? ThumbnailPath { get; set; }
        public string? EducationLevel { get; set; }
        public string? ClassName { get; set; }
        public string? Group { get; set; }
        public string? Department { get; set; }
        public string? CourseTitle { get; set; }
        public string? YearSemester { get; set; }
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
        public double AverageRating { get; set; }
        public int RatingCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public UserDto Author { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }

    public class NoteDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public bool HasPdf { get; set; }
        public string? ThumbnailPath { get; set; }
        public string? EducationLevel { get; set; }
        public string? ClassName { get; set; }
        public string? Group { get; set; }
        public string? Department { get; set; }
        public string? CourseTitle { get; set; }
        public string? YearSemester { get; set; }
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
        public double AverageRating { get; set; }
        public int RatingCount { get; set; }
        public int? UserRating { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public UserDto Author { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public List<NoteCommentDto> Comments { get; set; } = new();
    }

    public class NoteCommentDto
    {
        public int Id { get; set; }
        public string CommentText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
    }
}