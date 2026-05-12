'use client'

import { useState } from 'react'
import { analyzePipeline, schedulePipeline, writeDraft, publishDrafts } from '@/lib/api'

type CardState = 'idle' | 'loading' | 'done' | 'error'

type Action = {
  id: string
  title: string
  description: string
  hasInput?: boolean
  inputPlaceholder?: string
}

const ACTIONS: Action[] = [
  {
    id: 'analyze',
    title: 'Analyze',
    description: 'Read new Telegram posts and extract content signals.',
  },
  {
    id: 'schedule',
    title: 'Schedule',
    description: 'Review topics and plan what to write next.',
  },
  {
    id: 'write',
    title: 'Write',
    description: 'Generate a draft article.',
    hasInput: true,
    inputPlaceholder: 'Optional: custom query or angle…',
  },
  {
    id: 'publish',
    title: 'Publish',
    description: 'Send ready drafts to Discourse.',
  },
]

export default function ActionCards() {
  const [states, setStates] = useState<Record<string, CardState>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [queries, setQueries] = useState<Record<string, string>>({})

  async function run(id: string) {
    if (states[id] === 'loading') return
    setStates((s) => ({ ...s, [id]: 'loading' }))
    setErrors((e) => { const next = { ...e }; delete next[id]; return next })

    const apiFns: Record<string, () => Promise<unknown>> = {
      analyze: analyzePipeline,
      schedule: schedulePipeline,
      write: () => writeDraft(queries[id] ?? ''),
      publish: publishDrafts,
    }

    const result = await apiFns[id]()
    const err = result as { error?: boolean; message?: string }

    if (err?.error) {
      setStates((s) => ({ ...s, [id]: 'error' }))
      setErrors((e) => ({ ...e, [id]: err.message ?? 'Something went wrong' }))
    } else {
      setStates((s) => ({ ...s, [id]: 'done' }))
    }
  }

  function reset(id: string) {
    setStates((s) => ({ ...s, [id]: 'idle' }))
    setErrors((e) => { const next = { ...e }; delete next[id]; return next })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ACTIONS.map((action) => {
        const state: CardState = states[action.id] ?? 'idle'
        return (
          <ActionCard
            key={action.id}
            action={action}
            state={state}
            error={errors[action.id]}
            query={queries[action.id] ?? ''}
            onQueryChange={(v) => setQueries((q) => ({ ...q, [action.id]: v }))}
            onRun={() => run(action.id)}
            onReset={() => reset(action.id)}
          />
        )
      })}
    </div>
  )
}

function ActionCard({
  action,
  state,
  error,
  query,
  onQueryChange,
  onRun,
  onReset,
}: {
  action: Action
  state: CardState
  error?: string
  query: string
  onQueryChange: (v: string) => void
  onRun: () => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-col rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] p-5 gap-4">
      {/* Card header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <ActionIcon id={action.id} />
          <h2 className="text-sm font-semibold text-white">{action.title}</h2>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{action.description}</p>
      </div>

      {/* Optional input */}
      {action.hasInput && (
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={action.inputPlaceholder}
          disabled={state === 'loading'}
          className="w-full rounded-md bg-[#111111] border border-[#2a2a2a] focus:border-zinc-500 focus:outline-none px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 transition-colors disabled:opacity-50"
        />
      )}

      {/* Error message */}
      {state === 'error' && error && (
        <p className="text-xs text-red-400 leading-relaxed">{error}</p>
      )}

      {/* Button row */}
      <div className="mt-auto flex items-center justify-between">
        {(state === 'done' || state === 'error') ? (
          <button
            onClick={onReset}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Reset
          </button>
        ) : (
          <span />
        )}
        <RunButton state={state} onRun={onRun} />
      </div>
    </div>
  )
}

function RunButton({ state, onRun }: { state: CardState; onRun: () => void }) {
  if (state === 'error') {
    return (
      <button
        onClick={onRun}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-red-900/40 text-red-400 text-xs font-medium hover:bg-red-900/60 transition-colors"
      >
        Retry
      </button>
    )
  }

  if (state === 'done') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-900/50 text-emerald-400 text-xs font-medium">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6l3 3 5-5" />
        </svg>
        Done
      </span>
    )
  }

  if (state === 'loading') {
    return (
      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-zinc-700 text-zinc-400 text-xs font-medium cursor-not-allowed">
        <Spinner />
        Running…
      </span>
    )
  }

  return (
    <button
      onClick={onRun}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-700 text-zinc-200 text-xs font-medium hover:bg-zinc-600 hover:text-white transition-colors"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <polygon points="2,1 9,5 2,9" />
      </svg>
      Run
    </button>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ActionIcon({ id }: { id: string }) {
  const icons: Record<string, React.ReactNode> = {
    analyze: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400">
        <circle cx="6" cy="6" r="4.5" />
        <path d="M9.5 9.5l3 3" />
      </svg>
    ),
    schedule: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
        <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" />
        <path d="M1.5 6h11" />
        <path d="M4.5 1v3M9.5 1v3" />
      </svg>
    ),
    write: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
        <path d="M2 10.5V12h1.5l6-6L8 4.5l-6 6z" />
        <path d="M9.5 3l1.5 1.5" />
      </svg>
    ),
    publish: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
        <path d="M7 1v8" />
        <path d="M4 4l3-3 3 3" />
        <path d="M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2" />
      </svg>
    ),
  }
  return (
    <span className="w-6 h-6 rounded-md bg-zinc-700 flex items-center justify-center shrink-0">
      {icons[id]}
    </span>
  )
}
