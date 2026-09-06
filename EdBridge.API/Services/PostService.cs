using EdBridge.API.Data;
using EdBridge.API.DTOs;
using EdBridge.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Services
{
    public class PostService
    {
        private readonly AppDbContext _db;

        public PostService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Post> CreatePostAsync(Post post, List<int> subjectTagIds)
        {
            if (subjectTagIds != null && subjectTagIds.Any())
            {
                foreach (var tagId in subjectTagIds)
                {
                    post.PostSubjectTags.Add(new PostSubjectTag { PostId = post.Id, SubjectTagId = tagId });
                }
            }

            _db.Posts.Add(post);
            await _db.SaveChangesAsync();

            // Reload the post with author included
            await _db.Entry(post).Reference(p => p.Author).LoadAsync();

            return post;
        }

        public async Task<PostDetailDto?> GetPostByIdAsync(int id, int? currentUserId = null)
        {
            var post = await _db.Posts
                .Include(p => p.Author)
                .Include(p => p.PostSubjectTags)
                    .ThenInclude(pst => pst.SubjectTag)
                .Include(p => p.Replies)
                    .ThenInclude(r => r.Author)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
                return null;

            // Only increment view count if:
            // 1. User is viewing someone else's post
            // 2. User hasn't viewed this post before
            if (currentUserId.HasValue && currentUserId.Value != post.UserId)
            {
                var existingView = await _db.PostViews
                    .FirstOrDefaultAsync(pv => pv.PostId == id && pv.UserId == currentUserId.Value);

                if (existingView == null)
                {
                    post.ViewCount++;
                    _db.PostViews.Add(new PostView
                    {
                        PostId = id,
                        UserId = currentUserId.Value,
                        ViewedAt = DateTime.UtcNow
                    });
                    await _db.SaveChangesAsync();
                }
            }

            return new PostDetailDto
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                IsAnonymous = post.IsAnonymous,
                ViewCount = post.ViewCount,
                UpvoteCount = post.UpvoteCount,
                DownvoteCount = post.DownvoteCount,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                UserId = post.UserId,
                Author = post.IsAnonymous
                    ? new UserDto { Id = 0, Name = "Anonymous", Email = string.Empty }
                    : new UserDto { Id = post.Author.Id, Name = post.Author.Name, Email = post.Author.Email },
                Tags = post.PostSubjectTags.Select(pst => pst.SubjectTag.Name).ToList(),
                Replies = post.Replies
                    .OrderBy(r => r.CreatedAt)
                    .Select(r => new ReplyDto
                    {
                        Id = r.Id,
                        Content = r.Content,
                        IsAnonymous = r.IsAnonymous,
                        IsBestAnswer = r.IsBestAnswer,
                        UpvoteCount = r.UpvoteCount,
                        DownvoteCount = r.DownvoteCount,
                        CreatedAt = r.CreatedAt,
                        Author = r.IsAnonymous
                            ? new UserDto { Id = 0, Name = "Anonymous", Email = string.Empty }
                            : new UserDto { Id = r.Author.Id, Name = r.Author.Name, Email = r.Author.Email }
                    })
                    .ToList()
            };
        }

        public async Task<Post?> UpdatePostAsync(int id, string title, string content)
        {
            var post = await _db.Posts.FindAsync(id);
            if (post == null)
                return null;

            post.Title = title;
            post.Content = content;
            post.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return post;
        }

        public async Task<List<PostDto>> GetAllPostsAsync(int page = 1, int pageSize = 10)
        {
            var posts = await _db.Posts
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(p => p.Author)
                .Include(p => p.PostSubjectTags)
                    .ThenInclude(pst => pst.SubjectTag)
                .ToListAsync();

            return posts.Select(p => new PostDto
            {
                Id = p.Id,
                Title = p.Title,
                Content = p.Content,
                IsAnonymous = p.IsAnonymous,
                ViewCount = p.ViewCount,
                UpvoteCount = p.UpvoteCount,
                DownvoteCount = p.DownvoteCount,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                UserId = p.UserId,
                Author = new UserDto { Id = p.Author.Id, Name = p.Author.Name, Email = p.Author.Email },
                Tags = p.PostSubjectTags.Select(pst => pst.SubjectTag.Name).ToList()
            }).ToList();
        }

        public async Task<List<PostDto>> SearchPostsAsync(string query, int page = 1, int pageSize = 10)
        {
            var lower = query.ToLower();
            var posts = await _db.Posts
                .Where(p => p.Title.ToLower().Contains(lower) || p.Content.ToLower().Contains(lower))
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(p => p.Author)
                .Include(p => p.PostSubjectTags)
                    .ThenInclude(pst => pst.SubjectTag)
                .ToListAsync();

            return posts.Select(p => new PostDto
            {
                Id = p.Id,
                Title = p.Title,
                Content = p.Content,
                IsAnonymous = p.IsAnonymous,
                ViewCount = p.ViewCount,
                UpvoteCount = p.UpvoteCount,
                DownvoteCount = p.DownvoteCount,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                UserId = p.UserId,
                Author = new UserDto { Id = p.Author.Id, Name = p.Author.Name, Email = p.Author.Email },
                Tags = p.PostSubjectTags.Select(pst => pst.SubjectTag.Name).ToList()
            }).ToList();
        }

        public async Task<List<Post>> GetPostsBySubjectAsync(int subjectTagId, int page = 1, int pageSize = 10)
        {
            return await _db.Posts
                .Where(p => p.PostSubjectTags.Any(pst => pst.SubjectTagId == subjectTagId))
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(p => p.Author)
                .ToListAsync();
        }

        public async Task<bool> UpvotePostAsync(int postId, int userId)
        {
            var post = await _db.Posts.FindAsync(postId);
            if (post == null) return false; // Post doesn't exist

            var existing = await _db.PostUpvotes
                .FirstOrDefaultAsync(pu => pu.PostId == postId && pu.UserId == userId);

            if (existing != null) return false; // Already upvoted

            // If user had downvoted, remove that downvote first (can't have both)
            var existingDownvote = await _db.PostDownvotes
                .FirstOrDefaultAsync(pd => pd.PostId == postId && pd.UserId == userId);

            if (existingDownvote != null)
            {
                _db.PostDownvotes.Remove(existingDownvote);
                if (post.DownvoteCount > 0) post.DownvoteCount--;
            }

            var upvote = new PostUpvote { PostId = postId, UserId = userId };
            _db.PostUpvotes.Add(upvote);

            post.UpvoteCount++;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            var post = await _db.Posts.FindAsync(id);
            if (post == null) return false;

            _db.Posts.Remove(post);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<Reply> AddReplyAsync(Reply reply)
        {
            _db.Replies.Add(reply);
            await _db.SaveChangesAsync();
            return reply;
        }

        public async Task<bool> RemoveUpvoteAsync(int postId, int userId)
        {
            var upvote = await _db.PostUpvotes
                .FirstOrDefaultAsync(pu => pu.PostId == postId && pu.UserId == userId);

            if (upvote == null) return false;

            _db.PostUpvotes.Remove(upvote);

            var post = await _db.Posts.FindAsync(postId);
            if (post.UpvoteCount > 0) post.UpvoteCount--;

            await _db.SaveChangesAsync();
            return true;
        }


        public async Task<bool> DownvotePostAsync(int postId, int userId)
        {
            var post = await _db.Posts.FindAsync(postId);
            if (post == null) return false;

            var existingDownvote = await _db.PostDownvotes
                .FirstOrDefaultAsync(pd => pd.PostId == postId && pd.UserId == userId);

            if (existingDownvote != null) return false; // Already downvoted

            // If user had upvoted, remove that upvote first (can't have both)
            var existingUpvote = await _db.PostUpvotes
                .FirstOrDefaultAsync(pu => pu.PostId == postId && pu.UserId == userId);

            if (existingUpvote != null)
            {
                _db.PostUpvotes.Remove(existingUpvote);
                if (post.UpvoteCount > 0) post.UpvoteCount--;
            }

            var downvote = new PostDownvote { PostId = postId, UserId = userId };
            _db.PostDownvotes.Add(downvote);

            post.DownvoteCount++;
            await _db.SaveChangesAsync();
            return true;
        }



        public async Task<bool> RemoveDownvoteAsync(int postId, int userId)
        {
            var downvote = await _db.PostDownvotes
                .FirstOrDefaultAsync(pd => pd.PostId == postId && pd.UserId == userId);

            if (downvote == null) return false;

            _db.PostDownvotes.Remove(downvote);

            var post = await _db.Posts.FindAsync(postId);
            if (post.DownvoteCount > 0) post.DownvoteCount--;

            await _db.SaveChangesAsync();
            return true;
        }
        public async Task<bool> FollowPostAsync(int postId, int userId)
        {
            var existing = await _db.PostFollows
                .FirstOrDefaultAsync(pf => pf.PostId == postId && pf.UserId == userId);

            if (existing != null) return false;

            var follow = new PostFollow { PostId = postId, UserId = userId };
            _db.PostFollows.Add(follow);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnfollowPostAsync(int postId, int userId)
        {
            var follow = await _db.PostFollows
                .FirstOrDefaultAsync(pf => pf.PostId == postId && pf.UserId == userId);

            if (follow == null) return false;

            _db.PostFollows.Remove(follow);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpvoteReplyAsync(int replyId, int userId)
        {
            var reply = await _db.Replies.FindAsync(replyId);
            if (reply == null) return false;

            var existing = await _db.ReplyUpvotes
                .FirstOrDefaultAsync(ru => ru.ReplyId == replyId && ru.UserId == userId);

            if (existing != null) return false; // Already upvoted

            // If user had downvoted, remove that downvote first
            var existingDownvote = await _db.ReplyDownvotes
                .FirstOrDefaultAsync(rd => rd.ReplyId == replyId && rd.UserId == userId);

            if (existingDownvote != null)
            {
                _db.ReplyDownvotes.Remove(existingDownvote);
                if (reply.DownvoteCount > 0) reply.DownvoteCount--;
            }

            var upvote = new ReplyUpvote { ReplyId = replyId, UserId = userId };
            _db.ReplyUpvotes.Add(upvote);
            reply.UpvoteCount++;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveReplyUpvoteAsync(int replyId, int userId)
        {
            var upvote = await _db.ReplyUpvotes
                .FirstOrDefaultAsync(ru => ru.ReplyId == replyId && ru.UserId == userId);

            if (upvote == null) return false;

            _db.ReplyUpvotes.Remove(upvote);

            var reply = await _db.Replies.FindAsync(replyId);
            if (reply != null && reply.UpvoteCount > 0) reply.UpvoteCount--;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DownvoteReplyAsync(int replyId, int userId)
        {
            var reply = await _db.Replies.FindAsync(replyId);
            if (reply == null) return false;

            var existingDownvote = await _db.ReplyDownvotes
                .FirstOrDefaultAsync(rd => rd.ReplyId == replyId && rd.UserId == userId);

            if (existingDownvote != null) return false; // Already downvoted

            // If user had upvoted, remove that upvote first
            var existingUpvote = await _db.ReplyUpvotes
                .FirstOrDefaultAsync(ru => ru.ReplyId == replyId && ru.UserId == userId);

            if (existingUpvote != null)
            {
                _db.ReplyUpvotes.Remove(existingUpvote);
                if (reply.UpvoteCount > 0) reply.UpvoteCount--;
            }

            var downvote = new ReplyDownvote { ReplyId = replyId, UserId = userId };
            _db.ReplyDownvotes.Add(downvote);
            reply.DownvoteCount++;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveReplyDownvoteAsync(int replyId, int userId)
        {
            var downvote = await _db.ReplyDownvotes
                .FirstOrDefaultAsync(rd => rd.ReplyId == replyId && rd.UserId == userId);

            if (downvote == null) return false;

            _db.ReplyDownvotes.Remove(downvote);

            var reply = await _db.Replies.FindAsync(replyId);
            if (reply != null && reply.DownvoteCount > 0) reply.DownvoteCount--;

            await _db.SaveChangesAsync();
            return true;
        }
    }
}