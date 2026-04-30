using Microsoft.AspNetCore.SignalR;

namespace BookingApp.Hubs
{
    public class BookingHub : Hub
    {
        // Hub methods can be empty if we only use it for server-to-client broadcasts
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
