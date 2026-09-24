using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EdBridge.API.Models;
using EdBridge.API.Services;
using EdBridge.API.Data;
using EdBridge.API.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Google.Apis.Auth;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AuthService _authService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AuthController(
            AppDbContext db,
            AuthService authService,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _db = db;
            _authService = authService;
            _emailService = emailService;
            _configuration = configuration;
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
                EmailVerified = false
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var rawToken = Convert.ToBase64String(
                System.Security.Cryptography.RandomNumberGenerator.GetBytes(32)
            );

            var tokenHash = Convert.ToHexString(
                System.Security.Cryptography.SHA256.HashData(
                    System.Text.Encoding.UTF8.GetBytes(rawToken)
                )
            );

            var verificationToken = new EmailVerificationToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            _db.EmailVerificationTokens.Add(verificationToken);
            await _db.SaveChangesAsync();

            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";

            var verificationLink =
                $"{frontendUrl}/verify-email?token={Uri.EscapeDataString(rawToken)}";

            try
            {
                await _emailService.SendVerificationEmailAsync(
                    user.Email,
                    user.Name,
                    verificationLink
                );
            }
            catch (InvalidOperationException)
            {
                _db.EmailVerificationTokens.Remove(verificationToken);
                _db.Users.Remove(user);
                await _db.SaveChangesAsync();

                return StatusCode(503, new
                {
                    message = "Email delivery is not configured. Please contact the administrator."
                });
            }
            catch
            {
                _db.EmailVerificationTokens.Remove(verificationToken);
                _db.Users.Remove(user);
                await _db.SaveChangesAsync();

                return StatusCode(500, new
                {
                    message = "Account could not be created because the verification email could not be sent."
                });
            }

            return Ok(new
            {
                message = "Registration successful. Please check your email to verify your account."
            });
        }

        [HttpGet("google/config")]
        [AllowAnonymous]
        public IActionResult GetGoogleConfiguration()
        {
            var clientId = _configuration["Google:ClientId"];
            return Ok(new
            {
                enabled = !string.IsNullOrWhiteSpace(clientId),
                clientId = clientId ?? string.Empty
            });
        }

        [HttpPost("google")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest req)
        {
            var clientId = _configuration["Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
                return StatusCode(503, new { message = "Google sign-in is not configured." });

            if (string.IsNullOrWhiteSpace(req.IdToken))
                return BadRequest(new { message = "Google identity token is required." });

            GoogleJsonWebSignature.Payload googleUser;
            try
            {
                googleUser = await GoogleJsonWebSignature.ValidateAsync(req.IdToken,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { clientId }
                    });
            }
            catch
            {
                return Unauthorized(new { message = "Google sign-in could not be verified." });
            }

            if (string.IsNullOrWhiteSpace(googleUser.Email) || !googleUser.EmailVerified)
                return BadRequest(new { message = "Google did not provide a verified email address." });

            var normalizedEmail = googleUser.Email.Trim().ToLowerInvariant();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (user == null)
            {
                user = new User
                {
                    Email = normalizedEmail,
                    Name = string.IsNullOrWhiteSpace(googleUser.Name) ? normalizedEmail : googleUser.Name,
                    PasswordHash = _authService.HashPassword(Guid.NewGuid().ToString("N")),
                    EmailVerified = true
                };
                _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }

            if (user.IsSuspended)
                return Unauthorized(new { message = "Your account has been suspended. Please contact support." });

            return Ok(new
            {
                token = _authService.GenerateToken(user),
                user = new
                {
                    user.Id, user.Email, user.Name, user.Role, user.Institution,
                    user.EducationLevel, user.Phone, user.ProfilePhotoPath
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == req.Email);

            if (user == null ||
                !_authService.VerifyPassword(req.Password, user.PasswordHash))
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password"
                });
            }

            if (user.IsSuspended)
            {
                return Unauthorized(new
                {
                    message = "Your account has been suspended. Please contact support."
                });
            }

            if (!user.EmailVerified)
            {
                return Unauthorized(new
                {
                    message = "Please verify your email address before logging in."
                });
            }

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

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return BadRequest(new
                {
                    message = "Verification token is required."
                });
            }

            var tokenHash = Convert.ToHexString(
                System.Security.Cryptography.SHA256.HashData(
                    System.Text.Encoding.UTF8.GetBytes(token)
                )
            );

            var verificationToken = await _db.EmailVerificationTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

            if (verificationToken == null)
            {
                return BadRequest(new
                {
                    message = "Invalid verification link."
                });
            }

            if (verificationToken.UsedAt != null)
            {
                return BadRequest(new
                {
                    message = "This verification link has already been used."
                });
            }

            if (verificationToken.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    message = "This verification link has expired."
                });
            }

            verificationToken.User.EmailVerified = true;
            verificationToken.UsedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Email verified successfully. You can now log in."
            });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0"
            );

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

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
        public async Task<IActionResult> UpdateProfile(
            [FromBody] UpdateProfileRequest req)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0"
            );

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

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

            return Ok(new
            {
                message = "Profile updated",
                profile
            });
        }

        [HttpPost("profile/photo")]
        [Authorize]
        public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0"
            );

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided" });

            try
            {
                _authService.DeleteProfilePhoto(user.ProfilePhotoPath);

                var photoPath = await _authService.SaveProfilePhotoAsync(file);

                user.ProfilePhotoPath = photoPath;
                user.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return Ok(new
                {
                    message = "Profile photo updated",
                    profilePhotoPath = photoPath
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("profile/photo")]
        [Authorize]
        public async Task<IActionResult> RemoveProfilePhoto()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0"
            );

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            _authService.DeleteProfilePhoto(user.ProfilePhotoPath);

            user.ProfilePhotoPath = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile photo removed"
            });
        }

        [HttpPut("password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(
            [FromBody] ChangePasswordRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.CurrentPassword) ||
                string.IsNullOrWhiteSpace(req.NewPassword))
            {
                return BadRequest(new
                {
                    message = "Current and new passwords are required"
                });
            }

            if (req.NewPassword.Length < 6)
            {
                return BadRequest(new
                {
                    message = "New password must be at least 6 characters"
                });
            }

            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0"
            );

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (!_authService.VerifyPassword(
                    req.CurrentPassword,
                    user.PasswordHash))
            {
                return BadRequest(new
                {
                    message = "Current password is incorrect"
                });
            }

            user.PasswordHash = _authService.HashPassword(req.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Password changed successfully"
            });
        }

        [HttpDelete("account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0"
            );

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            _db.Messages.RemoveRange(
                _db.Messages.Where(message =>
                    message.SenderId == userId ||
                    message.ReceiverId == userId)
            );

            _db.SavedNotes.RemoveRange(
                _db.SavedNotes.Where(saved =>
                    saved.UserId == userId)
            );

            _db.SavedListings.RemoveRange(
                _db.SavedListings.Where(saved =>
                    saved.UserId == userId)
            );

            _db.SavedPosts.RemoveRange(
                _db.SavedPosts.Where(saved =>
                    saved.UserId == userId)
            );

            _db.NoteRatings.RemoveRange(
                _db.NoteRatings.Where(rating =>
                    rating.UserId == userId)
            );

            _db.NoteComments.RemoveRange(
                _db.NoteComments.Where(comment =>
                    comment.UserId == userId)
            );

            _db.PostUpvotes.RemoveRange(
                _db.PostUpvotes.Where(vote =>
                    vote.UserId == userId)
            );

            _db.PostDownvotes.RemoveRange(
                _db.PostDownvotes.Where(vote =>
                    vote.UserId == userId)
            );

            _db.ReplyUpvotes.RemoveRange(
                _db.ReplyUpvotes.Where(vote =>
                    vote.UserId == userId)
            );

            _db.ReplyDownvotes.RemoveRange(
                _db.ReplyDownvotes.Where(vote =>
                    vote.UserId == userId)
            );

            _db.PostFollows.RemoveRange(
                _db.PostFollows.Where(follow =>
                    follow.UserId == userId)
            );

            _db.PostViews.RemoveRange(
                _db.PostViews.Where(view =>
                    view.UserId == userId)
            );

            _db.NoteViews.RemoveRange(
                _db.NoteViews.Where(view =>
                    view.UserId == userId)
            );

            _db.Users.Remove(user);

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Account deleted successfully"
            });
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

        public class GoogleLoginRequest
        {
            public string IdToken { get; set; } = string.Empty;
        }

        public class ChangePasswordRequest
        {
            public string CurrentPassword { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }
    }
}
