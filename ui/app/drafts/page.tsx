'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getDrafts, isApiError, type Draft } from '@/lib/api'

type DraftStatus = Draft['status']

const STATUS_STYLES: Record<DraftStatus, { dot: string; label: string; classes: string }> = {
  draft:     { dot: 'bg-amber-400',   label: 'Draft',     classes: 'bg-amber-900/40 text-amber-400' },
  ready:     { dot: 'bg-emerald-400', label: 'Ready',     classes: 'bg-emerald-900/40 text-emerald-400' },
  published: { dot: 'bg-zinc-500',    label: 'Published', classes: 'bg-zinc-700 text-zinc-400' },
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDrafts().then((result) => {
      if (isApiError(result)) {
        setError(result.message)
      } else {
        setDrafts(result)
      }
      setLoading(false)
    })
  }, [])

  const counts = drafts.reduce(
    (acc, d) => ({ ...acc, [d.status]: (acc[d.status] ?? 0) + 1 }),
    {} as Record<DraftStatus, number>,
  )

  return (
    <div className="max-w-3xl">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Drafts</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {loading
              ? 'Loading…'
              : `${counts.ready ?? 0} ready · ${counts.draft ?? 0} in progress · ${counts.published ?? 0} published`}
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-900/30 border border-red-800 text-sm text-red-400">
          Could not load drafts: {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-4 py-4 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] animate-pulse">
              <div className="h-4 w-64 rounded bg-zinc-700 mb-2" />
              <div className="h-3 w-32 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map((draft) => (
            <Link key={draft.id} href={`/drafts/${draft.id}`} className="block group">
              <div className="flex items-center justify-between gap-4 px-4 py-4 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] group-hover:border-zinc-500 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors truncate">
                    {draft.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{draft.topic_name}</p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <StatusBadge status={draft.status} />
                  <span className="text-xs text-zinc-600 tabular-nums">{formatDate(draft.created_at)}</span>
                </div>
              </div>
            </Link>
          ))}

          {!loading && drafts.length === 0 && !error && (
            <p className="text-sm text-zinc-600 py-8 text-center">
              No drafts yet. Run Write to generate articles from your content plan.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: DraftStatus }) {
  const { dot, label, classes } = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
