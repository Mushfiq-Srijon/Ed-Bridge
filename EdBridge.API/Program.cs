using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EdBridge.API.Data;
using EdBridge.API.Services;
using EdBridge.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Keep local API diagnostics on the console. The Windows EventLog provider
// can be unavailable for non-elevated development processes and may turn a
// normal request exception into a second logging failure.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MariaDbServerVersion(new Version(10, 4, 0))
    )
);

// Register AuthService
builder.Services.AddScoped<AuthService>();

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "EdBridge";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "EdBridgeUsers";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true
        };
    });

// Add CORS (for React frontend on localhost:3000)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<PostService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<ListingService>();
builder.Services.AddScoped<NoteService>();
builder.Services.AddScoped<AdminService>();
// File upload size limit (50MB)
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52428800;
});
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Redirect only when the current host is actually listening on HTTPS. This
// keeps the documented local HTTP profile usable while preserving HTTPS
// redirection for deployments that expose an HTTPS endpoint.
if (app.Urls.Any(url => url.StartsWith("https://", StringComparison.OrdinalIgnoreCase)))
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowReact");
app.UseAuthentication();
app.UseMiddleware<SuspensionCheckMiddleware>();
app.UseAuthorization();
// Serve uploaded files
app.UseStaticFiles();
app.MapControllers();

app.Run();
