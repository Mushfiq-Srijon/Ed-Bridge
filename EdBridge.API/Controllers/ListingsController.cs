using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EdBridge.API.Services;
using EdBridge.API.Data;
using EdBridge.API.DTOs;
using EdBridge.API.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingsController : ControllerBase
    {
        private const decimal MaximumListingPrice = 10000m;
        private const int MaximumImageDataUrlLength = 600000;
        private readonly ListingService _listingService;
        private readonly AppDbContext _db;

        public ListingsController(ListingService listingService, AppDbContext db)
        {
            _listingService = listingService;
            _db = db;
        }

        private static string? GetPriceValidationError(decimal originalPrice, decimal askingPrice)
        {
            if (originalPrice <= 0 || askingPrice <= 0)
                return "Prices must be greater than 0.";

            if (originalPrice > MaximumListingPrice || askingPrice > MaximumListingPrice)
                return "Original and asking prices cannot be more than 10,000 Tk.";

            if (askingPrice > originalPrice)
                return "Asking price cannot be higher than the original price.";

            return null;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetListings(
            [FromQuery] string? category, [FromQuery] string? condition,
            [FromQuery] string? area, [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice, [FromQuery] string? search,
            [FromQuery] string? sort, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
        {
            var (items, total) = await _listingService.GetListingsAsync(
                category, condition, area, minPrice, maxPrice, search, sort, page, pageSize);

            return Ok(new { items, total, page, pageSize });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetListing(int id)
        {
            var listing = await _listingService.GetListingByIdAsync(id);
            if (listing == null) return NotFound(new { message = "Listing not found" });
            return Ok(listing);
        }

        [HttpPost("{id}/save")]
        [Authorize]
        public async Task<IActionResult> SaveListing(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (!await _db.Listings.AnyAsync(listing => listing.Id == id))
                return NotFound(new { message = "Listing not found" });

            if (await _db.SavedListings.AnyAsync(saved => saved.ListingId == id && saved.UserId == userId))
                return Ok(new { message = "Listing is already saved" });

            _db.SavedListings.Add(new SavedListing { ListingId = id, UserId = userId, SavedAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
            return Ok(new { message = "Listing saved successfully" });
        }

        [HttpDelete("{id}/save")]
        [Authorize]
        public async Task<IActionResult> UnsaveListing(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var saved = await _db.SavedListings.FirstOrDefaultAsync(item => item.ListingId == id && item.UserId == userId);
            if (saved == null)
                return NotFound(new { message = "Saved listing not found" });

            _db.SavedListings.Remove(saved);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Listing removed from saved items" });
        }

        [HttpGet("saved")]
        [Authorize]
        public async Task<IActionResult> GetSavedListings()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var savedListings = await _db.SavedListings
                .Where(saved => saved.UserId == userId)
                .Include(saved => saved.Listing)
                    .ThenInclude(listing => listing.Owner)
                .Include(saved => saved.Listing)
                    .ThenInclude(listing => listing.ListingSubjectTags)
                        .ThenInclude(tag => tag.SubjectTag)
                .OrderByDescending(saved => saved.SavedAt)
                .Select(saved => new
                {
                    saved.Listing.Id,
                    saved.Listing.Title,
                    saved.Listing.Description,
                    saved.Listing.Condition,
                    saved.Listing.OriginalPrice,
                    saved.Listing.AskingPrice,
                    saved.Listing.Category,
                    saved.Listing.Area,
                    saved.Listing.EducationLevel,
                    saved.Listing.ImageUrl,
                    saved.Listing.Status,
                    saved.Listing.CreatedAt,
                    Seller = new { saved.Listing.Owner.Id, saved.Listing.Owner.Name, saved.Listing.Owner.Institution },
                    SubjectTags = saved.Listing.ListingSubjectTags.Select(tag => tag.SubjectTag.Name).ToList(),
                    SavedAt = saved.SavedAt
                })
                .ToListAsync();

            return Ok(savedListings);
        }

        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategories()
        {
            return Ok(await _listingService.GetDistinctCategoriesAsync());
        }

        [HttpGet("areas")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAreas()
        {
            return Ok(await _listingService.GetDistinctAreasAsync());
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateListing([FromBody] CreateListingRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Description))
                return BadRequest(new { message = "Title and description are required" });

            var priceValidationError = GetPriceValidationError(req.OriginalPrice, req.AskingPrice);
            if (priceValidationError != null)
                return BadRequest(new { message = priceValidationError });

            if (req.ImageUrl?.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase) == true &&
                req.ImageUrl.Length > MaximumImageDataUrlLength)
            {
                return BadRequest(new
                {
                    message = "The uploaded image is too large. Please choose a smaller image."
                });
            }

            var subjectTagIds = req.SubjectTagIds?.Distinct().ToList() ?? new List<int>();

            if (!string.IsNullOrWhiteSpace(req.CustomSubject))
            {
                var customSubjectName = req.CustomSubject.Trim();
                if (customSubjectName.Length < 2)
                    return BadRequest(new { message = "A custom subject must contain at least 2 characters." });

                var customSubject = await _db.SubjectTags
                    .FirstOrDefaultAsync(subject => subject.Name.ToLower() == customSubjectName.ToLower());

                if (customSubject == null)
                {
                    customSubject = new SubjectTag { Name = customSubjectName };
                    _db.SubjectTags.Add(customSubject);
                    await _db.SaveChangesAsync();
                }

                if (!subjectTagIds.Contains(customSubject.Id))
                    subjectTagIds.Add(customSubject.Id);
            }

            if (subjectTagIds.Count == 0)
                return BadRequest(new { message = "At least one subject is required." });

            var validSubjectCount = await _db.SubjectTags
                .CountAsync(subject => subjectTagIds.Contains(subject.Id));
            if (validSubjectCount != subjectTagIds.Count)
                return BadRequest(new { message = "One or more selected subjects are invalid." });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var listing = new Listing
            {
                Title = req.Title,
                Description = req.Description,
                Condition = req.Condition,
                OriginalPrice = req.OriginalPrice,
                AskingPrice = req.AskingPrice,
                Category = req.Category,
                Area = req.Area,
                EducationLevel = req.EducationLevel,
                ImageUrl = req.ImageUrl,
                UserId = userId
            };

            var created = await _listingService.CreateListingAsync(listing, subjectTagIds);
            var dto = await _listingService.GetListingByIdAsync(created.Id);

            return Ok(new { message = "Listing created", listingId = created.Id, listing = dto });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateListing(int id, [FromBody] UpdateListingRequest req)
        {
            var existing = await _db.Listings.FindAsync(id);
            if (existing == null) return NotFound(new { message = "Listing not found" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (existing.UserId != userId && User.FindFirst(ClaimTypes.Role)?.Value != "Admin")
                return Forbid();

            var priceValidationError = GetPriceValidationError(req.OriginalPrice, req.AskingPrice);
            if (priceValidationError != null)
                return BadRequest(new { message = priceValidationError });

            var updated = await _listingService.UpdateListingAsync(id, req);
            return Ok(new { message = "Listing updated", listing = updated });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteListing(int id)
        {
            var existing = await _db.Listings.FindAsync(id);
            if (existing == null) return NotFound(new { message = "Listing not found" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (existing.UserId != userId && User.FindFirst(ClaimTypes.Role)?.Value != "Admin")
                return Forbid();

            await _listingService.DeleteListingAsync(id);
            return Ok(new { message = "Listing deleted" });
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateListingStatus(int id, [FromBody] UpdateListingStatusRequest req)
        {
            var existing = await _db.Listings.FindAsync(id);
            if (existing == null) return NotFound(new { message = "Listing not found" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (existing.UserId != userId && User.FindFirst(ClaimTypes.Role)?.Value != "Admin")
                return Forbid();

            // Validate status
            var validStatuses = new[] { "Active", "Sold", "Under Investigation", "Removed" };
            if (!validStatuses.Contains(req.Status))
                return BadRequest(new { message = "Invalid status" });

            existing.Status = req.Status;
            existing.UpdatedAt = DateTime.UtcNow;

            _db.Listings.Update(existing);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Listing status updated", status = existing.Status });
        }

        [HttpPost("{id}/report")]
[Authorize]
public async Task<IActionResult> ReportListing(int id, [FromBody] ReportRequest req)
{
    try
    {
        if (string.IsNullOrWhiteSpace(req.Reason))
            return BadRequest(new { message = "Reason is required" });

        var listing = await _db.Listings.FindAsync(id);
        if (listing == null) return NotFound(new { message = "Listing not found" });

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        if (listing.UserId == userId)
            return BadRequest(new { message = "You cannot report your own listing" });

        var alreadyReported = await _db.Reports
            .Where(r => r.ReporterId == userId && 
                        r.ReportType == "Listing" && 
                        r.ListingId == id)
            .AnyAsync();

        if (alreadyReported)
            return BadRequest(new { message = "You have already reported this listing" });

        _db.Reports.Add(new Report
        {
            ReporterId = userId,
            ReportType = "Listing",
            ListingId = id,
            Reason = req.Reason,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Listing reported" });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = "Error: " + ex.Message });
    }
}

        public class ReportRequest
        {
            public string Reason { get; set; } = string.Empty;
        }

        public class UpdateListingStatusRequest
        {
            public string Status { get; set; } = string.Empty;
        }
    }
}
