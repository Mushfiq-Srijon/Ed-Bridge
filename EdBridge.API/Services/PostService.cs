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
            return post;
        }

        public async Task<PostDetailDto?> GetPostByIdAsync(int id)
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

            post.ViewCount++;

            await _db.SaveChangesAsync();

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
                    ? new UserDto
                    {
                        Id = 0,
                        Name = "Anonymous",
                        Email = string.Empty
                    }
                    : new UserDto
                    {
                        Id = post.Author.Id,
                        Name = post.Author.Name,
                        Email = post.Author.Email
                    },

                Tags = post.PostSubjectTags
                    .Select(pst => pst.SubjectTag.Name)
                    .ToList(),

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
                        ? new UserDto
                        {
                            Id = 0,
                            Name = "Anonymous",
                            Email = string.Empty
                        }
                            : new UserDto
                            {
                                Id = r.Author.Id,
                                Name = r.Author.Name,
                                Email = r.Author.Email
                            }
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
    }
}