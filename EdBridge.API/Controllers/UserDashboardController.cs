using System.Security.Claims;
using EdBridge.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize]
    public class UserDashboardController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UserDashboardController(AppDbContext db) => _db = db;

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var listings = await _db.Listings
                .Where(listing => listing.UserId == userId)
                .OrderByDescending(listing => listing.CreatedAt)
                .Select(listing => new
                {
                    id = listing.Id,
                    title = listing.Title,
                    status = listing.Status,
                    askingPrice = listing.AskingPrice,
                    imageUrl = listing.ImageUrl,
                    createdAt = listing.CreatedAt
                })
                .ToListAsync();

            var notes = await _db.Notes
                .Where(note => note.UserId == userId)
                .OrderByDescending(note => note.CreatedAt)
                .Select(note => new
                {
                    id = note.Id,
                    title = note.Title,
                    courseCode = note.CourseCode,
                    thumbnailPath = note.ThumbnailPath,
                    createdAt = note.CreatedAt
                })
                .ToListAsync();

            var posts = await _db.Posts
                .Where(post => post.UserId == userId)
                .OrderByDescending(post => post.CreatedAt)
                .Select(post => new
                {
                    id = post.Id,
                    title = post.Title,
                    status = post.Status,
                    createdAt = post.CreatedAt
                })
                .ToListAsync();

            return Ok(new { listings, notes, posts });
        }
    }
}
