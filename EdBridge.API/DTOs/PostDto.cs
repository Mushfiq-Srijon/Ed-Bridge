namespace EdBridge.API.DTOs
{
    public class PostDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsAnonymous { get; set; }
        public int ViewCount { get; set; }
        public int UpvoteCount { get; set; }
        public int DownvoteCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public UserDto Author { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class ReplyDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsAnonymous { get; set; }
        public bool IsBestAnswer { get; set; }
        public int UpvoteCount { get; set; }
        public int DownvoteCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserDto Author { get; set; } = new();
    }

    public class PostDetailDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public bool IsAnonymous { get; set; }

        public int ViewCount { get; set; }

        public int UpvoteCount { get; set; }

        public int DownvoteCount { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public int UserId { get; set; }

        public UserDto Author { get; set; } = new();

        public List<string> Tags { get; set; } = new();

        public List<ReplyDto> Replies { get; set; } = new();
    }
}