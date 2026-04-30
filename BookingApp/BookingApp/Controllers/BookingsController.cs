using BookingApp.Models;
using BookingApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookingApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _service;

        public BookingsController(BookingService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            // If user is Admin, they can see all bookings. Otherwise, only their own.
            if (User.IsInRole("Admin"))
            {
                var allBookings = await _service.GetBookingsAsync();
                return Ok(allBookings);
            }
            
            var userBookings = await _service.GetUserBookingsAsync(userId);
            return Ok(userBookings);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Booking booking)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            booking.UserId = userId; // Force the userId to be the authenticated user

            if (booking.Start >= booking.End)
                return BadRequest("Invalid time range");

            var success = await _service.AddBookingAsync(booking);

            if (!success)
                return BadRequest("Booking conflict detected");

            return Ok(booking);
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var bookings = await _service.GetBookingsAsync();
            return Ok(bookings);
        }
    }
}