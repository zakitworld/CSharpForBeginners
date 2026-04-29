namespace BookingApp.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Email { get; set; } = string.Empty;

        public List<Booking> Bookings { get; set; } = new();
    }
}
