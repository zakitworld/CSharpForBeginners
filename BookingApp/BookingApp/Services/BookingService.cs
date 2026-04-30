using Microsoft.EntityFrameworkCore;
using BookingApp.Data;
using BookingApp.Models;
using Microsoft.AspNetCore.SignalR;
using BookingApp.Hubs;
using Hangfire;



namespace BookingApp.Services
{
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;
        private readonly IBackgroundJobClient _backgroundJobClient;

        public BookingService(AppDbContext context, IHubContext<BookingHub> hubContext, IBackgroundJobClient backgroundJobClient)
        {
            _context = context;
            _hubContext = hubContext;
            _backgroundJobClient = backgroundJobClient;
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

            // Enqueue background job for email confirmation
            var user = await _context.Users.FindAsync(newBooking.UserId);
            if (user != null)
            {
                _backgroundJobClient.Enqueue<IEmailService>(x => 
                    x.SendEmailAsync(user.Email, "Booking Confirmed", 
                    $"Hello {user.Username}, your booking '{newBooking.Title}' has been confirmed for {newBooking.Date}."));
            }

            // Broadcast to all clients
            await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", newBooking);


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
