using BookingApp.Models;
using BookingApp.Services;
using BookingApp.DTOs;
using AutoMapper;
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
        private readonly IBookingService _service;
        private readonly IMapper _mapper;

        public BookingsController(IBookingService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
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
                return Ok(_mapper.Map<List<BookingDto>>(allBookings));
            }
            
            var userBookings = await _service.GetUserBookingsAsync(userId);
            return Ok(_mapper.Map<List<BookingDto>>(userBookings));
        }


        [HttpPost]
        public async Task<IActionResult> Create(CreateBookingRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var booking = _mapper.Map<Booking>(request);
            booking.UserId = userId;

            if (booking.Start >= booking.End)
                return BadRequest("Invalid time range");

            var success = await _service.AddBookingAsync(booking);

            if (!success)
                return BadRequest("Booking conflict detected");

            return Ok(_mapper.Map<BookingDto>(booking));
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