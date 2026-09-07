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

        public NotesController(NoteService noteService, AppDbContext db)
        {
            _noteService = noteService;
            _db = db;
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
            {
                userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            }

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
        public async Task<IActionResult> CreateNote([FromBody] CreateNoteRequest req)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Content))
                return BadRequest(new { message = "Title and content are required" });

            if (string.IsNullOrWhiteSpace(req.CourseCode))
                return BadRequest(new { message = "Course code is required" });

            var subjectName = "General";
if (req.SubjectTagIds != null && req.SubjectTagIds.Any())
{
    var firstSubject = await _db.SubjectTags.FindAsync(req.SubjectTagIds.First());
    if (firstSubject != null)
    {
        subjectName = firstSubject.Name;
    }
}

var note = new Note
{
    Title = req.Title,
    Content = req.Content,
    CourseCode = req.CourseCode,
    Subject = subjectName,
    UserId = userId
};
            var createdNote = await _noteService.CreateNoteAsync(note, req.SubjectTagIds);

            // Reload with author/tags so we can return a proper NoteDto
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

        [HttpPost("{id}/download")]
        public async Task<IActionResult> DownloadNote(int id)
        {
            var success = await _noteService.IncrementDownloadAsync(id);
            if (!success) return NotFound(new { message = "Note not found" });

            return Ok(new { message = "Download counted" });
        }
    }

    public class CreateNoteRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public List<int> SubjectTagIds { get; set; } = new();
    }

    public class UpdateNoteRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
    }
}