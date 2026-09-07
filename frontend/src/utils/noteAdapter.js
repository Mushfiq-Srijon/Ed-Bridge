export const transformNote = (note) => ({
  id: note.id,

  title: note.title,

  content: note.content,

  courseCode: note.courseCode,

  author: note.author || null,

  authorId: note.userId,

  // Backend returns Tags as a list of subject names; we use the first one as "subject"
  tags: note.tags || [],

  subject: note.tags?.[0] || 'General',

  views: note.viewCount || 0,

  downloads: note.downloadCount || 0,

  createdAt: note.createdAt,

  updatedAt: note.updatedAt,
});