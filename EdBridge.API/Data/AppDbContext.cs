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
        public DbSet<SavedNote> SavedNotes { get; set; }
        public DbSet<NoteView> NoteViews { get; set; }
        public DbSet<SavedListing> SavedListings { get; set; }
        public DbSet<SavedPost> SavedPosts { get; set; }
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

    // Vote tables were created with a composite key. The legacy Id column is
    // retained for schema compatibility, but it is not the entity identity.
    // Keeping these keys aligned prevents EF from deleting every legacy vote
    // whose unused Id value is 0 when a user changes their vote.
    modelBuilder.Entity<PostUpvote>()
        .HasKey(x => new { x.PostId, x.UserId });

    modelBuilder.Entity<PostDownvote>()
        .HasKey(x => new { x.PostId, x.UserId });

    modelBuilder.Entity<ReplyUpvote>()
        .HasKey(x => new { x.ReplyId, x.UserId });

    modelBuilder.Entity<NoteView>()
        .HasKey(x => new { x.NoteId, x.UserId });

    modelBuilder.Entity<NoteView>()
        .HasOne(x => x.Note)
        .WithMany(x => x.Views)
        .HasForeignKey(x => x.NoteId)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<NoteView>()
        .HasOne(x => x.User)
        .WithMany()
        .HasForeignKey(x => x.UserId)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<ReplyDownvote>()
        .HasKey(x => new { x.ReplyId, x.UserId });

        modelBuilder.Entity<SavedNote>()
    .HasOne(x => x.User)
    .WithMany(x => x.SavedNotes)
    .HasForeignKey(x => x.UserId)
    .OnDelete(DeleteBehavior.Cascade);

modelBuilder.Entity<SavedNote>()
    .HasOne(x => x.Note)
    .WithMany(x => x.SavedByUsers)
    .HasForeignKey(x => x.NoteId)
    .OnDelete(DeleteBehavior.Cascade);

modelBuilder.Entity<SavedNote>()
    .HasIndex(x => new { x.UserId, x.NoteId })
    .IsUnique();

    modelBuilder.Entity<SavedListing>()
        .HasOne(x => x.User).WithMany(x => x.SavedListings)
        .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    modelBuilder.Entity<SavedListing>()
        .HasOne(x => x.Listing).WithMany(x => x.SavedByUsers)
        .HasForeignKey(x => x.ListingId).OnDelete(DeleteBehavior.Cascade);
    modelBuilder.Entity<SavedListing>()
        .HasIndex(x => new { x.UserId, x.ListingId }).IsUnique();

    modelBuilder.Entity<SavedPost>()
        .HasOne(x => x.User).WithMany(x => x.SavedPosts)
        .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    modelBuilder.Entity<SavedPost>()
        .HasOne(x => x.Post).WithMany(x => x.SavedByUsers)
        .HasForeignKey(x => x.PostId).OnDelete(DeleteBehavior.Cascade);
    modelBuilder.Entity<SavedPost>()
        .HasIndex(x => new { x.UserId, x.PostId }).IsUnique();
}
    }
}
