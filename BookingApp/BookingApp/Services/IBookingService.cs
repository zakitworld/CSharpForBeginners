using BookingApp.Models;

namespace BookingApp.Services
{
    public interface IBookingService
    {
        Task<bool> AddBookingAsync(Booking newBooking);
        Task<List<Booking>> GetUserBookingsAsync(Guid userId);
        Task<List<Booking>> GetBookingsAsync();
    }
}
