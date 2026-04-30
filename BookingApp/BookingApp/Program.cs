using BookingApp.Data;
using BookingApp.Models;
using BookingApp.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BookingApp.Hubs;
using Hangfire;
using Hangfire.Storage.SQLite;
using Serilog;
using BookingApp.Middleware;
using BookingApp.Helpers;
using BookingApp.Validators;
using FluentValidation;

using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.RateLimiting;




var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();


// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSQLiteStorage(builder.Configuration.GetConnectionString("Bookings") ?? "Data Source = Bookings.db"));

builder.Services.AddHangfireServer();
builder.Services.AddAutoMapper(config => config.AddMaps(typeof(AutoMapperProfiles).Assembly));
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateBookingRequestValidator>();

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.Window = TimeSpan.FromSeconds(60);
        opt.PermitLimit = 30; // 30 requests per minute
    });
});




var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "a_very_long_and_secure_secret_key_that_is_at_least_32_characters";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();

    });
});

var connectionString =
    builder.Configuration.GetConnectionString("Bookings")
    ?? "Data Source = Bookings.db";

builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddSqlite<AppDbContext>(connectionString);

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.UseRateLimiter();



using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();

    // Seed Admin user
    if (!context.Users.Any(u => u.Email == "admin@example.com"))
    {
        var admin = new User
        {
            Username = "admin",
            Email = "admin@example.com",
            Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Roles = new[] { "Admin", "User" }
        };
        context.Users.Add(admin);
        context.SaveChanges();
    }
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<BookingHub>("/bookingHub");
app.UseHangfireDashboard();

// Register a recurring job
RecurringJob.AddOrUpdate("Heartbeat", () => Console.WriteLine("Hangfire Heartbeat: Service is running."), Cron.Minutely);


app.Run();
