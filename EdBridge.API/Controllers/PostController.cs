using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EdBridge.API.Models;
using EdBridge.API.Services;
using EdBridge.API.Data;
using System.Security.Claims;
using EdBridge.API.DTOs;

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

            // Load related data
            await _db.Entry(createdPost).Reference(p => p.Author).LoadAsync();
            await _db.Entry(createdPost).Collection(p => p.PostSubjectTags).LoadAsync();
            foreach (var pst in createdPost.PostSubjectTags)
            {
                await _db.Entry(pst).Reference(pt => pt.SubjectTag).LoadAsync();
            }

            var postDto = new PostDto
            {
                Id = createdPost.Id,
                Title = createdPost.Title,
                Content = createdPost.Content,
                IsAnonymous = createdPost.IsAnonymous,
                ViewCount = createdPost.ViewCount,
                UpvoteCount = createdPost.UpvoteCount,
                DownvoteCount = createdPost.DownvoteCount,
                CreatedAt = createdPost.CreatedAt,
                UpdatedAt = createdPost.UpdatedAt,
                UserId = createdPost.UserId,
                Author = createdPost.Author != null
                    ? new UserDto { Id = createdPost.Author.Id, Name = createdPost.Author.Name, Email = createdPost.Author.Email }
                    : new UserDto(),
                Tags = createdPost.PostSubjectTags.Select(pst => pst.SubjectTag.Name).ToList()
            };

            return Ok(new { message = "Post created", postId = createdPost.Id, post = postDto });
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

        [HttpPost("{id}/downvote")]
        [Authorize]
        public async Task<IActionResult> DownvotePost(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.DownvotePostAsync(id, userId);

            if (!success)
                return BadRequest(new { message = "Already downvoted or post not found" });

            return Ok(new { message = "Post downvoted" });
        }

        [HttpDelete("{id}/downvote")]
        [Authorize]
        public async Task<IActionResult> RemoveDownvote(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.RemoveDownvoteAsync(id, userId);

            if (!success)
                return BadRequest(new { message = "Downvote not found" });

            return Ok(new { message = "Downvote removed" });
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

        [HttpPost("{postId}/replies/{replyId}/upvote")]
        [Authorize]
        public async Task<IActionResult> UpvoteReply(int postId, int replyId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.UpvoteReplyAsync(replyId, userId);

            if (!success)
                return BadRequest(new { message = "Already upvoted or reply not found" });

            return Ok(new { message = "Reply upvoted" });
        }

        [HttpDelete("{postId}/replies/{replyId}/upvote")]
        [Authorize]
        public async Task<IActionResult> RemoveReplyUpvote(int postId, int replyId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.RemoveReplyUpvoteAsync(replyId, userId);

            if (!success)
                return BadRequest(new { message = "Upvote not found" });

            return Ok(new { message = "Reply upvote removed" });
        }

        [HttpPost("{postId}/replies/{replyId}/downvote")]
        [Authorize]
        public async Task<IActionResult> DownvoteReply(int postId, int replyId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.DownvoteReplyAsync(replyId, userId);

            if (!success)
                return BadRequest(new { message = "Already downvoted or reply not found" });

            return Ok(new { message = "Reply downvoted" });
        }

        [HttpDelete("{postId}/replies/{replyId}/downvote")]
        [Authorize]
        public async Task<IActionResult> RemoveReplyDownvote(int postId, int replyId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _postService.RemoveReplyDownvoteAsync(replyId, userId);

            if (!success)
                return BadRequest(new { message = "Downvote not found" });

            return Ok(new { message = "Reply downvote removed" });
        }

        [HttpPost("{id}/report")]
        [Authorize]
        public async Task<IActionResult> ReportPost(int id, [FromBody] ReportRequest req)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var post = await _db.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found" });

            // Cannot report own post
            if (post.UserId == userId)
                return BadRequest(new { message = "You cannot report your own post" });

            var report = new Report
            {
                Reason = req.Reason,
                ReportType = "Post",
                Status = "Pending",
                ReporterId = userId,
                PostId = id,
                CreatedAt = DateTime.UtcNow
            };

            _db.Reports.Add(report);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Post reported successfully", reportId = report.Id });
        }

        [HttpPost("{postId}/replies/{replyId}/report")]
        [Authorize]
        public async Task<IActionResult> ReportReply(int postId, int replyId, [FromBody] ReportRequest req)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var reply = await _db.Replies.FindAsync(replyId);
            if (reply == null) return NotFound(new { message = "Reply not found" });

            // Cannot report own reply
            if (reply.UserId == userId)
                return BadRequest(new { message = "You cannot report your own reply" });

            var report = new Report
            {
                Reason = req.Reason,
                ReportType = "Reply",
                Status = "Pending",
                ReporterId = userId,
                ReplyId = replyId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Reports.Add(report);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Reply reported successfully", reportId = report.Id });
        }

        [HttpGet("subjects")]
        public async Task<IActionResult> GetAllSubjects()
        {
            var subjects = await _db.SubjectTags.ToListAsync();
            return Ok(subjects.Select(s => new { id = s.Id, name = s.Name }).ToList());
        }

        [HttpPost("seed-subjects")]
        public async Task<IActionResult> SeedSubjects()
        {
            var subjectNames = new[] { "Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Economics", "Computer Science", "Psychology", "Sociology" };

            foreach (var name in subjectNames)
            {
                var exists = await _db.SubjectTags.AnyAsync(s => s.Name == name);
                if (!exists)
                {
                    _db.SubjectTags.Add(new SubjectTag { Name = name });
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Subjects seeded successfully" });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPost(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? userId = userIdClaim != null ? int.Parse(userIdClaim) : null;

            var post = await _postService.GetPostByIdAsync(id, userId);
            if (post == null) return NotFound(new { message = "Post not found" });
            return Ok(post);
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

    public class ReportRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}