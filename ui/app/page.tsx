'use client'

import { useState, useEffect } from 'react'
import { getTopics, getDrafts, isApiError, type Topic, type Draft } from '@/lib/api'

type PipelineState = {
  topics: Topic[]
  drafts: Draft[]
  lastRun: string | null
  loading: boolean
}

export default function DashboardPage() {
  const [state, setState] = useState<PipelineState>({ topics: [], drafts: [], lastRun: null, loading: true })

  useEffect(() => {
    Promise.all([getTopics(), getDrafts()]).then(([topicsResult, draftsResult]) => {
      setState({
        topics: isApiError(topicsResult) ? [] : topicsResult,
        drafts: isApiError(draftsResult) ? [] : draftsResult,
        lastRun: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        loading: false,
      })
    })
  }, [])

  const { topics, drafts, lastRun, loading } = state

  const totalArticles = topics.reduce((n, t) => n + t.article_count, 0)
  const readyDrafts = drafts.filter((d) => d.status === 'ready').length
  const publishedDrafts = drafts.filter((d) => d.status === 'published').length

  const lastAnalyzed = loading ? '—' : topics.length > 0 ? 'Just now' : 'Never'

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Overview of your content pipeline</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-4">
        <StatCard label="Last Analyzed" value={lastAnalyzed} icon={<ClockIcon />} loading={loading} />
        <StatCard label="Posts Processed" value={String(totalArticles)} icon={<StackIcon />} loading={loading} />
        <StatCard label="Topics Discovered" value={String(topics.length)} icon={<BulbIcon />} loading={loading} />
        <StatCard label="Drafts Ready" value={String(readyDrafts)} icon={<FileIcon />} loading={loading} />
      </div>

      <section>
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
          Pipeline Status
        </h2>
        <div className="rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] divide-y divide-[#2a2a2a]">
          <PipelineRow
            step="Fetch &amp; Analyze"
            state={totalArticles > 0 ? 'completed' : 'pending'}
            detail={totalArticles > 0 ? `${totalArticles} articles from ${topics.length} topics` : 'Not yet run'}
          />
          <PipelineRow
            step="Topic Clustering"
            state={topics.length > 0 ? 'completed' : 'pending'}
            detail={topics.length > 0 ? `${topics.length} topics identified` : 'Waiting for analysis'}
          />
          <PipelineRow
            step="Draft Generation"
            state={drafts.length > 0 ? 'completed' : 'pending'}
            detail={drafts.length > 0 ? `${drafts.length} drafts written` : 'Waiting for topics'}
          />
          <PipelineRow
            step="Review Queue"
            state={readyDrafts > 0 ? 'completed' : 'pending'}
            detail={readyDrafts > 0 ? `${readyDrafts} ready · ${publishedDrafts} published` : 'Awaiting approval'}
          />
        </div>
        <p className="mt-3 text-xs text-zinc-600">
          {lastRun
            ? <>Last checked: <span className="text-zinc-500">Today at {lastRun}</span></>
            : <span className="text-zinc-700">Not yet loaded</span>}
        </p>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string
  value: string
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <div className="rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] px-4 py-5 flex flex-col gap-4">
      <div className="w-8 h-8 rounded-md bg-zinc-700 flex items-center justify-center text-zinc-300">
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
        {loading ? (
          <div className="mt-1 h-6 w-16 rounded bg-zinc-700 animate-pulse" />
        ) : (
          <p className="mt-1 text-xl font-semibold text-white leading-none">{value}</p>
        )}
      </div>
    </div>
  )
}

function PipelineRow({
  step,
  state,
  detail,
}: {
  step: string
  state: 'completed' | 'running' | 'pending'
  detail: string
}) {
  const indicators = {
    completed: { dot: 'bg-emerald-500', label: 'Completed', text: 'text-emerald-400' },
    running:   { dot: 'bg-blue-500 animate-pulse', label: 'Running', text: 'text-blue-400' },
    pending:   { dot: 'bg-zinc-600', label: 'Pending', text: 'text-zinc-500' },
  }
  const { dot, label, text } = indicators[state]

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        <span className="text-sm text-zinc-200">{step}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc-500 hidden sm:block">{detail}</span>
        <span className={`text-xs font-medium ${text}`}>{label}</span>
      </div>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="5" width="13" height="3" rx="1" />
      <rect x="1.5" y="9.5" width="13" height="3" rx="1" />
      <rect x="1.5" y="0.5" width="13" height="3" rx="1" />
    </svg>
  )
}

function BulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.5a4.5 4.5 0 0 1 2.5 8.2V11a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1.3A4.5 4.5 0 0 1 8 1.5z" />
      <line x1="6" y1="13.5" x2="10" y2="13.5" strokeLinecap="round" />
      <line x1="7" y1="15" x2="9" y2="15" strokeLinecap="round" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
      <path d="M10 2v3h3" />
      <line x1="4.5" y1="7.5" x2="11.5" y2="7.5" strokeLinecap="round" />
      <line x1="4.5" y1="10" x2="8.5" y2="10" strokeLinecap="round" />
    </svg>
  )
}
