using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace BookingApp.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                var response = _env.IsDevelopment()
                    ? new ProblemDetails
                    {
                        Status = context.Response.StatusCode,
                        Title = ex.Message,
                        Detail = ex.StackTrace?.ToString(),
                        Instance = context.Request.Path
                    }
                    : new ProblemDetails
                    {
                        Status = context.Response.StatusCode,
                        Title = "Internal Server Error",
                        Detail = "An unexpected error occurred. Please try again later.",
                        Instance = context.Request.Path
                    };

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var json = JsonSerializer.Serialize(response, options);

                await context.Response.WriteAsync(json);
            }
        }
    }
}
