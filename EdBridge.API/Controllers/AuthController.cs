using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EdBridge.API.Models;
using EdBridge.API.Services;
using EdBridge.API.Data;
using EdBridge.API.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AuthService _authService;

        public AuthController(AppDbContext db, AuthService authService)
        {
            _db = db;
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (await _db.Users.AnyAsync(u => u.Email == req.Email))
                return BadRequest(new { message = "Email already exists" });

            if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters" });

            var user = new User
            {
                Email = req.Email,
                PasswordHash = _authService.HashPassword(req.Password),
                Name = req.Name,
                EmailVerified = true
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Registration successful", userId = user.Id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);

            if (user == null || !_authService.VerifyPassword(req.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password" });

            if (user.IsSuspended)
                return Unauthorized(new { message = "Your account has been suspended. Please contact support." });

            var token = _authService.GenerateToken(user);
            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.Name,
                    user.Role,
                    user.Institution,
                    user.EducationLevel,
                    user.Phone,
                    user.ProfilePhotoPath
                }
            });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _db.Users.FindAsync(userId);

            if (user == null) return NotFound(new { message = "User not found" });

            var profile = new ProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Institution = user.Institution,
                EducationLevel = user.EducationLevel,
                Phone = user.Phone,
                ProfilePhotoPath = user.ProfilePhotoPath,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };

            return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _db.Users.FindAsync(userId);

            if (user == null) return NotFound(new { message = "User not found" });

            if (string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new { message = "Name is required" });

            user.Name = req.Name;
            user.Institution = req.Institution;
            user.EducationLevel = req.EducationLevel;
            user.Phone = req.Phone;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var profile = new ProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Institution = user.Institution,
                EducationLevel = user.EducationLevel,
                Phone = user.Phone,
                ProfilePhotoPath = user.ProfilePhotoPath,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };

            return Ok(new { message = "Profile updated", profile });
        }

        [HttpPost("profile/photo")]
        [Authorize]
        public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _db.Users.FindAsync(userId);

            if (user == null) return NotFound(new { message = "User not found" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided" });

            try
            {
                _authService.DeleteProfilePhoto(user.ProfilePhotoPath);

                var photoPath = await _authService.SaveProfilePhotoAsync(file);
                user.ProfilePhotoPath = photoPath;
                user.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return Ok(new { message = "Profile photo updated", profilePhotoPath = photoPath });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("profile/photo")]
        [Authorize]
        public async Task<IActionResult> RemoveProfilePhoto()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _db.Users.FindAsync(userId);

            if (user == null) return NotFound(new { message = "User not found" });

            _authService.DeleteProfilePhoto(user.ProfilePhotoPath);
            user.ProfilePhotoPath = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new { message = "Profile photo removed" });
        }

        [HttpPut("password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.CurrentPassword) || string.IsNullOrWhiteSpace(req.NewPassword))
                return BadRequest(new { message = "Current and new passwords are required" });

            if (req.NewPassword.Length < 6)
                return BadRequest(new { message = "New password must be at least 6 characters" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (!_authService.VerifyPassword(req.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect" });

            user.PasswordHash = _authService.HashPassword(req.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }

        [HttpDelete("account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            // Remove direct, user-owned records first so the operation remains
            // safe even when a deployment uses restrictive foreign keys.
            _db.Messages.RemoveRange(_db.Messages.Where(message => message.SenderId == userId || message.ReceiverId == userId));
            _db.SavedNotes.RemoveRange(_db.SavedNotes.Where(saved => saved.UserId == userId));
            _db.SavedListings.RemoveRange(_db.SavedListings.Where(saved => saved.UserId == userId));
            _db.SavedPosts.RemoveRange(_db.SavedPosts.Where(saved => saved.UserId == userId));
            _db.NoteRatings.RemoveRange(_db.NoteRatings.Where(rating => rating.UserId == userId));
            _db.NoteComments.RemoveRange(_db.NoteComments.Where(comment => comment.UserId == userId));
            _db.PostUpvotes.RemoveRange(_db.PostUpvotes.Where(vote => vote.UserId == userId));
            _db.PostDownvotes.RemoveRange(_db.PostDownvotes.Where(vote => vote.UserId == userId));
            _db.ReplyUpvotes.RemoveRange(_db.ReplyUpvotes.Where(vote => vote.UserId == userId));
            _db.ReplyDownvotes.RemoveRange(_db.ReplyDownvotes.Where(vote => vote.UserId == userId));
            _db.PostFollows.RemoveRange(_db.PostFollows.Where(follow => follow.UserId == userId));
            _db.PostViews.RemoveRange(_db.PostViews.Where(view => view.UserId == userId));
            _db.NoteViews.RemoveRange(_db.NoteViews.Where(view => view.UserId == userId));

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Account deleted successfully" });
        }
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
