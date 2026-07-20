'use client'

import * as React from 'react'
import { MessageSquare, Send, Pencil, Trash2, Reply, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ── Spam / content guard ──────────────────────────────────────────────────────
const BLOCKED_PATTERNS = [
  /\b(buy now|click here|free money|make money fast)\b/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
]

function isMalicious(text) {
  return BLOCKED_PATTERNS.some((re) => re.test(text))
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

// ── Single comment ────────────────────────────────────────────────────────────
function CommentItem({ comment, currentUserId, onReply, onEdit, onDelete, depth = 0 }) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editContent, setEditContent] = React.useState(comment.content)
  const [showReplies, setShowReplies] = React.useState(true)
  const [isReplying, setIsReplying] = React.useState(false)
  const [replyContent, setReplyContent] = React.useState('')
  const [replyError, setReplyError] = React.useState('')
  const [editError, setEditError] = React.useState('')

  const isOwner = currentUserId && comment.authorId === currentUserId
  const hasReplies = comment.replies && comment.replies.length > 0
  const maxDepth = 3

  function handleSaveEdit() {
    const trimmed = editContent.trim()
    if (!trimmed) return setEditError('Comment cannot be empty.')
    if (trimmed.length > 2000) return setEditError('Comment must be 2 000 characters or fewer.')
    if (isMalicious(trimmed)) return setEditError('Comment contains disallowed content.')
    setEditError('')
    onEdit(comment.id, trimmed)
    setIsEditing(false)
  }

  function handleSubmitReply() {
    const trimmed = replyContent.trim()
    if (!trimmed) return setReplyError('Reply cannot be empty.')
    if (trimmed.length > 2000) return setReplyError('Reply must be 2 000 characters or fewer.')
    if (isMalicious(trimmed)) return setReplyError('Reply contains disallowed content.')
    setReplyError('')
    onReply(comment.id, trimmed)
    setReplyContent('')
    setIsReplying(false)
  }

  return (
    <div
      className={`flex gap-3 ${depth > 0 ? 'ml-8 pl-4 border-l-2 border-border' : ''}`}
      role="article"
      aria-label={`Comment by ${comment.authorName}`}
    >
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
        <AvatarFallback className="text-xs">{initials(comment.authorName)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{comment.authorName}</span>
          {comment.edited && (
            <Badge variant="outline" className="text-xs py-0">
              edited
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{formatDate(comment.createdAt)}</span>
        </div>

        {/* Body */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              maxLength={2000}
              aria-label="Edit comment"
            />
            {editError && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {editError}
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                  setEditError('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm whitespace-pre-wrap break-words">{comment.content}</p>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1 mt-2">
            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsReplying((v) => !v)}
                aria-label="Reply to comment"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit comment"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => onDelete(comment.id)}
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        )}

        {/* Reply form */}
        {isReplying && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Write a reply…"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              maxLength={2000}
              aria-label="Write a reply"
            />
            {replyError && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {replyError}
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitReply}>
                <Send className="h-3 w-3 mr-1" />
                Post reply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsReplying(false)
                  setReplyContent('')
                  setReplyError('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {hasReplies && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs mb-2"
              onClick={() => setShowReplies((v) => !v)}
              aria-expanded={showReplies}
            >
              {showReplies ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </>
              )}
            </Button>
            {showReplies && (
              <div className="space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main CommentsSection component ────────────────────────────────────────────

/**
 * CommentsSection — off-chain comment thread for idea pages.
 *
 * Props:
 *   ideaId        {string}  The idea the comments belong to.
 *   currentUser   {object}  { id, name, avatar } — null if not logged in.
 *   comments      {array}   Flat or nested comment array (see shape below).
 *   onAddComment  {fn}      (ideaId, content) => Promise<void>
 *   onEditComment {fn}      (commentId, content) => Promise<void>
 *   onDeleteComment {fn}    (commentId) => Promise<void>
 *   onReplyComment  {fn}    (parentId, content) => Promise<void>
 *   isLoading     {bool}
 *
 * Comment shape:
 *   { id, ideaId, authorId, authorName, authorAvatar, content, createdAt, edited, replies: [] }
 */
export function CommentsSection({
  ideaId,
  currentUser,
  comments = [],
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReplyComment,
  isLoading = false,
}) {
  const [newComment, setNewComment] = React.useState('')
  const [submitError, setSubmitError] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = newComment.trim()
    if (!trimmed) return setSubmitError('Comment cannot be empty.')
    if (trimmed.length > 2000) return setSubmitError('Comment must be 2 000 characters or fewer.')
    if (isMalicious(trimmed)) return setSubmitError('Your comment contains disallowed content.')
    setSubmitError('')
    setIsSubmitting(true)
    try {
      await onAddComment?.(ideaId, trimmed)
      setNewComment('')
    } catch {
      setSubmitError('Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEdit(commentId, content) {
    await onEditComment?.(commentId, content)
  }

  async function handleDelete(commentId) {
    await onDeleteComment?.(commentId)
  }

  async function handleReply(parentId, content) {
    await onReplyComment?.(parentId, content)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Comments
          {comments.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {comments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* New comment form */}
        {currentUser ? (
          <form onSubmit={handleSubmit} className="flex gap-3" noValidate>
            <Avatar className="h-8 w-8 shrink-0 mt-1">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="text-xs">{initials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Share your thoughts on this idea…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                maxLength={2000}
                aria-label="New comment"
                disabled={isSubmitting}
              />
              {submitError && (
                <p role="alert" className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {submitError}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{newComment.length} / 2000</span>
                <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
                  <Send className="h-3 w-3 mr-1" />
                  {isSubmitting ? 'Posting…' : 'Post comment'}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Sign in to join the discussion.
          </p>
        )}

        {/* Comment thread */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-10 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          <div className="space-y-6" role="list" aria-label="Comments">
            {comments.map((comment) => (
              <div key={comment.id} role="listitem">
                <CommentItem
                  comment={comment}
                  currentUserId={currentUser?.id}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}