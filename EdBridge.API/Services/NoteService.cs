using EdBridge.API.Data;
using EdBridge.API.DTOs;
using EdBridge.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Services
{
    public class NoteService
    {
        private readonly AppDbContext _db;

        public NoteService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Note> CreateNoteAsync(Note note, List<int> subjectTagIds)
        {
            if (subjectTagIds != null && subjectTagIds.Any())
            {
                foreach (var tagId in subjectTagIds)
                {
                    note.NoteSubjectTags.Add(new NoteSubjectTag { NoteId = note.Id, SubjectTagId = tagId });
                }
            }

            _db.Notes.Add(note);
            await _db.SaveChangesAsync();
            return note;
        }

        public async Task<List<NoteDto>> GetAllNotesAsync(int page = 1, int pageSize = 10)
        {
            var notes = await _db.Notes
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(n => n.Author)
                .Include(n => n.NoteSubjectTags)
                    .ThenInclude(nst => nst.SubjectTag)
                .ToListAsync();

            return notes.Select(n => new NoteDto
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                CourseCode = n.CourseCode,
                ViewCount = n.ViewCount,
                DownloadCount = n.DownloadCount,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                UserId = n.UserId,
                Author = new UserDto { Id = n.Author.Id, Name = n.Author.Name, Email = n.Author.Email },
                Tags = n.NoteSubjectTags.Select(nst => nst.SubjectTag.Name).ToList()
            }).ToList();
        }

        public async Task<NoteDetailDto?> GetNoteByIdAsync(int id, int? viewerUserId = null)
        {
            var note = await _db.Notes
                .Include(n => n.Author)
                .Include(n => n.NoteSubjectTags)
                    .ThenInclude(nst => nst.SubjectTag)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (note == null)
                return null;

            // Don't count the owner's own views
            if (viewerUserId == null || viewerUserId != note.UserId)
            {
                note.ViewCount++;
                await _db.SaveChangesAsync();
            }

            return new NoteDetailDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                CourseCode = note.CourseCode,
                ViewCount = note.ViewCount,
                DownloadCount = note.DownloadCount,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                UserId = note.UserId,
                Author = new UserDto { Id = note.Author.Id, Name = note.Author.Name, Email = note.Author.Email },
                Tags = note.NoteSubjectTags.Select(nst => nst.SubjectTag.Name).ToList()
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
                .Include(n => n.NoteSubjectTags)
                    .ThenInclude(nst => nst.SubjectTag)
                .ToListAsync();

            return notes.Select(n => new NoteDto
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                CourseCode = n.CourseCode,
                ViewCount = n.ViewCount,
                DownloadCount = n.DownloadCount,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                UserId = n.UserId,
                Author = new UserDto { Id = n.Author.Id, Name = n.Author.Name, Email = n.Author.Email },
                Tags = n.NoteSubjectTags.Select(nst => nst.SubjectTag.Name).ToList()
            }).ToList();
        }

        public async Task<List<NoteDto>> GetNotesBySubjectAsync(int subjectTagId, int page = 1, int pageSize = 10)
        {
            var notes = await _db.Notes
                .Where(n => n.NoteSubjectTags.Any(nst => nst.SubjectTagId == subjectTagId))
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(n => n.Author)
                .Include(n => n.NoteSubjectTags)
                    .ThenInclude(nst => nst.SubjectTag)
                .ToListAsync();

            return notes.Select(n => new NoteDto
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                CourseCode = n.CourseCode,
                ViewCount = n.ViewCount,
                DownloadCount = n.DownloadCount,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                UserId = n.UserId,
                Author = new UserDto { Id = n.Author.Id, Name = n.Author.Name, Email = n.Author.Email },
                Tags = n.NoteSubjectTags.Select(nst => nst.SubjectTag.Name).ToList()
            }).ToList();
        }

        public async Task<Note?> UpdateNoteAsync(int id, string title, string content, string courseCode)
        {
            var note = await _db.Notes.FindAsync(id);
            if (note == null)
                return null;

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

        public async Task<bool> IncrementDownloadAsync(int id)
        {
            var note = await _db.Notes.FindAsync(id);
            if (note == null) return false;

            note.DownloadCount++;
            await _db.SaveChangesAsync();
            return true;
        }
    }
}