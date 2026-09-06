using System.ComponentModel.DataAnnotations.Schema;

namespace EdBridge.API.Models
{
    public class ReplyDownvote
    {
        public int ReplyId { get; set; }
        [ForeignKey("ReplyId")]
        public Reply Reply { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}