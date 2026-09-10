namespace EdBridge.API.DTOs
{
    public class MessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public int ListingId { get; set; }
        public string ListingTitle { get; set; } = string.Empty;
    }

    public class SendMessageRequest
    {
        public string Content { get; set; } = string.Empty;
        public int ReceiverId { get; set; }
    }
}