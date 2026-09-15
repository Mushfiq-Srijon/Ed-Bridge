using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using EdBridge.API.Models;
using EdBridge.API.Data;

namespace EdBridge.API.Services
{
    public class AuthService
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public AuthService(IConfiguration config, AppDbContext db, IWebHostEnvironment env)
        {
            _config = config;
            _db = db;
            _env = env;
        }

        public string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        public bool VerifyPassword(string password, string hash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput.Equals(hash);
        }

        public string GenerateToken(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured.");
            var jwtIssuer = _config["Jwt:Issuer"] ?? "EdBridge";
            var jwtAudience = _config["Jwt:Audience"] ?? "EdBridgeUsers";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<System.Security.Claims.Claim>
{
    new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id.ToString()),
    new System.Security.Claims.Claim("email", user.Email),
    new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role)
};

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<string?> SaveProfilePhotoAsync(IFormFile file)
        {
            if (file == null || file.Length == 0) return null;

            var ext = Path.GetExtension(file.FileName).ToLower();
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowed.Contains(ext))
                throw new InvalidOperationException("Only JPG, PNG, WEBP images are allowed.");

            if (file.Length > 5 * 1024 * 1024)
                throw new InvalidOperationException("Image must be under 5MB.");

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "profile-photos");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return $"uploads/profile-photos/{fileName}";
        }

        public void DeleteProfilePhoto(string? photoPath)
        {
            if (string.IsNullOrEmpty(photoPath)) return;

            var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", photoPath.Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
        }
    }
}