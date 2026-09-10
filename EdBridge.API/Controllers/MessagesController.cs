using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EdBridge.API.Services;
using EdBridge.API.DTOs;
using EdBridge.API.Data;
using System.Security.Claims;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly MessageService _messageService;
        private readonly AppDbContext _db;

        public MessagesController(MessageService messageService, AppDbContext db)
        {
            _messageService = messageService;
            _db = db;
        }

        [HttpGet("listing/{listingId}")]
        public async Task<IActionResult> GetListingMessages(int listingId, [FromQuery] int page = 1)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var messages = await _messageService.GetMessagesForListingAsync(listingId, userId, page);
            return Ok(messages);
        }

        [HttpPost("listing/{listingId}")]
        public async Task<IActionResult> SendMessage(int listingId, [FromBody] SendMessageRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Content))
                return BadRequest(new { message = "Message content is required" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            try
            {
                var messageDto = await _messageService.SendMessageAsync(listingId, userId, req.ReceiverId, req.Content);
                return Ok(new { message = "Message sent", data = messageDto });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var conversations = await _messageService.GetConversationsAsync(userId);
            return Ok(conversations);
        }
    }
}