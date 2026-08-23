using Microsoft.AspNetCore.Mvc;
using EdBridge.API.Models;
using EdBridge.API.Services;
using EdBridge.API.Data;
using Microsoft.EntityFrameworkCore;

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
            
            var token = _authService.GenerateToken(user);
            return Ok(new { token, user = new { user.Id, user.Email, user.Name, user.Role } });
        }
    }
    
    public class RegisterRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
    }
    
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}