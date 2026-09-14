namespace EdBridge.API.DTOs
{
    public class ProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Institution { get; set; }
        public string? EducationLevel { get; set; }
        public string? Phone { get; set; }
        public string? ProfilePhotoPath { get; set; }
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Institution { get; set; }
        public string? EducationLevel { get; set; }
        public string? Phone { get; set; }
    }
}