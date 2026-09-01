using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EdBridge.API.Models;
using EdBridge.API.Services;
using EdBridge.API.Data;
using System.Security.Claims;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly PostService _postService;
        private readonly AppDbContext _db;
        
        public PostsController(PostService postService, AppDbContext db)
        {
            _postService = postService;
            _db = db;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAllPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var posts = await _postService.GetAllPostsAsync(page, pageSize);
            return Ok(posts);
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _postService.GetPostByIdAsync(id);
            if (post == null) return NotFound(new { message = "Post not found" });
            return Ok(post);
        }
        
        [HttpGet("search")]
        public async Task<IActionResult> SearchPosts([FromQuery] string query, [FromQuery] int page = 1)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query cannot be empty" });
            
            var posts = await _postService.SearchPostsAsync(query, page);
            return Ok(posts);
        }
        
        [HttpGet("subject/{subjectId}")]
        public async Task<IActionResult> GetBySubject(int subjectId, [FromQuery] int page = 1)
        {
            var posts = await _postService.GetPostsBySubjectAsync(subjectId, page);
            return Ok(posts);
        }
        
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest req)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Content))
                return BadRequest(new { message = "Title and content are required" });
            
            var post = new Post
            {
                Title = req.Title,
                Content = req.Content,
                IsAnonymous = req.IsAnonymous,
                UserId = userId
            };
            
            var createdPost = await _postService.CreatePostAsync(post, req.SubjectTagIds);
            return Ok(new { message = "Post created", postId = createdPost.Id, post = createdPost });
        }
        
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdatePostRequest req)
        {
            var post = await _db.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found" });
            
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (post.UserId != userId && User.FindFirst(ClaimTypes.Role)?.Value != "Admin")
                return Forbid();
            
            var updated = await _postService.UpdatePostAsync(id, req.Title, req.Content);
            return Ok(new { message = "Post updated", post = updated });
        }
        
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _db.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found" });
            
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (post.UserId != userId && User.FindFirst(ClaimTypes.Role)?.Value != "Admin")
                return Forbid();
            
            await _postService.DeletePostAsync(id);
            return Ok(new { message = "Post deleted" });
        }
        
        [HttpPost("{id}/replies")]
        [Authorize]
        public async Task<IActionResult> AddReply(int id, [FromBody] AddReplyRequest req)
        {
            var post = await _db.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found" });
            
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var reply = new Reply
            {
                Content = req.Content,
                IsAnonymous = req.IsAnonymous,
                PostId = id,
                UserId = userId
            };
            
            var created = await _postService.AddReplyAsync(reply);
            return Ok(new { message = "Reply added", replyId = created.Id });
        }
        
        [HttpPost("{id}/upvote")]
        [Authorize]
        public async Task<IActionResult> UpvotePost(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.UpvotePostAsync(id, userId);
            
            if (!success)
                return BadRequest(new { message = "Already upvoted or post not found" });
            
            return Ok(new { message = "Post upvoted" });
        }
        
        [HttpDelete("{id}/upvote")]
        [Authorize]
        public async Task<IActionResult> RemoveUpvote(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.RemoveUpvoteAsync(id, userId);
            
            if (!success)
                return BadRequest(new { message = "Upvote not found" });
            
            return Ok(new { message = "Upvote removed" });
        }
        
        [HttpPost("{id}/follow")]
        [Authorize]
        public async Task<IActionResult> FollowPost(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.FollowPostAsync(id, userId);
            
            if (!success)
                return BadRequest(new { message = "Already following or post not found" });
            
            return Ok(new { message = "Post followed" });
        }
        
        [HttpDelete("{id}/follow")]
        [Authorize]
        public async Task<IActionResult> UnfollowPost(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.UnfollowPostAsync(id, userId);
            
            if (!success)
                return BadRequest(new { message = "Not following" });
            
            return Ok(new { message = "Post unfollowed" });
        }
    }
    
    public class CreatePostRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsAnonymous { get; set; }
        public List<int> SubjectTagIds { get; set; } = new();
    }
    
    public class UpdatePostRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
    
    public class AddReplyRequest
    {
        public string Content { get; set; } = string.Empty;
        public bool IsAnonymous { get; set; }
    }
}