import { NextResponse } from 'next/server'

/**
 * In-memory store for demo purposes.
 * Replace with a real database (e.g. Prisma, Supabase, MongoDB) in production.
 */
const store = new Map()

const BLOCKED_PATTERNS = [
  /\b(buy now|click here|free money|make money fast)\b/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
]

function isMalicious(text) {
  return BLOCKED_PATTERNS.some((re) => re.test(text))
}

// ── GET /api/ideas/[id]/comments ─────────────────────────────────────────────
export async function GET(_req, { params }) {
  const { id } = params
  const comments = store.get(id) ?? []
  return NextResponse.json({ comments })
}

// ── POST /api/ideas/[id]/comments ────────────────────────────────────────────
export async function POST(req, { params }) {
  const { id } = params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { content, authorId, authorName, authorAvatar, parentId } = body

  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'content is required.' }, { status: 400 })
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'content must be 2 000 characters or fewer.' }, { status: 400 })
  }
  if (isMalicious(content)) {
    return NextResponse.json({ error: 'Comment contains disallowed content.' }, { status: 422 })
  }
  if (!authorId) {
    return NextResponse.json({ error: 'authorId is required.' }, { status: 401 })
  }

  const newComment = {
    id: crypto.randomUUID(),
    ideaId: id,
    parentId: parentId ?? null,
    authorId,
    authorName: authorName ?? 'Anonymous',
    authorAvatar: authorAvatar ?? null,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    edited: false,
    replies: [],
  }

  const comments = store.get(id) ?? []

  if (parentId) {
    // Append as nested reply
    function addToTree(list) {
      return list.map((c) => {
        if (c.id === parentId) return { ...c, replies: [...c.replies, newComment] }
        return { ...c, replies: addToTree(c.replies) }
      })
    }
    store.set(id, addToTree(comments))
  } else {
    store.set(id, [...comments, newComment])
  }

  return NextResponse.json({ comment: newComment }, { status: 201 })
}

// ── PATCH /api/ideas/[id]/comments ───────────────────────────────────────────
export async function PATCH(req, { params }) {
  const { id } = params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { commentId, content, requesterId } = body

  if (!commentId || !content || !requesterId) {
    return NextResponse.json({ error: 'commentId, content and requesterId are required.' }, { status: 400 })
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'content must be 2 000 characters or fewer.' }, { status: 400 })
  }
  if (isMalicious(content)) {
    return NextResponse.json({ error: 'Comment contains disallowed content.' }, { status: 422 })
  }

  const comments = store.get(id) ?? []
  let found = false

  function updateInTree(list) {
    return list.map((c) => {
      if (c.id === commentId) {
        if (c.authorId !== requesterId) {
          throw new Error('forbidden')
        }
        found = true
        return { ...c, content: content.trim(), edited: true }
      }
      return { ...c, replies: updateInTree(c.replies) }
    })
  }

  let updated
  try {
    updated = updateInTree(comments)
  } catch (e) {
    if (e.message === 'forbidden') {
      return NextResponse.json({ error: 'You can only edit your own comments.' }, { status: 403 })
    }
    throw e
  }

  if (!found) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
  }

  store.set(id, updated)
  return NextResponse.json({ success: true })
}

// ── DELETE /api/ideas/[id]/comments ─────────────────────────────────────────
export async function DELETE(req, { params }) {
  const { id } = params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { commentId, requesterId } = body

  if (!commentId || !requesterId) {
    return NextResponse.json({ error: 'commentId and requesterId are required.' }, { status: 400 })
  }

  const comments = store.get(id) ?? []
  let found = false

  function removeFromTree(list) {
    return list
      .filter((c) => {
        if (c.id === commentId) {
          if (c.authorId !== requesterId) throw new Error('forbidden')
          found = true
          return false
        }
        return true
      })
      .map((c) => ({ ...c, replies: removeFromTree(c.replies) }))
  }

  let updated
  try {
    updated = removeFromTree(comments)
  } catch (e) {
    if (e.message === 'forbidden') {
      return NextResponse.json({ error: 'You can only delete your own comments.' }, { status: 403 })
    }
    throw e
  }

  if (!found) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
  }

  store.set(id, updated)
  return NextResponse.json({ success: true })
}