export const transformReply = (reply) => ({
  id: reply.id,

  content: reply.content,

  author: reply.isAnonymous
    ? null
    : reply.author || null,

  isAnonymous: reply.isAnonymous,

  upvotes: reply.upvoteCount || reply.upvotes || 0,

  downvotes: reply.downvoteCount || reply.downvotes || 0,

  createdAt: reply.createdAt,

  isMarkedBest: reply.isBestAnswer || false,

  userHasUpvoted: false,
  userHasDownvoted: false,
});


export const transformPost = (post) => ({
  id: post.id,

  title: post.title,

  content: post.content,

  author: post.isAnonymous
    ? null
    : post.author || null,

  isAnonymous: post.isAnonymous,

  // Backend currently returns Tags as a list of names
  tags: post.tags || [],

  // Temporary subject value.
  // We will improve this when SubjectTag API is added.
  subject: post.tags?.[0] || 'General',

  views: post.viewCount || post.views || 0,

  upvotes: post.upvoteCount || post.upvotes || 0,

  downvotes: post.downvoteCount || post.downvotes || 0,

  createdAt: post.createdAt,

  updatedAt: post.updatedAt,

  replies: (post.replies || []).map(transformReply),

  userHasUpvoted: false,
  userHasDownvoted: false,

  userIsFollowing: false,

  followers: post.followers || 0,
});