using BookingApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        var bookings = await _service.GetBookingsAsync();
        return Ok(bookings);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Booking booking)
    {
        if (booking.Start >= booking.End)
            return BadRequest("Invalid time range");

        var success = await _service.AddBookingAsync(booking);

        if (!success)
            return BadRequest("Booking conflict detected");

        return Ok(booking);
    }
}