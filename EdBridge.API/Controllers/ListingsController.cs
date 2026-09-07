using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EdBridge.API.Services;
using EdBridge.API.Data;
using EdBridge.API.DTOs;
using EdBridge.API.Models;
using System.Security.Claims;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingsController : ControllerBase
    {
        private readonly ListingService _listingService;
        private readonly AppDbContext _db;

        public ListingsController(ListingService listingService, AppDbContext db)
        {
            _listingService = listingService;
            _db = db;
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

            var created = await _listingService.CreateListingAsync(listing, req.SubjectTagIds);
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
    }
}