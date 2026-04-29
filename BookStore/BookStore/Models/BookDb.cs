using Microsoft.EntityFrameworkCore;

namespace BookStore.Models
{
    public class BookDb : DbContext
    {
        public BookDb(DbContextOptions options) : base(options) {
        }

        public DbSet<Book> Books { get; set; } = null!;
        
    }
}
