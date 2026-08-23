namespace EdBridge.API.Models
{
    public class NoteSubjectTag
    {
        public int NoteId { get; set; }
        public int SubjectTagId { get; set; }
        
        public Note Note { get; set; }
        public SubjectTag SubjectTag { get; set; }
    }
}