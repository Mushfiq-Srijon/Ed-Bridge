using EdBridge.API.Data;
using EdBridge.API.DTOs;
using EdBridge.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Services
{
    public class ListingService
    {
        private readonly AppDbContext _db;

        public ListingService(AppDbContext db)
        {
            _db = db;
        }

        private static ListingDto ToDto(Listing l) => new ListingDto
        {
            Id = l.Id,
            Title = l.Title,
            Description = l.Description,
            Condition = l.Condition,
            OriginalPrice = l.OriginalPrice,
            AskingPrice = l.AskingPrice,
            Category = l.Category,
            Area = l.Area,
            EducationLevel = l.EducationLevel,
            ImageUrl = l.ImageUrl,
            Status = l.Status,
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt,
            Seller = new SellerDto
            {
                Id = l.Owner.Id,
                Name = l.Owner.Name,
                Institution = l.Owner.Institution
            },
            SubjectTags = l.ListingSubjectTags.Select(lst => lst.SubjectTag.Name).ToList()
        };

        public async Task<Listing> CreateListingAsync(Listing listing, List<int> subjectTagIds)
        {
            if (subjectTagIds != null && subjectTagIds.Any())
            {
                foreach (var tagId in subjectTagIds)
                {
                    listing.ListingSubjectTags.Add(new ListingSubjectTag
                    {
                        ListingId = listing.Id,
                        SubjectTagId = tagId
                    });
                }
            }

            _db.Listings.Add(listing);
            await _db.SaveChangesAsync();

            await _db.Entry(listing).Reference(l => l.Owner).LoadAsync();
            return listing;
        }

        public async Task<(List<ListingDto> Items, int Total)> GetListingsAsync(
            string? category, string? condition, string? area,
            decimal? minPrice, decimal? maxPrice, string? search,
            string? sort, int page = 1, int pageSize = 12)
        {
            var query = _db.Listings
                .Where(l => l.Status == "Active")
                .Include(l => l.Owner)
                .Include(l => l.ListingSubjectTags)
                    .ThenInclude(lst => lst.SubjectTag)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(category) && category != "All")
                query = query.Where(l => l.Category == category);

            if (!string.IsNullOrWhiteSpace(condition) && condition != "All")
                query = query.Where(l => l.Condition == condition);

            if (!string.IsNullOrWhiteSpace(area) && area != "All")
                query = query.Where(l => l.Area == area);

            if (minPrice.HasValue)
                query = query.Where(l => l.AskingPrice >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(l => l.AskingPrice <= maxPrice.Value);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lower = search.ToLower();
                query = query.Where(l =>
                    l.Title.ToLower().Contains(lower) ||
                    l.Description.ToLower().Contains(lower) ||
                    l.Category.ToLower().Contains(lower) ||
                    l.Area.ToLower().Contains(lower));
            }

            query = sort switch
            {
                "price-low" => query.OrderBy(l => l.AskingPrice),
                "price-high" => query.OrderByDescending(l => l.AskingPrice),
                _ => query.OrderByDescending(l => l.CreatedAt) // "newest" / default
            };

            var total = await query.CountAsync();

            var listings = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (listings.Select(ToDto).ToList(), total);
        }

        public async Task<ListingDetailDto?> GetListingByIdAsync(int id)
        {
            var listing = await _db.Listings
                .Include(l => l.Owner)
                .Include(l => l.ListingSubjectTags)
                    .ThenInclude(lst => lst.SubjectTag)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (listing == null) return null;

            var dto = ToDto(listing);
            return new ListingDetailDto
            {
                Id = dto.Id, Title = dto.Title, Description = dto.Description,
                Condition = dto.Condition, OriginalPrice = dto.OriginalPrice,
                AskingPrice = dto.AskingPrice, Category = dto.Category, Area = dto.Area,
                EducationLevel = dto.EducationLevel, ImageUrl = dto.ImageUrl,
                Status = dto.Status, CreatedAt = dto.CreatedAt, UpdatedAt = dto.UpdatedAt,
                Seller = dto.Seller, SubjectTags = dto.SubjectTags
            };
        }

        public async Task<Listing?> UpdateListingAsync(int id, UpdateListingRequest req)
        {
            var listing = await _db.Listings.FindAsync(id);
            if (listing == null) return null;

            listing.Title = req.Title;
            listing.Description = req.Description;
            listing.Condition = req.Condition;
            listing.OriginalPrice = req.OriginalPrice;
            listing.AskingPrice = req.AskingPrice;
            listing.Category = req.Category;
            listing.Area = req.Area;
            listing.EducationLevel = req.EducationLevel;
            listing.ImageUrl = req.ImageUrl;
            listing.Status = req.Status;
            listing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return listing;
        }

        public async Task<bool> DeleteListingAsync(int id)
        {
            var listing = await _db.Listings.FindAsync(id);
            if (listing == null) return false;

            _db.Listings.Remove(listing);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<string>> GetDistinctCategoriesAsync()
        {
            return await _db.Listings.Select(l => l.Category).Distinct().ToListAsync();
        }

        public async Task<List<string>> GetDistinctAreasAsync()
        {
            return await _db.Listings.Select(l => l.Area).Distinct().ToListAsync();
        }
    }
}