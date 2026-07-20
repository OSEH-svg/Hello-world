'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * useComments — manages off-chain comment state for an idea page.
 *
 * In production wire the fetch/mutate calls to your API routes.
 * Currently uses localStorage for demo purposes.
 */
export function useComments(ideaId) {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ideaId) return
    setIsLoading(true)
    setError(null)

    // Replace with: fetch(`/api/ideas/${ideaId}/comments`)
    try {
      const stored = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem(`comments:${ideaId}`) || '[]')
        : []
      setComments(stored)
    } catch {
      setError('Failed to load comments.')
    } finally {
      setIsLoading(false)
    }
  }, [ideaId])

  const persist = useCallback((updated) => {
    setComments(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`comments:${ideaId}`, JSON.stringify(updated))
    }
  }, [ideaId])

  // ── Add ─────────────────────────────────────────────────────────────────────
  const addComment = useCallback(async (id, content, currentUser) => {
    const newComment = {
      id: crypto.randomUUID(),
      ideaId: id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar ?? null,
      content,
      createdAt: new Date().toISOString(),
      edited: false,
      replies: [],
    }
    persist([...comments, newComment])
  }, [comments, persist])

  // ── Edit ────────────────────────────────────────────────────────────────────
  const editComment = useCallback(async (commentId, content) => {
    function updateInTree(list) {
      return list.map((c) => {
        if (c.id === commentId) return { ...c, content, edited: true }
        return { ...c, replies: updateInTree(c.replies ?? []) }
      })
    }
    persist(updateInTree(comments))
  }, [comments, persist])

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteComment = useCallback(async (commentId) => {
    function removeFromTree(list) {
      return list
        .filter((c) => c.id !== commentId)
        .map((c) => ({ ...c, replies: removeFromTree(c.replies ?? []) }))
    }
    persist(removeFromTree(comments))
  }, [comments, persist])

  // ── Reply ───────────────────────────────────────────────────────────────────
  const replyComment = useCallback(async (parentId, content, currentUser) => {
    const newReply = {
      id: crypto.randomUUID(),
      ideaId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar ?? null,
      content,
      createdAt: new Date().toISOString(),
      edited: false,
      replies: [],
    }
    function addToTree(list) {
      return list.map((c) => {
        if (c.id === parentId) return { ...c, replies: [...(c.replies ?? []), newReply] }
        return { ...c, replies: addToTree(c.replies ?? []) }
      })
    }
    persist(addToTree(comments))
  }, [comments, ideaId, persist])

  return { comments, isLoading, error, addComment, editComment, deleteComment, replyComment }
}