namespace EdBridge.API.Models
{
    public class PostSubjectTag
    {
        public int PostId { get; set; }
        public int SubjectTagId { get; set; }
        
        public Post Post { get; set; }
        public SubjectTag SubjectTag { get; set; }
    }
}