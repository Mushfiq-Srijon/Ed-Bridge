using Microsoft.EntityFrameworkCore;
using EdBridge.API.Models;

namespace EdBridge.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SubjectTag> SubjectTags { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<NoteComment> NoteComments { get; set; }
        public DbSet<NoteRating> NoteRatings { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Reply> Replies { get; set; }
        public DbSet<PostUpvote> PostUpvotes { get; set; }
        public DbSet<PostDownvote> PostDownvotes { get; set; }
        public DbSet<ReplyDownvote> ReplyDownvotes { get; set; }
        public DbSet<ReplyUpvote> ReplyUpvotes { get; set; }
        public DbSet<PostFollow> PostFollows { get; set; }
        public DbSet<PostView> PostViews { get; set; }
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<ListingSubjectTag>()
        .HasKey(x => new { x.ListingId, x.SubjectTagId });

    modelBuilder.Entity<NoteSubjectTag>()
        .HasKey(x => new { x.NoteId, x.SubjectTagId });

    modelBuilder.Entity<PostSubjectTag>()
        .HasKey(x => new { x.PostId, x.SubjectTagId });

    modelBuilder.Entity<PostView>()
        .HasKey(x => new { x.PostId, x.UserId });

    modelBuilder.Entity<ReplyDownvote>()
        .HasKey(x => new { x.ReplyId, x.UserId });
}
    }
}