using BookingApp.Data;
using BookingApp.Hubs;
using BookingApp.Models;
using BookingApp.Services;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace BookingApp.Tests
{
    public class BookingServiceTests
    {
        private readonly Mock<IHubContext<BookingHub>> _mockHubContext;
        private readonly Mock<IBackgroundJobClient> _mockJobClient;
        private readonly AppDbContext _context;

        public BookingServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _mockHubContext = new Mock<IHubContext<BookingHub>>();
            
            // Mock SignalR Clients.All
            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();
            mockClients.Setup(c => c.All).Returns(mockClientProxy.Object);
            _mockHubContext.Setup(h => h.Clients).Returns(mockClients.Object);

            _mockJobClient = new Mock<IBackgroundJobClient>();
        }

        [Fact]
        public async Task AddBookingAsync_ReturnsFalse_WhenOverlapExists()
        {
            // Arrange
            var service = new BookingService(_context, _mockHubContext.Object, _mockJobClient.Object);
            var date = DateOnly.FromDateTime(DateTime.Now);
            
            var existingBooking = new Booking
            {
                Date = date,
                Start = DateTimeOffset.Now.Date.AddHours(10),
                End = DateTimeOffset.Now.Date.AddHours(11)
            };
            _context.Bookings.Add(existingBooking);
            await _context.SaveChangesAsync();

            var overlappingBooking = new Booking
            {
                Date = date,
                Start = DateTimeOffset.Now.Date.AddHours(10.5),
                End = DateTimeOffset.Now.Date.AddHours(11.5)
            };

            // Act
            var result = await service.AddBookingAsync(overlappingBooking);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task AddBookingAsync_ReturnsTrue_WhenNoOverlap()
        {
            // Arrange
            var service = new BookingService(_context, _mockHubContext.Object, _mockJobClient.Object);
            var date = DateOnly.FromDateTime(DateTime.Now);
            
            var newBooking = new Booking
            {
                UserId = Guid.NewGuid(),
                Date = date,
                Start = DateTimeOffset.Now.Date.AddHours(13),
                End = DateTimeOffset.Now.Date.AddHours(14),
                Title = "Test Meeting"
            };

            // Act
            var result = await service.AddBookingAsync(newBooking);

            // Assert
            Assert.True(result);
            Assert.Equal(1, await _context.Bookings.CountAsync());
        }
    }
}
