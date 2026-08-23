using Microsoft.EntityFrameworkCore;
using EdBridge.API.Models;

namespace EdBridge.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        // Define all tables
        public DbSet<User> Users { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SubjectTag> SubjectTags { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Report> Reports { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure many-to-many primary keys
            modelBuilder.Entity<ListingSubjectTag>()
                .HasKey(lst => new { lst.ListingId, lst.SubjectTagId });
            
            modelBuilder.Entity<NoteSubjectTag>()
                .HasKey(nst => new { nst.NoteId, nst.SubjectTagId });
            
            modelBuilder.Entity<PostSubjectTag>()
                .HasKey(pst => new { pst.PostId, pst.SubjectTagId });
            
            // Create indexes for faster searching
            modelBuilder.Entity<Listing>()
                .HasIndex(l => l.Status);
            
            modelBuilder.Entity<Listing>()
                .HasIndex(l => l.CreatedAt);
            
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}