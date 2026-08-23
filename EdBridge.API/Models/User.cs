using System.ComponentModel.DataAnnotations;

namespace EdBridge.API.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        public string Name { get; set; }
        public string Institution { get; set; }
        public string EducationLevel { get; set; }
        public string Phone { get; set; }
        
        public bool EmailVerified { get; set; } = false;
        public string Role { get; set; } = "User"; // "User" or "Admin"
        public bool IsSuspended { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties (relationships)
        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
        public ICollection<Note> Notes { get; set; } = new List<Note>();
        public ICollection<Post> Posts { get; set; } = new List<Post>();
    }
}