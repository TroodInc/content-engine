'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Topic = {
  id: string
  name: string
  description: string
  article_count: number
  created_at: string
}

const SEED_TOPICS: Topic[] = [
  {
    id: '1',
    name: 'AI in Legal Tech',
    description: 'How artificial intelligence is reshaping legal research, contract review, and litigation strategy.',
    article_count: 12,
    created_at: '2026-03-01',
  },
  {
    id: '2',
    name: 'RAG Pipelines',
    description: 'Retrieval-augmented generation patterns for building accurate, grounded LLM applications.',
    article_count: 7,
    created_at: '2026-03-14',
  },
  {
    id: '3',
    name: 'Content Automation',
    description: 'Workflows and tooling for automating content research, drafting, and publishing at scale.',
    article_count: 18,
    created_at: '2026-02-20',
  },
  {
    id: '4',
    name: 'LLM Fine-tuning',
    description: 'Techniques for adapting foundation models to domain-specific tasks using custom datasets.',
    article_count: 5,
    created_at: '2026-04-02',
  },
  {
    id: '5',
    name: 'Vector Databases',
    description: 'Comparing Pinecone, Weaviate, Qdrant, and pgvector for semantic search and retrieval.',
    article_count: 9,
    created_at: '2026-04-18',
  },
]

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>(SEED_TOPICS)
  const [modalOpen, setModalOpen] = useState(false)

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
            {topics.length} topic clusters · {totalArticles} total articles
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="shrink-0 px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-colors"
        >
          + New Topic
        </button>
      </header>

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
      </div>

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

  // Focus name input on open, close on Escape
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
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal panel */}
      <div className="w-full max-w-md rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h2 className="text-sm font-semibold text-white">New Topic</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Body */}
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
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this topic about?"
              rows={3}
              className="w-full rounded-md bg-[#111111] border border-[#2a2a2a] focus:border-zinc-500 focus:outline-none px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 resize-none transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#2a2a2a]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
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
    <svg
      className="shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors mt-0.5"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
