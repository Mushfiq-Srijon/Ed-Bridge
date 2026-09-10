using EdBridge.API.Data;
using EdBridge.API.DTOs;
using EdBridge.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Services
{
    public class MessageService
    {
        private readonly AppDbContext _db;

        public MessageService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<MessageDto>> GetMessagesForListingAsync(int listingId, int userId, int page = 1, int pageSize = 50)
        {
            var messages = await _db.Messages
                .Where(m => m.ListingId == listingId && (m.SenderId == userId || m.ReceiverId == userId))
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return messages.Select(m => new MessageDto
            {
                Id = m.Id,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                SenderId = m.SenderId,
                SenderName = m.Sender.Name,
                ReceiverId = m.ReceiverId,
                ReceiverName = m.Receiver.Name,
                ListingId = m.ListingId,
                ListingTitle = m.Listing?.Title ?? ""
            }).ToList();
        }

        public async Task<MessageDto> SendMessageAsync(int listingId, int senderId, int receiverId, string content)
        {
            var listing = await _db.Listings.FindAsync(listingId);
            if (listing == null) throw new Exception("Listing not found");

            // Cannot message yourself
            if (senderId == receiverId) throw new Exception("Cannot message yourself");

            // A listing conversation may only involve its owner and the other participant.
            if (senderId != listing.UserId && receiverId != listing.UserId)
                throw new Exception("You are not a participant in this listing conversation");

            var receiverExists = await _db.Users.AnyAsync(u => u.Id == receiverId);
            if (!receiverExists)
                throw new Exception("Receiver not found");

            var message = new Message
            {
                Content = content,
                ListingId = listingId,
                SenderId = senderId,
                ReceiverId = receiverId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Messages.Add(message);
            await _db.SaveChangesAsync();

            // Reload with navigation properties
            await _db.Entry(message).Reference(m => m.Sender).LoadAsync();
            await _db.Entry(message).Reference(m => m.Receiver).LoadAsync();

            return new MessageDto
            {
                Id = message.Id,
                Content = message.Content,
                CreatedAt = message.CreatedAt,
                SenderId = message.SenderId,
                SenderName = message.Sender.Name,
                ReceiverId = message.ReceiverId,
                ReceiverName = message.Receiver.Name,
                ListingId = message.ListingId,
                ListingTitle = listing.Title
            };
        }

        public async Task<List<MessageDto>> GetConversationsAsync(int userId)
        {
            var messages = await _db.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Listing)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            // DistinctBy is not translated by all EF Core providers, so perform
            // the already-ordered conversation reduction in memory.
            var conversations = messages
                .DistinctBy(m => new
                {
                    m.ListingId,
                    OtherId = m.SenderId == userId ? m.ReceiverId : m.SenderId
                })
                .Take(50);

            return conversations.Select(m => new MessageDto
            {
                Id = m.Id,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                SenderId = m.SenderId,
                SenderName = m.Sender.Name,
                ReceiverId = m.ReceiverId,
                ReceiverName = m.Receiver.Name,
                ListingId = m.ListingId,
                ListingTitle = m.Listing?.Title ?? ""
            }).ToList();
        }
    }
}