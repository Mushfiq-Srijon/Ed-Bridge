using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EdBridge.API.Models;
using EdBridge.API.Services;
using EdBridge.API.Data;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly NoteService _noteService;
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public NotesController(NoteService noteService, AppDbContext db, IWebHostEnvironment env)
        {
            _noteService = noteService;
            _db = db;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllNotes([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var notes = await _noteService.GetAllNotesAsync(page, pageSize);
            return Ok(notes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetNote(int id)
        {
            int? userId = null;
            if (User.Identity != null && User.Identity.IsAuthenticated)
                userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var note = await _noteService.GetNoteByIdAsync(id, userId);
            if (note == null) return NotFound(new { message = "Note not found" });
            return Ok(note);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchNotes([FromQuery] string query, [FromQuery] int page = 1)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query cannot be empty" });

            var notes = await _noteService.SearchNotesAsync(query, page);
            return Ok(notes);
        }

        [HttpGet("subject/{subjectId}")]
        public async Task<IActionResult> GetBySubject(int subjectId, [FromQuery] int page = 1)
        {
            var notes = await _noteService.GetNotesBySubjectAsync(subjectId, page);
            return Ok(notes);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateNote([FromForm] CreateNoteRequest req)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Content))
                return BadRequest(new { message = "Title and content are required" });

            if (string.IsNullOrWhiteSpace(req.CourseCode))
                return BadRequest(new { message = "Course code is required" });

            if (string.IsNullOrWhiteSpace(req.EducationLevel))
                return BadRequest(new { message = "Education level is required" });

            // Validate education-level-specific fields
            if (req.EducationLevel == "School" || req.EducationLevel == "College")
            {
                if (string.IsNullOrWhiteSpace(req.ClassName))
                    return BadRequest(new { message = "Class is required" });
            }

            if (req.EducationLevel == "University")
            {
                if (string.IsNullOrWhiteSpace(req.Department))
                    return BadRequest(new { message = "Department is required" });
                if (string.IsNullOrWhiteSpace(req.CourseTitle))
                    return BadRequest(new { message = "Course title is required" });
                if (string.IsNullOrWhiteSpace(req.YearSemester))
                    return BadRequest(new { message = "Year/Semester is required" });
            }

            // Handle file uploads
            string? pdfPath = null;
            string? thumbnailPath = null;

            try
            {
                if (req.PdfFile != null)
                    pdfPath = await _noteService.SavePdfAsync(req.PdfFile);

                if (req.ThumbnailFile != null)
                    thumbnailPath = await _noteService.SaveThumbnailAsync(req.ThumbnailFile);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            var subjectName = "General";
            if (req.SubjectTagIds != null && req.SubjectTagIds.Any())
            {
                var firstSubject = await _db.SubjectTags.FindAsync(req.SubjectTagIds.First());
                if (firstSubject != null) subjectName = firstSubject.Name;
            }

            var note = new Note
            {
                Title = req.Title,
                Content = req.Content,
                CourseCode = req.CourseCode,
                Subject = subjectName,
                PdfPath = pdfPath,
                ThumbnailPath = thumbnailPath,
                EducationLevel = req.EducationLevel,
                ClassName = req.ClassName,
                Group = req.Group,
                Department = req.Department,
                CourseTitle = req.CourseTitle,
                YearSemester = req.YearSemester,
                UserId = userId
            };

            var createdNote = await _noteService.CreateNoteAsync(note, req.SubjectTagIds ?? new List<int>());
            var noteDto = await _noteService.GetNoteByIdAsync(createdNote.Id, userId);

            return Ok(new { message = "Note created", noteId = createdNote.Id, note = noteDto });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] UpdateNoteRequest req)
        {
            var note = await _db.Notes.FindAsync(id);
            if (note == null) return NotFound(new { message = "Note not found" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (note.UserId != userId && User.FindFirst(ClaimTypes.Role)?.Value != "Admin")
                return Forbid();

            var updated = await _noteService.UpdateNoteAsync(id, req.Title, req.Content, req.CourseCode);
            return Ok(new { message = "Note updated", note = updated });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var note = await _db.Notes.FindAsync(id);
            if (note == null) return NotFound(new { message = "Note not found" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (note.UserId != userId && User.FindFirst(ClaimTypes.Role)?.Value != "Admin")
                return Forbid();

            await _noteService.DeleteNoteAsync(id);
            return Ok(new { message = "Note deleted" });
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadNote(int id)
        {
            var note = await _db.Notes.FindAsync(id);
            if (note == null) return NotFound(new { message = "Note not found" });

            if (string.IsNullOrEmpty(note.PdfPath))
            {
                // No PDF — just increment count
                await _noteService.IncrementDownloadAsync(id);
                return Ok(new { message = "No PDF available", downloadCount = note.DownloadCount + 1 });
            }

            var filePath = Path.Combine(_env.WebRootPath ?? "wwwroot", note.PdfPath.Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (!System.IO.File.Exists(filePath))
                return NotFound(new { message = "PDF file not found on server" });

            await _noteService.IncrementDownloadAsync(id);

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var fileName = $"{note.Title.Replace(" ", "_")}.pdf";
            return File(fileBytes, "application/pdf", fileName);
        }

        [HttpPost("{id}/comment")]
        [Authorize]
        public async Task<IActionResult> AddComment(int id, [FromBody] AddCommentRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.CommentText))
                return BadRequest(new { message = "Comment cannot be empty" });

            var note = await _db.Notes.FindAsync(id);
            if (note == null) return NotFound(new { message = "Note not found" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var comment = await _noteService.AddCommentAsync(id, userId, req.CommentText);

            return Ok(new { message = "Comment added", comment });
        }

        [HttpPost("{id}/rate")]
        [Authorize]
        public async Task<IActionResult> RateNote(int id, [FromBody] RateNoteRequest req)
        {
            if (req.Rating < 1 || req.Rating > 5)
                return BadRequest(new { message = "Rating must be between 1 and 5" });

            var note = await _db.Notes.FindAsync(id);
            if (note == null) return NotFound(new { message = "Note not found" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            try
            {
                var result = await _noteService.RateNoteAsync(id, userId, req.Rating);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/report")]
        [Authorize]
        public async Task<IActionResult> ReportNote(int id, [FromBody] ReportNoteRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Reason))
                return BadRequest(new { message = "Reason is required" });

            var note = await _db.Notes.FindAsync(id);
            if (note == null) return NotFound(new { message = "Note not found" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (note.UserId == userId)
                return BadRequest(new { message = "You cannot report your own note" });

            var alreadyReported = await _db.Reports.AnyAsync(r =>
                r.ReporterId == userId &&
                r.ReportType == "Note" &&
                r.NoteId == id);

            if (alreadyReported)
                return BadRequest(new { message = "You have already reported this note" });

            _db.Reports.Add(new Report
            {
                ReporterId = userId,
                ReportType = "Note",
                NoteId = id,
                Reason = req.Reason,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            return Ok(new { message = "Report submitted" });
        }
    }

    public class CreateNoteRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string? EducationLevel { get; set; }
        public string? ClassName { get; set; }
        public string? Group { get; set; }
        public string? Department { get; set; }
        public string? CourseTitle { get; set; }
        public string? YearSemester { get; set; }
        public List<int>? SubjectTagIds { get; set; }
        public IFormFile? PdfFile { get; set; }
        public IFormFile? ThumbnailFile { get; set; }
    }

    public class UpdateNoteRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
    }

    public class AddCommentRequest
    {
        public string CommentText { get; set; } = string.Empty;
    }

    public class RateNoteRequest
    {
        public int Rating { get; set; }
    }

    public class ReportNoteRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}