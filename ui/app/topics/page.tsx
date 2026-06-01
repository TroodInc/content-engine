'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getTopics, isApiError, type Topic } from '@/lib/api'

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getTopics().then((result) => {
      if (isApiError(result)) {
        setError(result.message)
      } else {
        setTopics(result)
      }
      setLoading(false)
    })
  }, [])

  function addTopic(name: string, description: string) {
    const next: Topic = {
      id: String(Date.now()),
      name,
      description,
      article_count: 0,
      created_at: new Date().toISOString().slice(0, 10),
    }
    setTopics((prev) => [next, ...prev])
  }

  const totalArticles = topics.reduce((n, t) => n + t.article_count, 0)

  return (
    <div className="max-w-3xl">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Topics</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {loading ? 'Loading…' : `${topics.length} topic clusters · ${totalArticles} total articles`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="shrink-0 px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-colors"
        >
          + New Topic
        </button>
      </header>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-900/30 border border-red-800 text-sm text-red-400">
          Could not load topics: {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] px-5 py-4 animate-pulse">
              <div className="h-4 w-48 rounded bg-zinc-700 mb-2" />
              <div className="h-3 w-full rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/topics/${topic.id}`} className="block group">
              <div className="rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] px-5 py-4 group-hover:border-zinc-500 group-hover:bg-zinc-800/80 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                        {topic.name}
                      </h2>
                      <ArticleBadge count={topic.article_count} />
                    </div>
                    <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                  <ChevronIcon />
                </div>
                <p className="mt-3 text-xs text-zinc-600">
                  Created {formatDate(topic.created_at)}
                </p>
              </div>
            </Link>
          ))}

          {!loading && topics.length === 0 && !error && (
            <p className="text-sm text-zinc-600 py-8 text-center">
              No topics yet. Run Analyze to discover topics from your Telegram channel.
            </p>
          )}
        </div>
      )}

      {modalOpen && (
        <NewTopicModal
          onClose={() => setModalOpen(false)}
          onCreate={(name, description) => {
            addTopic(name, description)
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function NewTopicModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (name: string, description: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleCreate() {
    const trimmedName = name.trim()
    if (!trimmedName) return
    onCreate(trimmedName, description.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h2 className="text-sm font-semibold text-white">New Topic</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Topic name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
              placeholder="e.g. Prompt Engineering"
              className="w-full rounded-md bg-[#111111] border border-[#2a2a2a] focus:border-zinc-500 focus:outline-none px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this topic about?"
              rows={3}
              className="w-full rounded-md bg-[#111111] border border-[#2a2a2a] focus:border-zinc-500 focus:outline-none px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 resize-none transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#2a2a2a]">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

function ArticleBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 text-xs font-medium">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1.5 2h7M1.5 5h7M1.5 8h4" strokeLinecap="round" />
      </svg>
      {count}
    </span>
  )
}

function ChevronIcon() {
  return (
    <svg className="shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
