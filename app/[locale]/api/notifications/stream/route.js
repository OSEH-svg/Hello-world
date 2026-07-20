export const dynamic = "force-dynamic"

// Sample activity used to simulate votes/replies arriving in real time.
// In a production build this would be replaced by events published from
// the actual vote/comment mutations (e.g. via a message queue or DB trigger).
const SAMPLE_EVENTS = [
  {
    type: "vote",
    ideaId: 1,
    actor: "CryptoTrader",
    message: "voted on your idea \"Bitcoin Institutional Adoption\"",
  },
  {
    type: "reply",
    ideaId: 2,
    actor: "DeFiDeveloper",
    message: "replied to your comment on \"Ethereum Merge Impact\"",
  },
  {
    type: "vote",
    ideaId: 3,
    actor: "TechAnalyst",
    message: "voted on your idea \"Layer 2 Scaling Solutions\"",
  },
  {
    type: "reply",
    ideaId: 1,
    actor: "BTCMaximalist",
    message: "replied to your comment on \"Bitcoin Institutional Adoption\"",
  },
]

function buildNotification() {
  const sample = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)]
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: sample.type,
    ideaId: sample.ideaId,
    actor: sample.actor,
    message: sample.message,
    read: false,
    createdAt: new Date().toISOString(),
  }
}

// Server-Sent Events endpoint used to push notifications to the client in
// real time. SSE was chosen over a raw WebSocket because Next.js route
// handlers run on serverless/edge runtimes that don't expose a persistent
// TCP socket to upgrade — SSE gives us a real push channel (no polling)
// without a custom server.
export async function GET(request) {
  const encoder = new TextEncoder()
  const intervalMs = 15000

  let interval
  const stream = new ReadableStream({
    start(controller) {
      const send = (payload) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      }

      // Send one notification immediately so the panel has content on load.
      send(buildNotification())

      interval = setInterval(() => {
        send(buildNotification())
      }, intervalMs)
    },
    cancel() {
      clearInterval(interval)
    },
  })

  request.signal.addEventListener("abort", () => {
    clearInterval(interval)
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
