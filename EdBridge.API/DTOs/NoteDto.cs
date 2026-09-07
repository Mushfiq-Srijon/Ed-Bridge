namespace EdBridge.API.DTOs
{
    public class NoteDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
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
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public UserDto Author { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }
}