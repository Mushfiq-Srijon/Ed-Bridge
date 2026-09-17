using System.Security.Claims;
using EdBridge.API.Data;

namespace EdBridge.API.Middleware
{
    public class SuspensionCheckMiddleware
    {
        private readonly RequestDelegate _next;

        public SuspensionCheckMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, AppDbContext db)
        {
            // Check if request is for a protected route (has authorization header)
            if (context.User.Identity?.IsAuthenticated ?? false)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (int.TryParse(userIdClaim, out var userId))
                {
                    var user = await db.Users.FindAsync(userId);
                    
                    if (user != null && user.IsSuspended)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new 
                        { 
                            message = "Your account has been suspended. You cannot access this resource." 
                        });
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}