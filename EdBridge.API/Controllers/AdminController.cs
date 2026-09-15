using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EdBridge.API.Services;
using EdBridge.API.DTOs;
using System.Security.Claims;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        // ============ DASHBOARD ============
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var summary = await _adminService.GetDashboardSummaryAsync();
            return Ok(summary);
        }

        // ============ REPORTS ============
        [HttpGet("reports")]
        public async Task<IActionResult> GetReports([FromQuery] string? status = null)
        {
            var reports = await _adminService.GetAllReportsAsync(status);
            return Ok(reports);
        }

        [HttpGet("reports/{id}")]
        public async Task<IActionResult> GetReportDetail(int id)
        {
            var report = await _adminService.GetReportDetailAsync(id);
            if (report == null)
                return NotFound(new { message = "Report not found" });

            return Ok(report);
        }

        [HttpPut("reports/{id}/dismiss")]
        public async Task<IActionResult> DismissReport(int id)
        {
            var success = await _adminService.DismissReportAsync(id);
            if (!success)
                return NotFound(new { message = "Report not found" });

            return Ok(new { message = "Report dismissed" });
        }

        [HttpPut("reports/{id}/resolve")]
        public async Task<IActionResult> ResolveReport(int id, [FromBody] ReportActionDto action)
        {
            bool suspendUser = action.Action == "ResolveSuspend";
            var success = await _adminService.ResolveReportAsync(id, suspendUser);

            if (!success)
                return NotFound(new { message = "Report not found" });

            return Ok(new { message = "Report resolved" });
        }

        // ============ USERS ============
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string? search = null, [FromQuery] string? status = null)
        {
            var users = await _adminService.GetAllUsersAsync(search, status);
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserDetail(int id)
        {
            var user = await _adminService.GetUserDetailAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        [HttpPut("users/{id}/suspend")]
        public async Task<IActionResult> SuspendUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            if (id == currentUserId)
                return BadRequest(new { message = "An admin cannot suspend their own account" });

            var success = await _adminService.SuspendUserAsync(id);
            if (!success)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User suspended" });
        }

        [HttpPut("users/{id}/reinstate")]
        public async Task<IActionResult> ReinstateUser(int id)
        {
            var success = await _adminService.ReinstateUserAsync(id);
            if (!success)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User reinstated" });
        }

        // ============ LISTINGS ============
        [HttpGet("listings")]
        public async Task<IActionResult> GetListings([FromQuery] string? search = null, [FromQuery] string? status = null, [FromQuery] string? category = null)
        {
            var listings = await _adminService.GetAllListingsAsync(search, status, category);
            return Ok(listings);
        }

        [HttpGet("listings/{id}")]
        public async Task<IActionResult> GetListingDetail(int id)
        {
            var listing = await _adminService.GetListingDetailAsync(id);
            if (listing == null)
                return NotFound(new { message = "Listing not found" });

            return Ok(listing);
        }

        [HttpPut("listings/{id}/remove")]
        public async Task<IActionResult> RemoveListing(int id)
        {
            var success = await _adminService.RemoveListingAsync(id);
            if (!success)
                return NotFound(new { message = "Listing not found" });

            return Ok(new { message = "Listing removed" });
        }

        // ============ POSTS ============
        [HttpGet("posts/reported")]
        public async Task<IActionResult> GetReportedPosts()
        {
            var posts = await _adminService.GetReportedPostsAsync();
            return Ok(posts);
        }

        [HttpPut("posts/{id}/remove")]
        public async Task<IActionResult> RemovePost(int id, [FromBody] PostActionDto action)
        {
            bool suspendAuthor = action.Action == "RemoveSuspend";
            var success = await _adminService.RemovePostAsync(id, suspendAuthor);

            if (!success)
                return NotFound(new { message = "Post not found" });

            return Ok(new { message = "Post removed" });
        }

        // ============ ANALYTICS ============
        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var analytics = await _adminService.GetAnalyticsAsync();
            return Ok(analytics);
        }
    }
}