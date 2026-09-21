export const transformReply = (reply) => ({
  id: reply.id,

  content: reply.content,

  author: reply.isAnonymous
    ? null
    : reply.author || null,

  authorId: reply.userId,

  isAnonymous: reply.isAnonymous,

  upvotes: reply.upvoteCount || reply.upvotes || 0,

  downvotes: reply.downvoteCount || reply.downvotes || 0,

  createdAt: reply.createdAt,

  isMarkedBest: reply.isBestAnswer || false,

  userHasUpvoted: Boolean(reply.userHasUpvoted ?? reply.UserHasUpvoted),
  userHasDownvoted: Boolean(reply.userHasDownvoted ?? reply.UserHasDownvoted),
});


export const transformPost = (post) => ({
  id: post.id,

  title: post.title,

  content: post.content,

  author: post.isAnonymous
    ? null
    : post.author || null,

  authorId: post.userId,

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

  userHasUpvoted: Boolean(post.userHasUpvoted ?? post.UserHasUpvoted),
  userHasDownvoted: Boolean(post.userHasDownvoted ?? post.UserHasDownvoted),

  userHasSaved: Boolean(post.userHasSaved ?? post.UserHasSaved),

  userIsFollowing: false,

  followers: post.followers || 0,
});
