"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, Vote, MessageSquare, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/contexts/notification-context"
import { cn } from "@/lib/utils"

function timeAgo(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function NotificationIcon({ type }) {
  if (type === "vote") return <Vote className="h-4 w-4 text-primary" />
  return <MessageSquare className="h-4 w-4 text-primary" />
}

export function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false)
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-[1.2rem] w-[1.2rem]" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1.5 -right-1.5 h-5 min-w-5 justify-center rounded-full px-1 text-[10px] leading-none"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">
          {unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        </span>
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Check className="h-3 w-3" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b px-4 py-3 text-left text-sm last:border-b-0 hover:bg-muted/50",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn(!notification.read && "font-medium")}>
                      <span className="font-semibold">{notification.actor}</span>{" "}
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
                  </div>
                  {!notification.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
