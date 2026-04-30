namespace BookingApp.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            // Simulate email sending delay
            await Task.Delay(500);
            
            _logger.LogInformation("EMAIL SENT TO: {To}\nSUBJECT: {Subject}\nBODY: {Body}", to, subject, body);
        }
    }
}
