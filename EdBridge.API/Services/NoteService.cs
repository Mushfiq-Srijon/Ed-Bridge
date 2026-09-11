using EdBridge.API.Data;
using EdBridge.API.DTOs;
using EdBridge.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Services
{
    public class NoteService
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public NoteService(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        public async Task<Note> CreateNoteAsync(Note note, List<int> subjectTagIds)
        {
            if (subjectTagIds != null && subjectTagIds.Any())
            {
                foreach (var tagId in subjectTagIds)
                {
                    note.NoteSubjectTags.Add(new NoteSubjectTag { SubjectTagId = tagId });
                }
            }

            _db.Notes.Add(note);
            await _db.SaveChangesAsync();
            return note;
        }

        public async Task<string?> SavePdfAsync(IFormFile file)
        {
            if (file == null || file.Length == 0) return null;

            var ext = Path.GetExtension(file.FileName).ToLower();
            if (ext != ".pdf") throw new InvalidOperationException("Only PDF files are allowed.");
            if (file.Length > 20 * 1024 * 1024) throw new InvalidOperationException("PDF must be under 20MB.");

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "pdfs");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return $"uploads/pdfs/{fileName}";
        }

        public async Task<string?> SaveThumbnailAsync(IFormFile file)
        {
            if (file == null || file.Length == 0) return null;

            var ext = Path.GetExtension(file.FileName).ToLower();
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowed.Contains(ext)) throw new InvalidOperationException("Only JPG, PNG, WEBP images are allowed.");
            if (file.Length > 5 * 1024 * 1024) throw new InvalidOperationException("Image must be under 5MB.");

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "thumbnails");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return $"uploads/thumbnails/{fileName}";
        }

        private NoteDto MapToDto(Note n)
        {
            var ratings = n.Ratings ?? new List<NoteRating>();
            return new NoteDto
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                CourseCode = n.CourseCode,
                ThumbnailPath = n.ThumbnailPath,
                EducationLevel = n.EducationLevel,
                ClassName = n.ClassName,
                Group = n.Group,
                Department = n.Department,
                CourseTitle = n.CourseTitle,
                YearSemester = n.YearSemester,
                ViewCount = n.ViewCount,
                DownloadCount = n.DownloadCount,
                AverageRating = ratings.Any() ? Math.Round(ratings.Average(r => r.Rating), 2) : 0,
                RatingCount = ratings.Count,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                UserId = n.UserId,
                Author = new UserDto { Id = n.Author.Id, Name = n.Author.Name, Email = n.Author.Email },
                Tags = n.NoteSubjectTags.Select(nst => nst.SubjectTag.Name).ToList()
            };
        }

        public async Task<List<NoteDto>> GetAllNotesAsync(int page = 1, int pageSize = 10)
        {
            var notes = await _db.Notes
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(n => n.Author)
                .Include(n => n.NoteSubjectTags).ThenInclude(nst => nst.SubjectTag)
                .Include(n => n.Ratings)
                .ToListAsync();

            return notes.Select(MapToDto).ToList();
        }

        public async Task<NoteDetailDto?> GetNoteByIdAsync(int id, int? viewerUserId = null)
        {
            var note = await _db.Notes
                .Include(n => n.Author)
                .Include(n => n.NoteSubjectTags).ThenInclude(nst => nst.SubjectTag)
                .Include(n => n.Ratings)
                .Include(n => n.Comments).ThenInclude(c => c.Author)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (note == null) return null;

            if (viewerUserId == null || viewerUserId != note.UserId)
            {
                note.ViewCount++;
                await _db.SaveChangesAsync();
            }

            var ratings = note.Ratings ?? new List<NoteRating>();
            int? userRating = viewerUserId.HasValue
                ? ratings.FirstOrDefault(r => r.UserId == viewerUserId.Value)?.Rating
                : null;

            return new NoteDetailDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                CourseCode = note.CourseCode,
                HasPdf = !string.IsNullOrEmpty(note.PdfPath),
                ThumbnailPath = note.ThumbnailPath,
                EducationLevel = note.EducationLevel,
                ClassName = note.ClassName,
                Group = note.Group,
                Department = note.Department,
                CourseTitle = note.CourseTitle,
                YearSemester = note.YearSemester,
                ViewCount = note.ViewCount,
                DownloadCount = note.DownloadCount,
                AverageRating = ratings.Any() ? Math.Round(ratings.Average(r => r.Rating), 2) : 0,
                RatingCount = ratings.Count,
                UserRating = userRating,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                UserId = note.UserId,
                Author = new UserDto { Id = note.Author.Id, Name = note.Author.Name, Email = note.Author.Email },
                Tags = note.NoteSubjectTags.Select(nst => nst.SubjectTag.Name).ToList(),
                Comments = note.Comments.OrderByDescending(c => c.CreatedAt).Select(c => new NoteCommentDto
                {
                    Id = c.Id,
                    CommentText = c.CommentText,
                    CreatedAt = c.CreatedAt,
                    UserId = c.UserId,
                    AuthorName = c.Author?.Name ?? "Unknown"
                }).ToList()
            };
        }

        public async Task<List<NoteDto>> SearchNotesAsync(string query, int page = 1, int pageSize = 10)
        {
            var lower = query.ToLower();
            var notes = await _db.Notes
                .Where(n => n.Title.ToLower().Contains(lower)
                    || n.Content.ToLower().Contains(lower)
                    || n.CourseCode.ToLower().Contains(lower))
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(n => n.Author)
                .Include(n => n.NoteSubjectTags).ThenInclude(nst => nst.SubjectTag)
                .Include(n => n.Ratings)
                .ToListAsync();

            return notes.Select(MapToDto).ToList();
        }

        public async Task<List<NoteDto>> GetNotesBySubjectAsync(int subjectTagId, int page = 1, int pageSize = 10)
        {
            var notes = await _db.Notes
                .Where(n => n.NoteSubjectTags.Any(nst => nst.SubjectTagId == subjectTagId))
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(n => n.Author)
                .Include(n => n.NoteSubjectTags).ThenInclude(nst => nst.SubjectTag)
                .Include(n => n.Ratings)
                .ToListAsync();

            return notes.Select(MapToDto).ToList();
        }

        public async Task<Note?> UpdateNoteAsync(int id, string title, string content, string courseCode)
        {
            var note = await _db.Notes.FindAsync(id);
            if (note == null) return null;

            note.Title = title;
            note.Content = content;
            note.CourseCode = courseCode;
            note.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return note;
        }

        public async Task<bool> DeleteNoteAsync(int id)
        {
            var note = await _db.Notes.FindAsync(id);
            if (note == null) return false;

            _db.Notes.Remove(note);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<(bool success, string path)> DownloadNoteAsync(int id)
        {
            var note = await _db.Notes.FindAsync(id);
            if (note == null) return (false, "");

            note.DownloadCount++;
            await _db.SaveChangesAsync();

            return (true, note.PdfPath ?? "");
        }

        public async Task<bool> IncrementDownloadAsync(int id)
        {
            var note = await _db.Notes.FindAsync(id);
            if (note == null) return false;

            note.DownloadCount++;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<NoteCommentDto?> AddCommentAsync(int noteId, int userId, string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;

            var comment = new NoteComment
            {
                NoteId = noteId,
                UserId = userId,
                CommentText = text.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _db.NoteComments.Add(comment);
            await _db.SaveChangesAsync();

            await _db.Entry(comment).Reference(c => c.Author).LoadAsync();

            return new NoteCommentDto
            {
                Id = comment.Id,
                CommentText = comment.CommentText,
                CreatedAt = comment.CreatedAt,
                UserId = comment.UserId,
                AuthorName = comment.Author?.Name ?? "Unknown"
            };
        }

        public async Task<object> RateNoteAsync(int noteId, int userId, int rating)
        {
            if (rating < 1 || rating > 5) throw new InvalidOperationException("Rating must be between 1 and 5.");

            var existing = await _db.NoteRatings
                .FirstOrDefaultAsync(r => r.NoteId == noteId && r.UserId == userId);

            if (existing != null)
            {
                existing.Rating = rating;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _db.NoteRatings.Add(new NoteRating
                {
                    NoteId = noteId,
                    UserId = userId,
                    Rating = rating,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync();

            var allRatings = await _db.NoteRatings.Where(r => r.NoteId == noteId).ToListAsync();
            return new
            {
                averageRating = Math.Round(allRatings.Average(r => r.Rating), 2),
                ratingCount = allRatings.Count,
                userRating = rating
            };
        }
    }
}