namespace EdBridge.API.Models
{
    public class SubjectTag
    {
        public int Id { get; set; }
        public string Name { get; set; } // "Mathematics", "Physics", "Biology"
        
        // Will connect to Listings, Notes, Posts via join tables
        public ICollection<ListingSubjectTag> ListingSubjectTags { get; set; } = new List<ListingSubjectTag>();
        public ICollection<NoteSubjectTag> NoteSubjectTags { get; set; } = new List<NoteSubjectTag>();
        public ICollection<PostSubjectTag> PostSubjectTags { get; set; } = new List<PostSubjectTag>();
    }
}