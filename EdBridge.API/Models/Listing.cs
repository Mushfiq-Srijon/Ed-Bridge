using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class Listing
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } // e.g., "Physics Textbook - 3rd Edition"
        
        public string Description { get; set; }
        public string Condition { get; set; } // "Like New", "Good", "Fair"
        
        public decimal OriginalPrice { get; set; }
        public decimal AskingPrice { get; set; }
        
        public string Category { get; set; }
        public string Area { get; set; } // "Dhaka", "Sylhet", etc.
        
        // Status flow: Active → Under Investigation → Sold → Removed
        public string Status { get; set; } = "Active";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Foreign key: which user owns this listing
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User Owner { get; set; }
        
        // Navigation relationships
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<Report> Reports { get; set; } = new List<Report>();
        public ICollection<ListingSubjectTag> ListingSubjectTags { get; set; } = new List<ListingSubjectTag>();
    }
}