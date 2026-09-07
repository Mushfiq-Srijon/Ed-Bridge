namespace EdBridge.API.DTOs
{
    public class SellerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Institution { get; set; }
    }

    public class ListingDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public decimal OriginalPrice { get; set; }
        public decimal AskingPrice { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string? EducationLevel { get; set; }
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public SellerDto Seller { get; set; } = new();
        public List<string> SubjectTags { get; set; } = new();
    }

    public class ListingDetailDto : ListingDto
    {
        // room to grow later (e.g. messages, reviews)
    }

    public class CreateListingRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public decimal OriginalPrice { get; set; }
        public decimal AskingPrice { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string? EducationLevel { get; set; }
        public string? ImageUrl { get; set; }
        public List<int> SubjectTagIds { get; set; } = new();
    }

    public class UpdateListingRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public decimal OriginalPrice { get; set; }
        public decimal AskingPrice { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string? EducationLevel { get; set; }
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = "Active";
    }
}