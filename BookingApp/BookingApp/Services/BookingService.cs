using Microsoft.EntityFrameworkCore;
using BookingApp.Data;
using BookingApp.Models;

namespace BookingApp.Services
{
    public class BookingService
    {
        private readonly AppDbContext _context;

        public BookingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddBookingAsync(Booking newBooking)
        {
            var conflicts = await _context.Bookings
                .Where(b => b.Date == newBooking.Date)
                .ToListAsync();

            foreach (var booking in conflicts)
            {
                bool overlap =
                    newBooking.Start < booking.End &&
                    newBooking.End > booking.Start;

                if (overlap)
                    return false;
            }

            _context.Bookings.Add(newBooking);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<Booking>> GetUserBookingsAsync(Guid userId)
        {
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetBookingsAsync()
        {
            return await _context.Bookings.ToListAsync();
        }
    }
}
