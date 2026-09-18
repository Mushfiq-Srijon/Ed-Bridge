namespace EdBridge.API.DTOs
{
    // ============ DASHBOARD ============
    public class DashboardSummaryDto
    {
        public int TotalUsers { get; set; }
        public int SuspendedUsers { get; set; }

        public int TotalListings { get; set; }
        public int ActiveListings { get; set; }
        public int UnderInvestigationListings { get; set; }
        public int SoldListings { get; set; }
        public int RemovedListings { get; set; }

        public int TotalReports { get; set; }
        public int PendingReports { get; set; }

        public int TotalPosts { get; set; }
        public int TotalNotes { get; set; }
        public int ReportedNotes { get; set; }
        public int ReportedPosts { get; set; }
        public int TotalTransactions { get; set; }
    }

    // ============ REPORTS MANAGEMENT ============
    public class ReportListItemDto
    {
        public int Id { get; set; }
        public string Type { get; set; } // "Listing", "Post", "User"
        public int ReportedItemId { get; set; }
        public string ReportedItemTitle { get; set; }
        public int ReportedById { get; set; }
        public string ReportedByEmail { get; set; }
        public string Reason { get; set; }
        public string Details { get; set; }
        public string Status { get; set; } // "Pending", "Resolved", "Dismissed"
        public DateTime CreatedAt { get; set; }
    }

    public class ReportDetailDto
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public int ReportedItemId { get; set; }
        public string ReportedItemTitle { get; set; }
        public string ReportedItemContent { get; set; }

        public int ReportedById { get; set; }
        public string ReportedByEmail { get; set; }
        public string ReportedByName { get; set; }

        public int ReportedUserId { get; set; }
        public string ReportedUserEmail { get; set; }
        public string ReportedUserName { get; set; }
        public bool ReportedUserSuspended { get; set; }

        public string Reason { get; set; }
        public string Details { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ReportActionDto
    {
        public string Action { get; set; } // "Dismiss", "Resolve", "ResolveSuspend"
    }

    // ============ USER MANAGEMENT ============
    public class UserListItemDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string? Institution { get; set; }
        public string? EducationLevel { get; set; }
        public string? Phone { get; set; }
        public bool IsSuspended { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ListingsCount { get; set; }
        public int SoldCount { get; set; }
    }

    public class UserDetailDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string? Institution { get; set; }
        public string? EducationLevel { get; set; }
        public string? Phone { get; set; }
        public string? ProfilePhotoPath { get; set; }
        public bool IsSuspended { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int ListingsCount { get; set; }
        public int SoldCount { get; set; }
        public int ReportsCount { get; set; }
    }

    public class UserActionDto
    {
        public string Action { get; set; } // "Suspend", "Reinstate"
    }

    // ============ LISTINGS MANAGEMENT ============
    public class ListingListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public string Condition { get; set; }
        public string Status { get; set; } // "Active", "Under Investigation", "Sold", "Removed"
        public int SellerId { get; set; }
        public string SellerEmail { get; set; }
        public string SellerName { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ReportsCount { get; set; }
    }

    public class ListingActionDto
    {
        public string Action { get; set; } // "Remove"
    }

    // ============ POSTS/FORUM MODERATION ============
    public class PostModerationDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int AuthorId { get; set; }
        public string? AuthorEmail { get; set; }
        public string? AuthorName { get; set; }
        public bool IsAnonymous { get; set; }
        public int ReportsCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PostActionDto
    {
        public string Action { get; set; } // "Dismiss", "Remove", "RemoveSuspend"
    }

    // ============ ANALYTICS ============
    public class ListingByCategoryDto
    {
        public string Category { get; set; }
        public int Count { get; set; }
    }

    public class ListingByStatusDto
    {
        public string Status { get; set; }
        public int Count { get; set; }
    }

    public class MostReportedListingDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int ReportsCount { get; set; }
        public string SellerName { get; set; }
    }

    public class TopSellerDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public int ListingsCount { get; set; }
        public int SoldCount { get; set; }
    }

    public class AnalyticsDto
    {
        public List<ListingByCategoryDto> ListingsByCategory { get; set; }
        public List<ListingByStatusDto> ListingsByStatus { get; set; }
        public List<MostReportedListingDto> MostReportedListings { get; set; }
        public List<TopSellerDto> TopSellers { get; set; }
        public int TotalUsers { get; set; }
        public int SuspendedUsers { get; set; }
        public int TotalReports { get; set; }
        public int PendingReports { get; set; }
        public int ResolvedReports { get; set; }
        public int DismissedReports { get; set; }
        public int TotalNotes { get; set; }
        public int ReportedNotes { get; set; }
        public int TotalPosts { get; set; }
        public int ReportedPosts { get; set; }
    }
    public class AdminListingDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public string Condition { get; set; }
        public string Status { get; set; }
        public int SellerId { get; set; }
        public string SellerEmail { get; set; }
        public string SellerName { get; set; }
        public string Area { get; set; }
        public string? ImagePath { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // ============ NOTES MANAGEMENT ============
    public class NoteListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string CourseCode { get; set; }
        public string Subject { get; set; }
        public string? EducationLevel { get; set; }
        public int AuthorId { get; set; }
        public string AuthorEmail { get; set; }
        public string AuthorName { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ReportsCount { get; set; }
    }

    public class AdminNoteDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string CourseCode { get; set; }
        public string Subject { get; set; }
        public string? EducationLevel { get; set; }
        public string? ClassName { get; set; }
        public string? Department { get; set; }
        public string? CourseTitle { get; set; }
        public int AuthorId { get; set; }
        public string AuthorEmail { get; set; }
        public string AuthorName { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ReportsCount { get; set; }
    }

    // ============ FORUMS/POSTS MANAGEMENT ============
    public class ForumPostListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int AuthorId { get; set; }
        public string? AuthorEmail { get; set; }
        public string? AuthorName { get; set; }
        public bool IsAnonymous { get; set; }
        public int RepliesCount { get; set; }
        public int ReportsCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}