using Microsoft.EntityFrameworkCore;
using CatGifApi.Models;

namespace CatGifApi.Data
{
    public class CatGifDbContext : DbContext
    {
        public CatGifDbContext(DbContextOptions<CatGifDbContext> options)
            : base(options)
        {
        }

        public DbSet<CatFact> CatFacts { get; set; }
        public DbSet<Gif> Gifs { get; set; }
    }
}