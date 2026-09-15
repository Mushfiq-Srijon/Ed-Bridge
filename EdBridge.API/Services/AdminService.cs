using EdBridge.API.Data;
using EdBridge.API.DTOs;
using EdBridge.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Services
{
    public class AdminService
    {
        private readonly AppDbContext _db;

        public AdminService(AppDbContext db)
        {
            _db = db;
        }

        // ============ DASHBOARD ============
        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
        {
            var totalUsers = await _db.Users.CountAsync();
            var suspendedUsers = await _db.Users.CountAsync(u => u.IsSuspended);

            var totalListings = await _db.Listings.CountAsync();
            var activeListings = await _db.Listings.CountAsync(l => l.Status == "Active");
            var underInvestigationListings = await _db.Listings.CountAsync(l => l.Status == "Under Investigation");
            var soldListings = await _db.Listings.CountAsync(l => l.Status == "Sold");
            var removedListings = await _db.Listings.CountAsync(l => l.Status == "Removed");

            var totalReports = await _db.Reports.CountAsync();
            var pendingReports = await _db.Reports.CountAsync(r => r.Status == "Pending");

            var totalPosts = await _db.Posts.CountAsync();
            var totalTransactions = await _db.Reviews.CountAsync();

            return new DashboardSummaryDto
            {
                TotalUsers = totalUsers,
                SuspendedUsers = suspendedUsers,
                TotalListings = totalListings,
                ActiveListings = activeListings,
                UnderInvestigationListings = underInvestigationListings,
                SoldListings = soldListings,
                RemovedListings = removedListings,
                TotalReports = totalReports,
                PendingReports = pendingReports,
                TotalPosts = totalPosts,
                TotalTransactions = totalTransactions
            };
        }

        // ============ REPORTS MANAGEMENT ============
        public async Task<List<ReportListItemDto>> GetAllReportsAsync(string? status = null)
        {
            var query = _db.Reports.AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(r => r.Status == status);

            return await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReportListItemDto
                {
                    Id = r.Id,
                    Type = r.ReportType,
                    ReportedItemId = r.ListingId ?? r.PostId ?? r.ReplyId ?? 0,
                    ReportedItemTitle = r.Listing != null ? r.Listing.Title : (r.Post != null ? r.Post.Title : "Unknown"),
                    ReportedById = r.ReporterId,
                    ReportedByEmail = r.Reporter.Email,
                    Reason = r.Reason,
                    Details = r.Reason,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<ReportDetailDto?> GetReportDetailAsync(int reportId)
        {
            var report = await _db.Reports
                .Include(r => r.Reporter)
                .Include(r => r.Listing)
                .Include(r => r.Post)
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null) return null;

            int reportedUserId = 0;
            string reportedUserEmail = "";
            string reportedUserName = "";
            bool reportedUserSuspended = false;

            if (report.ReportType == "Listing" && report.Listing != null)
            {
                reportedUserId = report.Listing.UserId;
                reportedUserSuspended = false;
            }
            else if (report.ReportType == "Post" && report.Post != null)
            {
                reportedUserId = report.Post.UserId;
                reportedUserSuspended = false;
            }

            return new ReportDetailDto
            {
                Id = report.Id,
                Type = report.ReportType,
                ReportedItemId = report.ListingId ?? report.PostId ?? report.ReplyId ?? 0,
                ReportedItemTitle = report.Listing?.Title ?? report.Post?.Title ?? "Unknown",
                ReportedItemContent = report.Listing?.Description ?? report.Post?.Content ?? "",
                ReportedById = report.ReporterId,
                ReportedByEmail = report.Reporter.Email,
                ReportedByName = report.Reporter.Name,
                ReportedUserId = reportedUserId,
                ReportedUserEmail = reportedUserEmail,
                ReportedUserName = reportedUserName,
                ReportedUserSuspended = reportedUserSuspended,
                Reason = report.Reason,
                Details = report.Reason,
                Status = report.Status,
                CreatedAt = report.CreatedAt
            };
        }

        public async Task<bool> DismissReportAsync(int reportId)
        {
            var report = await _db.Reports.FindAsync(reportId);
            if (report == null) return false;

            report.Status = "Dismissed";
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResolveReportAsync(int reportId, bool suspendUser = false)
        {
            var report = await _db.Reports
                .Include(r => r.Listing)
                .Include(r => r.Post)
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null) return false;

            report.Status = "Resolved";
            report.ResolvedAt = DateTime.UtcNow;

            if (report.ReportType == "Listing" && report.Listing != null)
            {
                report.Listing.Status = "Removed";

                if (suspendUser)
                {
                    var seller = await _db.Users.FindAsync(report.Listing.UserId);
                    if (seller != null)
                        seller.IsSuspended = true;
                }
            }
            else if (report.ReportType == "Post" && report.Post != null)
            {
                report.Post.UpdatedAt = DateTime.UtcNow;

                if (suspendUser)
                {
                    var author = await _db.Users.FindAsync(report.Post.UserId);
                    if (author != null)
                        author.IsSuspended = true;
                }
            }

            await _db.SaveChangesAsync();
            return true;
        }

        // ============ USER MANAGEMENT ============
        public async Task<List<UserListItemDto>> GetAllUsersAsync(string? search = null, string? status = null)
        {
            var query = _db.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.Email.Contains(search) || u.Name.Contains(search));

            if (status == "suspended")
                query = query.Where(u => u.IsSuspended);
            else if (status == "active")
                query = query.Where(u => !u.IsSuspended);

            return await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Name = u.Name,
                    Institution = u.Institution,
                    EducationLevel = u.EducationLevel,
                    Phone = u.Phone,
                    IsSuspended = u.IsSuspended,
                    CreatedAt = u.CreatedAt,
                    ListingsCount = u.Listings.Count,
                    SoldCount = u.Listings.Count(l => l.Status == "Sold")
                })
                .ToListAsync();
        }

        public async Task<UserDetailDto?> GetUserDetailAsync(int userId)
        {
            var user = await _db.Users
                .Include(u => u.Listings)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return null;

            var reportsCount = await _db.Reports.CountAsync(r =>
                (r.ReportType == "Listing" && r.Listing.UserId == userId) ||
                (r.ReportType == "Post" && r.Post.UserId == userId)
            );

            return new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Institution = user.Institution,
                EducationLevel = user.EducationLevel,
                Phone = user.Phone,
                ProfilePhotoPath = user.ProfilePhotoPath,
                IsSuspended = user.IsSuspended,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                ListingsCount = user.Listings.Count,
                SoldCount = user.Listings.Count(l => l.Status == "Sold"),
                ReportsCount = reportsCount
            };
        }

        public async Task<bool> SuspendUserAsync(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsSuspended = true;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReinstateUserAsync(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsSuspended = false;
            await _db.SaveChangesAsync();
            return true;
        }

        // ============ LISTINGS MANAGEMENT ============
        public async Task<List<ListingListItemDto>> GetAllListingsAsync(string? search = null, string? status = null, string? category = null)
        {
            var query = _db.Listings.AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(l => l.Title.Contains(search));

            if (!string.IsNullOrEmpty(status))
                query = query.Where(l => l.Status == status);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(l => l.Category == category);

            return await query
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new ListingListItemDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    Price = l.AskingPrice,
                    Category = l.Category,
                    Condition = l.Condition,
                    Status = l.Status,
                    SellerId = l.UserId,
                    SellerEmail = l.Owner.Email,
                    SellerName = l.Owner.Name,
                    CreatedAt = l.CreatedAt,
                    ReportsCount = l.Reports.Count
                })
                .ToListAsync();
        }

        public async Task<AdminListingDetailDto?> GetListingDetailAsync(int listingId)
        {
            var listing = await _db.Listings
                .Include(l => l.Owner)
                .FirstOrDefaultAsync(l => l.Id == listingId);

            if (listing == null) return null;

            return new AdminListingDetailDto
            {
                Id = listing.Id,
                Title = listing.Title,
                Description = listing.Description,
                Price = listing.AskingPrice,
                Category = listing.Category,
                Condition = listing.Condition,
                Status = listing.Status,
                SellerId = listing.UserId,
                SellerEmail = listing.Owner.Email,
                SellerName = listing.Owner.Name,
                Area = listing.Area,
                ImagePath = listing.ImageUrl,
                CreatedAt = listing.CreatedAt,
                UpdatedAt = listing.UpdatedAt
            };
        }

        public async Task<bool> RemoveListingAsync(int listingId)
        {
            var listing = await _db.Listings.FindAsync(listingId);
            if (listing == null) return false;

            listing.Status = "Removed";
            await _db.SaveChangesAsync();
            return true;
        }

        // ============ POSTS MODERATION ============
        public async Task<List<PostModerationDto>> GetReportedPostsAsync()
        {
            return await _db.Reports
                .Where(r => r.ReportType == "Post")
                .Include(r => r.Post)
                .ThenInclude(p => p.Author)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new PostModerationDto
                {
                    Id = r.Post.Id,
                    Title = r.Post.Title,
                    Content = r.Post.Content,
                    AuthorId = r.Post.UserId,
                    AuthorEmail = r.Post.Author.Email,
                    AuthorName = r.Post.Author.Name,
                    IsAnonymous = r.Post.IsAnonymous,
                    ReportsCount = r.Post.Replies.Count,
                    CreatedAt = r.Post.CreatedAt
                })
                .Distinct()
                .ToListAsync();
        }

        public async Task<bool> RemovePostAsync(int postId, bool suspendAuthor = false)
        {
            var post = await _db.Posts
                .Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null) return false;

            post.UpdatedAt = DateTime.UtcNow;

            if (suspendAuthor)
            {
                post.Author.IsSuspended = true;
            }

            await _db.SaveChangesAsync();
            return true;
        }

        // ============ ANALYTICS ============
        public async Task<AnalyticsDto> GetAnalyticsAsync()
        {
            var listingsByCategory = await _db.Listings
                .Where(l => l.Status == "Active")
                .GroupBy(l => l.Category)
                .Select(g => new ListingByCategoryDto
                {
                    Category = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            var listingsByStatus = await _db.Listings
                .GroupBy(l => l.Status)
                .Select(g => new ListingByStatusDto
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var mostReportedListings = await _db.Listings
                .Include(l => l.Reports)
                .Include(l => l.Owner)
                .OrderByDescending(l => l.Reports.Count)
                .Take(10)
                .Select(l => new MostReportedListingDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    ReportsCount = l.Reports.Count,
                    SellerName = l.Owner.Name
                })
                .ToListAsync();

            var topSellers = await _db.Users
                .Include(u => u.Listings)
                .Where(u => u.Listings.Count > 0)
                .OrderByDescending(u => u.Listings.Count(l => l.Status == "Sold"))
                .Take(10)
                .Select(u => new TopSellerDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    ListingsCount = u.Listings.Count,
                    SoldCount = u.Listings.Count(l => l.Status == "Sold")
                })
                .ToListAsync();

            return new AnalyticsDto
            {
                ListingsByCategory = listingsByCategory,
                ListingsByStatus = listingsByStatus,
                MostReportedListings = mostReportedListings,
                TopSellers = topSellers
            };
        }
    }
}