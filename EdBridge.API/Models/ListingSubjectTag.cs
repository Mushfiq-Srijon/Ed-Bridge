namespace EdBridge.API.Models
{
    public class ListingSubjectTag
    {
        public int ListingId { get; set; }
        public int SubjectTagId { get; set; }
        
        public Listing Listing { get; set; }
        public SubjectTag SubjectTag { get; set; }
    }
}