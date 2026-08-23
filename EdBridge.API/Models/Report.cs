using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class Report
    {
        public int Id { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; } = "Pending"; // "Pending", "Dismissed", "Removed"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
        
        public int ReporterId { get; set; }
        public int ListingId { get; set; }
        public int? ResolvedByAdminId { get; set; }
        
        [ForeignKey("ReporterId")]
        public User Reporter { get; set; }
        
        [ForeignKey("ListingId")]
        public Listing Listing { get; set; }
        
        [ForeignKey("ResolvedByAdminId")]
        public User ResolvedByAdmin { get; set; }
    }
}